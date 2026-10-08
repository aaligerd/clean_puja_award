import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/session';
import { getImageDisplayUrl } from '@/lib/s3';

export async function GET(request) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession || !adminSession.adminId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access. Admin login required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    const ward = searchParams.get('ward') ? parseInt(searchParams.get('ward'), 10) : null;
    const status = (searchParams.get('status') || 'ALL').toUpperCase();
    const photoFilter = searchParams.get('photoFilter') || 'ALL';
    const sortBy = searchParams.get('sortBy') || 'latest';

    // 1. Build Prisma Where Clause
    const where = {};

    if (q) {
      where.OR = [
        { committeeName: { contains: q } },
        { pujoName: { contains: q } },
        { area: { contains: q } },
        { address: { contains: q } },
        { contactNumber: { contains: q } },
        { email: { contains: q } },
      ];
    }

    if (ward && !isNaN(ward)) {
      where.wardNo = ward;
    }

    if (['REGISTERED', 'SHORTLISTED', 'WINNER', 'REJECTED'].includes(status)) {
      where.status = status;
    }

    // 2. Determine Order By
    let orderBy = { createdAt: 'desc' };
    if (sortBy === 'oldest') orderBy = { createdAt: 'asc' };
    if (sortBy === 'name') orderBy = { committeeName: 'asc' };
    if (sortBy === 'ward') orderBy = { wardNo: 'asc' };
    if (sortBy === 'score') orderBy = { score: 'desc' };

    // 3. Query all matching committees with images
    const committees = await prisma.committee.findMany({
      where,
      orderBy,
      include: {
        images: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // 4. Transform and calculate photo counts
    const mappedCommittees = committees.map((c) => {
      const duringImages = c.images
        .filter((img) => img.phase === 'DURING')
        .map((img) => ({
          ...img,
          displayUrl: getImageDisplayUrl(img.s3Key),
        }));

      const afterImages = c.images
        .filter((img) => img.phase === 'AFTER')
        .map((img) => ({
          ...img,
          displayUrl: getImageDisplayUrl(img.s3Key),
        }));

      return {
        id: c.id,
        committeeName: c.committeeName,
        pujoName: c.pujoName,
        area: c.area,
        address: c.address,
        wardNo: c.wardNo,
        contactNumber: c.contactNumber,
        email: c.email,
        status: c.status,
        score: c.score,
        adminNotes: c.adminNotes,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        counts: {
          duringCount: duringImages.length,
          afterCount: afterImages.length,
          totalCount: duringImages.length + afterImages.length,
        },
        images: {
          during: duringImages,
          after: afterImages,
        },
      };
    });

    // 5. Apply Client Photo Filter if requested
    let filteredCommittees = mappedCommittees;
    if (photoFilter === 'HAS_PHOTOS') {
      filteredCommittees = mappedCommittees.filter((c) => c.counts.totalCount > 0);
    } else if (photoFilter === 'HAS_BOTH') {
      filteredCommittees = mappedCommittees.filter(
        (c) => c.counts.duringCount > 0 && c.counts.afterCount > 0
      );
    } else if (photoFilter === 'ONLY_DURING') {
      filteredCommittees = mappedCommittees.filter(
        (c) => c.counts.duringCount > 0 && c.counts.afterCount === 0
      );
    } else if (photoFilter === 'ONLY_AFTER') {
      filteredCommittees = mappedCommittees.filter(
        (c) => c.counts.afterCount > 0 && c.counts.duringCount === 0
      );
    } else if (photoFilter === 'NO_PHOTOS') {
      filteredCommittees = mappedCommittees.filter((c) => c.counts.totalCount === 0);
    }

    // 6. Overall Stats Calculation (Global stats)
    const [
      totalCount,
      registeredCount,
      shortlistedCount,
      winnerCount,
      allImagesCount,
      duringImagesCount,
      afterImagesCount,
    ] = await Promise.all([
      prisma.committee.count(),
      prisma.committee.count({ where: { status: 'REGISTERED' } }),
      prisma.committee.count({ where: { status: 'SHORTLISTED' } }),
      prisma.committee.count({ where: { status: 'WINNER' } }),
      prisma.image.count(),
      prisma.image.count({ where: { phase: 'DURING' } }),
      prisma.image.count({ where: { phase: 'AFTER' } }),
    ]);

    return NextResponse.json({
      success: true,
      committees: filteredCommittees,
      stats: {
        totalCommittees: totalCount,
        registeredCommittees: registeredCount,
        shortlistedCommittees: shortlistedCount,
        winnerCommittees: winnerCount,
        totalPhotos: allImagesCount,
        duringPhotos: duringImagesCount,
        afterPhotos: afterImagesCount,
      },
    });
  } catch (error) {
    console.error('❌ Admin Committees API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load committee list.' },
      { status: 500 }
    );
  }
}
