import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword } from '@/lib/auth-helpers';
import { signSessionToken, ADMIN_COOKIE_NAME, getCookieOptions } from '@/lib/session';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'ইমেইল এবং পাসওয়ার্ড উভয়ই আবশ্যক।' },
        { status: 400 }
      );
    }

    const cleanedEmail = email.toString().trim().toLowerCase();
    const cleanPassword = password.toString().trim();

    // Find Admin by Email
    const admin = await prisma.admin.findUnique({
      where: { email: cleanedEmail },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'ভুল ইমেইল অথবা পাসওয়ার্ড।' },
        { status: 401 }
      );
    }

    // Verify Password
    const isValid = await comparePassword(cleanPassword, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'ভুল ইমেইল অথবা পাসওয়ার্ড।' },
        { status: 401 }
      );
    }

    // Create Admin JWT Token
    const token = await signSessionToken(
      {
        adminId: admin.id,
        email: admin.email,
        name: admin.name || 'Admin',
        role: admin.role,
      },
      '7d'
    );

    // Create Response and set Admin Cookie directly on response
    const response = NextResponse.json({
      success: true,
      message: 'অ্যাডমিন লগইন সফল হয়েছে!',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });

    response.cookies.set(ADMIN_COOKIE_NAME, token, getCookieOptions());

    return response;
  } catch (error) {
    console.error('❌ Admin Login Error:', error);
    return NextResponse.json(
      { success: false, message: 'লগইন প্রক্রিয়ায় ত্রুটি দেখা দিয়েছে।' },
      { status: 500 }
    );
  }
}
