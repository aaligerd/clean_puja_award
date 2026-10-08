import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { getImageDisplayUrl } from '@/lib/s3';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.committeeId) {
      return NextResponse.json(
        { success: false, message: 'লগইন সেশন পাওয়া যায়নি।' },
        { status: 401 }
      );
    }

    const committee = await prisma.committee.findUnique({
      where: { id: session.committeeId },
      include: {
        images: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!committee) {
      return NextResponse.json(
        { success: false, message: 'কমিটি পাওয়া যায়নি।' },
        { status: 404 }
      );
    }

    // Fetch upload phase settings
    const settings = await prisma.setting.findMany();
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    const mapImageWithUrl = (img) => ({
      ...img,
      displayUrl: getImageDisplayUrl(img.s3Key),
    });

    const duringImages = committee.images
      .filter((img) => img.phase === 'DURING')
      .map(mapImageWithUrl);
    const afterImages = committee.images
      .filter((img) => img.phase === 'AFTER')
      .map(mapImageWithUrl);

    return NextResponse.json({
      success: true,
      committee: {
        id: committee.id,
        committeeName: committee.committeeName,
        pujoName: committee.pujoName,
        area: committee.area,
        address: committee.address,
        wardNo: committee.wardNo,
        contactNumber: committee.contactNumber,
        email: committee.email,
        status: committee.status,
        mustChangePassword: committee.mustChangePassword,
        createdAt: committee.createdAt,
      },
      counts: {
        duringCount: duringImages.length,
        duringMax: parseInt(settingsMap.during_upload_max_limit || '10', 10),
        afterCount: afterImages.length,
        afterMax: parseInt(settingsMap.after_upload_max_limit || '10', 10),
      },
      settings: {
        duringOpen: settingsMap.during_upload_open === 'true',
        afterOpen: settingsMap.after_upload_open === 'true',
        afterDeadline: settingsMap.after_upload_deadline || null,
      },
      images: {
        during: duringImages,
        after: afterImages,
      },
    });
  } catch (error) {
    console.error('❌ /api/me Error:', error);
    return NextResponse.json(
      { success: false, message: 'তথ্য লোড করতে ত্রুটি হয়েছে।' },
      { status: 500 }
    );
  }
}
