import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/session';

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ success: true, message: 'লগআউট সম্পন্ন হয়েছে।' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: false, message: 'লগআউট ব্যর্থ হয়েছে।' }, { status: 500 });
  }
}
