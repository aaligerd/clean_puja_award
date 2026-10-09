import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateRandomPassword, hashPassword } from '@/lib/auth-helpers';
import { sendRegistrationCredentialsEmail } from '@/lib/mail';

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      committeeName,
      pujoName,
      area,
      zone,
      address,
      wardNo,
      contactPerson,
      contactNumber,
      email,
    } = body;

    // 1. Validation
    const errors = {};

    if (!pujoName || typeof pujoName !== 'string' || !pujoName.trim()) {
      errors.pujoName = 'পূজার নাম আবশ্যক।';
    } else if (pujoName.trim().length > 150) {
      errors.pujoName = 'পূজার নাম সর্বোচ্চ ১৫০ অক্ষরের মধ্যে হতে হবে।';
    }

    if (!committeeName || typeof committeeName !== 'string' || !committeeName.trim()) {
      errors.committeeName = 'পূজা কমিটির নাম আবশ্যক।';
    } else if (committeeName.trim().length > 150) {
      errors.committeeName = 'কমিটির নাম সর্বোচ্চ ১৫০ অক্ষরের মধ্যে হতে হবে।';
    }

    if (!area || typeof area !== 'string' || !area.trim()) {
      errors.area = 'এলাকা বা লোকালিটির নাম আবশ্যক।';
    } else if (area.trim().length > 150) {
      errors.area = 'এলাকার নাম সর্বোচ্চ ১৫০ অক্ষরের মধ্যে হতে হবে।';
    }

    const validZones = ['North Kolkata', 'Central Kolkata', 'South Kolkata'];
    if (!zone || !validZones.includes(zone.toString().trim())) {
      errors.zone = 'সঠিক জোন নির্বাচন করুন (North Kolkata, Central Kolkata, বা South Kolkata)।';
    }

    const ward = parseInt(wardNo, 10);
    if (isNaN(ward) || ward < 1 || ward > 144) {
      errors.wardNo = '১ থেকে ১৪৪ এর মধ্যে সঠিক কলকাতা পুরসভা ওয়ার্ড নম্বর নির্বাচন করুন।';
    }

    if (!address || typeof address !== 'string' || !address.trim()) {
      errors.address = 'প্যান্ডেলের সম্পূর্ণ ঠিকানা আবশ্যক।';
    } else if (address.trim().length > 300) {
      errors.address = 'ঠিকানা সর্বোচ্চ ৩০০ অক্ষরের মধ্যে হতে হবে।';
    }

    if (!contactPerson || typeof contactPerson !== 'string' || !contactPerson.trim()) {
      errors.contactPerson = 'কমিটির দায়িত্বপ্রাপ্ত ব্যক্তির নাম আবশ্যক।';
    } else if (contactPerson.trim().length > 150) {
      errors.contactPerson = 'দায়িত্বপ্রাপ্ত ব্যক্তির নাম সর্বোচ্চ ১৫০ অক্ষরের মধ্যে হতে হবে।';
    }

    const cleanedContact = (contactNumber || '').toString().trim().replace(/[\s-]/g, '');
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!cleanedContact) {
      errors.contactNumber = '১০ সংখ্যার মোবাইল নম্বর আবশ্যক।';
    } else if (!phoneRegex.test(cleanedContact)) {
      errors.contactNumber = 'সঠিক ১০ সংখ্যার ভারতীয় মোবাইল নম্বর দিন (উদাঃ 9830012345)।';
    }

    const cleanedEmail = (email || '').toString().trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanedEmail) {
      errors.email = 'ইমেইল ঠিকানা আবশ্যক।';
    } else if (!emailRegex.test(cleanedEmail)) {
      errors.email = 'সঠিক ইমেইল ঠিকানা দিন (উদাঃ committee@gmail.com)।';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ফর্মের তথ্যগুলি সঠিকভাবে পূরণ করুন।',
          errors,
        },
        { status: 400 }
      );
    }

    // 2. Check if registration is open in application settings
    const regSetting = await prisma.setting.findUnique({
      where: { key: 'registration_open' },
    });

    if (regSetting && regSetting.value.toLowerCase() === 'false') {
      return NextResponse.json(
        {
          success: false,
          message: 'বর্তমানে রেজিস্ট্রেশন প্রক্রিয়া বন্ধ রয়েছে।',
        },
        { status: 403 }
      );
    }

    // 3. Check for Duplicate Email
    const existingCommittee = await prisma.committee.findUnique({
      where: { email: cleanedEmail },
    });

    if (existingCommittee) {
      return NextResponse.json(
        {
          success: false,
          message: 'এই ইমেইল ঠিকানাটি ইতিমধ্যে নিবন্ধিত রয়েছে। অনুগ্রহ করে লগইন করুন।',
          errors: {
            email: 'এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে।',
          },
        },
        { status: 409 }
      );
    }

    // 4. Generate Random Password & Hash
    const rawPassword = generateRandomPassword(10);
    const passwordHash = await hashPassword(rawPassword);

    // 5. Create Committee in Database
    const newCommittee = await prisma.committee.create({
      data: {
        committeeName: committeeName.trim(),
        pujoName: pujoName.trim(),
        area: area.trim(),
        zone: zone ? zone.toString().trim() : null,
        address: address.trim(),
        wardNo: ward,
        contactPerson: contactPerson ? contactPerson.trim() : null,
        contactNumber: cleanedContact,
        email: cleanedEmail,
        passwordHash: passwordHash,
        mustChangePassword: true,
        status: 'REGISTERED',
      },
    });

    // 6. Send Credentials Email
    const emailResult = await sendRegistrationCredentialsEmail({
      committeeId: newCommittee.id,
      email: cleanedEmail,
      committeeName: newCommittee.committeeName,
      pujoName: newCommittee.pujoName,
      password: rawPassword,
    });

    return NextResponse.json({
      success: true,
      message: 'আপনার রেজিস্ট্রেশন সফল হয়েছে!',
      data: {
        committeeId: newCommittee.id,
        email: newCommittee.email,
        committeeName: newCommittee.committeeName,
        pujoName: newCommittee.pujoName,
        password: rawPassword,
        emailDispatched: emailResult.success,
      },
    });
  } catch (error) {
    console.error('❌ Registration API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'রেজিস্ট্রেশন প্রক্রিয়ায় ত্রুটি দেখা দিয়েছে। দয়া করে পুনরায় চেষ্টা করুন।',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
