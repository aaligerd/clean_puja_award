import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { generateS3Key, getPresignedUploadUrl } from '@/lib/s3';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || !session.committeeId) {
      return NextResponse.json(
        { success: false, message: 'অননুমোদিত অনুরোধ। দয়া করে লগইন করুন।' },
        { status: 401 }
      );
    }

    const { phase, filename, contentType, sizeBytes } = await request.json();

    if (!phase || !['DURING', 'AFTER'].includes(phase)) {
      return NextResponse.json(
        { success: false, message: 'সঠিক ফটো ফেজ নির্বাচন করুন (DURING অথবা AFTER)।' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!contentType || !allowedTypes.includes(contentType.toLowerCase())) {
      return NextResponse.json(
        { success: false, message: 'কেবলমাত্র JPG, PNG অথবা WebP ফরম্যাটের ছবি আপলোড করা যাবে।' },
        { status: 400 }
      );
    }

    // Max 10MB per image
    if (sizeBytes && sizeBytes > 10 * 1024 * 1024) {
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

    // Check Existing Images Count for this phase
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

    // Fetch committee details for clean name
    const committee = await prisma.committee.findUnique({
      where: { id: session.committeeId },
      select: { committeeName: true },
    });

    const s3Key = generateS3Key({
      committeeName: committee?.committeeName || session.committeeName,
      phase,
      originalFilename: filename,
    });

    const { uploadUrl } = await getPresignedUploadUrl({
      s3Key,
      contentType,
      expiresIn: 300, // 5 minutes
    });

    return NextResponse.json({
      success: true,
      uploadUrl,
      s3Key,
      phase,
    });
  } catch (error) {
    console.error('❌ Presign API Error:', error);
    return NextResponse.json(
      { success: false, message: 'প্রি-সাইন ইউআরএল তৈরি করতে ব্যর্থ হয়েছে।' },
      { status: 500 }
    );
  }
}
