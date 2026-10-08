import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/session';
import { getImageDisplayUrl } from '@/lib/s3';

export async function GET(request, { params }) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession || !adminSession.adminId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Committee ID is required.' },
        { status: 400 }
      );
    }

    const committee = await prisma.committee.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!committee) {
      return NextResponse.json(
        { success: false, message: 'Committee not found.' },
        { status: 404 }
      );
    }

    const mapImage = (img) => ({
      ...img,
      displayUrl: getImageDisplayUrl(img.s3Key),
    });

    const duringImages = committee.images
      .filter((img) => img.phase === 'DURING')
      .map(mapImage);
    const afterImages = committee.images
      .filter((img) => img.phase === 'AFTER')
      .map(mapImage);

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
        score: committee.score,
        adminNotes: committee.adminNotes,
        createdAt: committee.createdAt,
        updatedAt: committee.updatedAt,
      },
      counts: {
        duringCount: duringImages.length,
        afterCount: afterImages.length,
        totalCount: duringImages.length + afterImages.length,
      },
      images: {
        during: duringImages,
        after: afterImages,
      },
    });
  } catch (error) {
    console.error('❌ Admin Committee Detail API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load committee details.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession || !adminSession.adminId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, score, adminNotes } = body;

    const dataToUpdate = {};

    if (status && ['REGISTERED', 'SHORTLISTED', 'WINNER', 'REJECTED'].includes(status)) {
      dataToUpdate.status = status;
    }

    if (score !== undefined) {
      dataToUpdate.score = score === null || score === '' ? null : parseFloat(score);
    }

    if (adminNotes !== undefined) {
      dataToUpdate.adminNotes = adminNotes === null ? null : adminNotes.toString();
    }

    const updated = await prisma.committee.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      message: 'Committee evaluation and status updated successfully!',
      committee: updated,
    });
  } catch (error) {
    console.error('❌ Admin Update Committee Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update committee evaluation.' },
      { status: 500 }
    );
  }
}
