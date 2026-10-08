import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { deleteS3Object } from '@/lib/s3';

export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session || !session.committeeId) {
      return NextResponse.json(
        { success: false, message: 'অননুমোদিত অনুরোধ। দয়া করে লগইন করুন।' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const image = await prisma.image.findUnique({
      where: { id },
    });

    if (!image) {
      return NextResponse.json(
        { success: false, message: 'ছবিটি পাওয়া যায়নি।' },
        { status: 404 }
      );
    }

    // Security check: Committee can only delete its own photos
    if (image.committeeId !== session.committeeId) {
      return NextResponse.json(
        { success: false, message: 'আপনার এই ছবিটি মুছে ফেলার অনুমতি নেই।' },
        { status: 403 }
      );
    }

    // 1. Delete from S3
    try {
      await deleteS3Object(image.s3Key);
    } catch (s3Err) {
      console.warn('⚠️ S3 delete warning (file may not exist in bucket):', s3Err.message);
    }

    // 2. Delete record from MySQL
    await prisma.image.delete({
      where: { id: image.id },
    });

    return NextResponse.json({
      success: true,
      message: 'ছবি সফলভাবে মুছে ফেলা হয়েছে।',
    });
  } catch (error) {
    console.error('❌ Delete Image Error:', error);
    return NextResponse.json(
      { success: false, message: 'ছবি মুছে ফেলতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
