import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'অ্যাডমিন সেশন সফলভাবে লগআউট হয়েছে।',
    });

    response.cookies.delete('admin_session');
    return response;
  } catch (error) {
    console.error('❌ Admin Logout Error:', error);
    return NextResponse.json(
      { success: false, message: 'লগআউট ব্যর্থ হয়েছে।' },
      { status: 500 }
    );
  }
}
