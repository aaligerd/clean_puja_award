import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || !session.committeeId) {
      return NextResponse.json(
        { success: false, message: 'অননুমোদিত অনুরোধ। দয়া করে লগইন করুন।' },
        { status: 401 }
      );
    }

    const {
      phase,
      s3Key,
      originalFilename,
      sizeBytes,
      mimeType,
      takenAt,
    } = await request.json();

    if (!phase || !s3Key || !originalFilename || !sizeBytes) {
      return NextResponse.json(
        { success: false, message: 'ছবির তথ্য অসম্পূর্ণ।' },
        { status: 400 }
      );
    }

    // Check count limit
    const limitKey = phase === 'DURING' ? 'during_upload_max_limit' : 'after_upload_max_limit';
    const limitSetting = await prisma.setting.findUnique({ where: { key: limitKey } });
    const maxLimit = parseInt(limitSetting?.value || '10', 10);

    const count = await prisma.image.count({
      where: {
        committeeId: session.committeeId,
        phase,
      },
    });

    if (count >= maxLimit) {
      return NextResponse.json(
        { success: false, message: `সর্বোচ্চ ${maxLimit}টি ছবির সীমা অতিক্রম করেছে।` },
        { status: 400 }
      );
    }

    // Save image metadata in MySQL
    const image = await prisma.image.create({
      data: {
        committeeId: session.committeeId,
        phase,
        s3Key,
        originalFilename,
        sizeBytes: parseInt(sizeBytes, 10),
        mimeType: mimeType || 'image/jpeg',
        takenAt: takenAt ? new Date(takenAt) : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'ছবি সফলভাবে সংরক্ষণ করা হয়েছে!',
      image,
    });
  } catch (error) {
    console.error('❌ Image Confirm Error:', error);
    return NextResponse.json(
      { success: false, message: 'ছবির রেকর্ড সংরক্ষণ করতে ব্যর্থ হয়েছে।' },
      { status: 500 }
    );
  }
}
