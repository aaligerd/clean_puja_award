import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { s3Client, BUCKET_NAME } from '@/lib/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';

export async function GET(request, { params }) {
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

    // Authorization check
    if (image.committeeId !== session.committeeId) {
      return NextResponse.json(
        { success: false, message: 'আপনার এই ছবিটি ডাউনলোড করার অনুমতি নেই।' },
        { status: 403 }
      );
    }

    // Fetch object stream from AWS S3
    const s3Command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: image.s3Key,
    });

    const s3Response = await s3Client.send(s3Command);
    const stream = s3Response.Body;

    // Encode filename for safe Content-Disposition in all browsers
    const encodedFilename = encodeURIComponent(image.originalFilename);

    return new NextResponse(stream, {
      headers: {
        'Content-Type': image.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${image.originalFilename}"; filename*=UTF-8''${encodedFilename}`,
        'Content-Length': image.sizeBytes ? String(image.sizeBytes) : undefined,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('❌ Download API Error:', error);
    return NextResponse.json(
      { success: false, message: 'ছবি ডাউনলোড করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
