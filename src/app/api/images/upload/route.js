import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { generateS3Key, s3Client, BUCKET_NAME, getImageDisplayUrl } from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || !session.committeeId) {
      return NextResponse.json(
        { success: false, message: 'অননুমোদিত অনুরোধ। দয়া করে লগইন করুন।' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const phase = formData.get('phase');

    if (!file || !phase || !['DURING', 'AFTER'].includes(phase)) {
      return NextResponse.json(
        { success: false, message: 'ফাইল এবং সঠিক ফেজ (DURING অথবা AFTER) আবশ্যক।' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const mimeType = file.type || 'image/jpeg';
    if (!allowedTypes.includes(mimeType.toLowerCase())) {
      return NextResponse.json(
        { success: false, message: 'কেবলমাত্র JPG, PNG অথবা WebP ফরম্যাটের ছবি আপলোড করা যাবে।' },
        { status: 400 }
      );
    }

    // Max 10MB
    const sizeBytes = file.size;
    if (sizeBytes > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'ছবির সাইজ সর্বোচ্চ ১০ MB হতে পারবে।' },
        { status: 400 }
      );
    }

    // Check Settings for Phase Open/Close
    const settingKey = phase === 'DURING' ? 'during_upload_open' : 'after_upload_open';
    const limitKey = phase === 'DURING' ? 'during_upload_max_limit' : 'after_upload_max_limit';

    const [phaseSetting, limitSetting] = await Promise.all([
      prisma.setting.findUnique({ where: { key: settingKey } }),
      prisma.setting.findUnique({ where: { key: limitKey } }),
    ]);

    if (phaseSetting && phaseSetting.value.toLowerCase() === 'false') {
      const phaseName = phase === 'DURING' ? 'পূজা চলাকালীন' : 'পূজা পরবর্তী';
      return NextResponse.json(
        { success: false, message: `বর্তমানে ${phaseName} ফটো আপলোড উইন্ডো বন্ধ রয়েছে।` },
        { status: 403 }
      );
    }

    const maxLimit = parseInt(limitSetting?.value || '10', 10);

    // Check Existing Count
    const currentCount = await prisma.image.count({
      where: {
        committeeId: session.committeeId,
        phase: phase,
      },
    });

    if (currentCount >= maxLimit) {
      return NextResponse.json(
        {
          success: false,
          message: `আপনি ইতিমধ্যে এই ফেজে সর্বোচ্চ ${maxLimit}টি ছবি আপলোড করে ফেলেছেন।`,
        },
        { status: 400 }
      );
    }

    // Fetch Committee details
    const committee = await prisma.committee.findUnique({
      where: { id: session.committeeId },
      select: { committeeName: true },
    });

    // Generate S3 Key: clean-pujo/{committee_name}/before or clean-pujo/{committee_name}/after
    const s3Key = generateS3Key({
      committeeName: committee?.committeeName || session.committeeName,
      phase,
      originalFilename: file.name,
    });

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to AWS S3 Server-side
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: buffer,
        ContentType: mimeType,
      })
    );

    // Save metadata to MySQL
    const image = await prisma.image.create({
      data: {
        committeeId: session.committeeId,
        phase,
        s3Key,
        originalFilename: file.name,
        sizeBytes: sizeBytes,
        mimeType: mimeType,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'ছবি সফলভাবে আপলোড ও সংরক্ষণ করা হয়েছে!',
      image: {
        ...image,
        displayUrl: getImageDisplayUrl(image.s3Key),
      },
    });
  } catch (error) {
    console.error('❌ Upload API Error:', error);
    return NextResponse.json(
      { success: false, message: 'ছবি আপলোড করতে ব্যর্থ হয়েছে। দয়া করে পুনরায় চেষ্টা করুন।' },
      { status: 500 }
    );
  }
}
