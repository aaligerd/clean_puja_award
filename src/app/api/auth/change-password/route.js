import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { comparePassword, hashPassword } from '@/lib/auth-helpers';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || !session.committeeId) {
      return NextResponse.json(
        { success: false, message: 'অননুমোদিত অনুরোধ। দয়া করে পুনরায় লগইন করুন।' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'সমস্ত ক্ষেত্র পূরণ করা আবশ্যক।' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না।' },
        { status: 400 }
      );
    }

    const committee = await prisma.committee.findUnique({
      where: { id: session.committeeId },
    });

    if (!committee) {
      return NextResponse.json(
        { success: false, message: 'কমিটি অ্যাকাউন্ট পাওয়া যায়নি।' },
        { status: 404 }
      );
    }

    const isMatch = await comparePassword(currentPassword, committee.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'বর্তমান পাসওয়ার্ডটি সঠিক নয়।' },
        { status: 400 }
      );
    }

    // Hash and save new password
    const newHash = await hashPassword(newPassword);
    await prisma.committee.update({
      where: { id: committee.id },
      data: {
        passwordHash: newHash,
        mustChangePassword: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!',
    });
  } catch (error) {
    console.error('❌ Change Password Error:', error);
    return NextResponse.json(
      { success: false, message: 'পাসওয়ার্ড পরিবর্তনে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
