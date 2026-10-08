import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/session';

export async function GET() {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession || !adminSession.adminId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access.' },
        { status: 401 }
      );
    }

    const committees = await prisma.committee.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        images: true,
      },
    });

    // Generate CSV Rows with UTF-8 BOM for Excel character rendering
    const headers = [
      'ID',
      'Committee Name',
      'Puja Name',
      'KMC Ward No',
      'Area',
      'Address',
      'Contact Number',
      'Email ID',
      'Status',
      'Score',
      'Jury Notes',
      'During Puja Photos',
      'After Puja Photos',
      'Total Photos',
      'Registration Date',
    ];

    const escapeCsv = (field) => {
      if (field === null || field === undefined) return '""';
      const str = field.toString().replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = committees.map((c) => {
      const duringCount = c.images.filter((img) => img.phase === 'DURING').length;
      const afterCount = c.images.filter((img) => img.phase === 'AFTER').length;
      const totalCount = duringCount + afterCount;

      return [
        escapeCsv(c.id),
        escapeCsv(c.committeeName),
        escapeCsv(c.pujoName),
        escapeCsv(c.wardNo),
        escapeCsv(c.area),
        escapeCsv(c.address),
        escapeCsv(c.contactNumber),
        escapeCsv(c.email),
        escapeCsv(c.status),
        escapeCsv(c.score ?? ''),
        escapeCsv(c.adminNotes ?? ''),
        escapeCsv(duringCount),
        escapeCsv(afterCount),
        escapeCsv(totalCount),
        escapeCsv(new Date(c.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })),
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="clean_puja_committees_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('❌ Admin CSV Export Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to export CSV.' },
      { status: 500 }
    );
  }
}
