import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword } from '@/lib/auth-helpers';
import { signSessionToken, COOKIE_NAME, ADMIN_COOKIE_NAME, getCookieOptions } from '@/lib/session';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'ইমেইল এবং পাসওয়ার্ড উভয়ই আবশ্যক।' },
        { status: 400 }
      );
    }

    const cleanedEmail = email.toString().trim().toLowerCase();
    const cleanPassword = password.toString().trim();

    // 1. Find committee by email
    const committee = await prisma.committee.findUnique({
      where: { email: cleanedEmail },
    });

    if (committee) {
      // Verify committee password
      const isMatch = await comparePassword(cleanPassword, committee.passwordHash);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, message: 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।' },
          { status: 401 }
        );
      }

      // Create Committee Session Token
      const token = await signSessionToken({
        committeeId: committee.id,
        email: committee.email,
        committeeName: committee.committeeName,
        pujoName: committee.pujoName,
      });

      const response = NextResponse.json({
        success: true,
        isAdmin: false,
        redirect: '/dashboard',
        message: 'লগইন সফল হয়েছে!',
        committee: {
          id: committee.id,
          committeeName: committee.committeeName,
          pujoName: committee.pujoName,
          email: committee.email,
          wardNo: committee.wardNo,
          area: committee.area,
          status: committee.status,
          mustChangePassword: committee.mustChangePassword,
        },
      });

      response.cookies.set(COOKIE_NAME, token, getCookieOptions());

      return response;
    }

    // 2. If not committee, check if this is an Admin logging in
    const admin = await prisma.admin.findUnique({
      where: { email: cleanedEmail },
    });

    if (admin) {
      const isAdminMatch = await comparePassword(cleanPassword, admin.passwordHash);
      if (!isAdminMatch) {
        return NextResponse.json(
          { success: false, message: 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।' },
          { status: 401 }
        );
      }

      const adminToken = await signSessionToken(
        {
          adminId: admin.id,
          email: admin.email,
          name: admin.name || 'Admin',
          role: admin.role,
        },
        '7d'
      );

      const response = NextResponse.json({
        success: true,
        isAdmin: true,
        redirect: '/admin',
        message: 'অ্যাডমিন লগইন সফল হয়েছে!',
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      });

      response.cookies.set(ADMIN_COOKIE_NAME, adminToken, getCookieOptions());

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।' },
      { status: 401 }
    );
  } catch (error) {
    console.error('❌ Login API Error:', error);
    return NextResponse.json(
      { success: false, message: 'লগইন প্রক্রিয়ায় ত্রুটি দেখা দিয়েছে।' },
      { status: 500 }
    );
  }
}
