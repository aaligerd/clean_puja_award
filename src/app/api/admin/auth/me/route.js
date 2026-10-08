import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session || !session.adminId) {
      return NextResponse.json(
        { success: false, message: 'Admin session not found.' },
        { status: 401 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { id: session.adminId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Admin account not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error('❌ Admin Me API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load admin profile.' },
      { status: 500 }
    );
  }
}
