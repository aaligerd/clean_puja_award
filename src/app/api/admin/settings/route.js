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

    const settings = await prisma.setting.findMany();
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      settings: settingsMap,
    });
  } catch (error) {
    console.error('❌ Admin Settings GET Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load system settings.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession || !adminSession.adminId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Valid settings data is required.' },
        { status: 400 }
      );
    }

    // Upsert each setting
    const updates = Object.entries(settings).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: value.toString() },
        create: { key, value: value.toString() },
      })
    );

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: 'System configuration updated successfully!',
    });
  } catch (error) {
    console.error('❌ Admin Settings POST Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save system configuration.' },
      { status: 500 }
    );
  }
}
