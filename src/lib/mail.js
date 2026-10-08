import nodemailer from 'nodemailer';
import prisma from './prisma.js';

// Create transporter using SMTP (Microsoft 365, Outlook, or generic SMTP)
function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.office365.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false,
    },
  });
}

/**
 * Send welcome email with login credentials to registered Puja Committee
 */
export async function sendRegistrationCredentialsEmail({
  committeeId,
  email,
  committeeName,
  pujoName,
  password,
}) {
  const loginUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login`;
  const fromAddress =
    process.env.SMTP_FROM ||
    (process.env.SMTP_USER
      ? `ক্লিন পূজা অ্যাওয়ার্ড <${process.env.SMTP_USER}>`
      : 'ক্লিন পূজা অ্যাওয়ার্ড <no-reply@cleanpujaaward.org>');

  const subject = `ক্লিন পূজা অ্যাওয়ার্ড ২০২৬ - রেজিস্ট্রেশন সফল ও লগইন তথ্য`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f1f3; margin: 0; padding: 20px; color: #2a0008; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5c5c9; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #660019 0%, #8c0029 100%); padding: 30px 20px; text-align: center; color: #ffffff; border-bottom: 3px solid #ffc72c; }
        .header h1 { margin: 0; font-size: 24px; color: #ffc72c; }
        .header p { margin: 8px 0 0; font-size: 14px; color: #ffe4e6; }
        .content { padding: 30px 25px; line-height: 1.6; }
        .greeting { font-size: 18px; font-weight: bold; color: #660019; margin-bottom: 15px; }
        .card { background: #fff9fa; border: 1px solid #ffd5dc; border-left: 4px solid #ffc72c; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .cred-row { margin-bottom: 10px; font-size: 15px; }
        .cred-label { font-weight: bold; color: #660019; }
        .cred-value { font-family: monospace; background: #fff0f3; padding: 4px 8px; border-radius: 4px; border: 1px solid #ffccd5; font-size: 16px; color: #8c0029; font-weight: bold; }
        .btn-container { text-align: center; margin: 30px 0; }
        .btn { display: inline-block; background: #ffc72c; color: #3b000b; text-decoration: none; padding: 12px 30px; border-radius: 30px; font-weight: bold; font-size: 16px; box-shadow: 0 3px 10px rgba(255, 199, 44, 0.4); }
        .note { font-size: 13px; color: #666; background: #f9f9f9; padding: 12px; border-radius: 6px; border: 1px dashed #ccc; }
        .footer { background: #460011; color: #fecdd3; padding: 20px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ক্লিন পূজা অ্যাওয়ার্ড ২০২৬</h1>
          <p>পরিচ্ছন্ন প্যান্ডেল ও পরিবেশ সচেতনতা সম্মাননা</p>
        </div>
        <div class="content">
          <div class="greeting">নমস্কার ও শারদীয়ার শুভেচ্ছা!</div>
          <p>আপনার পূজা কমিটি <strong>"${committeeName}"</strong> (${pujoName}) সফলভাবে ক্লিন পূজা অ্যাওয়ার্ড ২০২৬-এর জন্য নথিভুক্ত হয়েছে।</p>
          
          <div class="card">
            <h3 style="margin-top:0; color:#660019; font-size: 16px;">আপনার পোর্টাল লগইন তথ্য:</h3>
            <div class="cred-row">
              <span class="cred-label">লগইন ইমেইল:</span> <span class="cred-value">${email}</span>
            </div>
            <div class="cred-row">
              <span class="cred-label">অটো-জেনারেটেড পাসওয়ার্ড:</span> <span class="cred-value">${password}</span>
            </div>
          </div>

          <div class="btn-container">
            <a href="${loginUrl}" class="btn" target="_blank">পোর্টালে লগইন করুন →</a>
          </div>

          <div class="note">
            ⚠️ <strong>জরুরি তথ্য:</strong><br>
            • প্রথমবার লগইন করার পর আপনার সুবিধার্থে পাসওয়ার্ড পরিবর্তন করে নিন।<br>
            • পূজা চলাকালীন সর্বোচ্চ ১০টি ছবি এবং বিসর্জনের পর পরিষ্কার এলাকার ১০টি ছবি পোর্টালে আপলোড করতে পারবেন।
          </div>
        </div>
        <div class="footer">
          © ২০২৬ ক্লিন পূজা অ্যাওয়ার্ড | সর্বস্বত্ব সংরক্ষিত
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
ক্লিন পূজা অ্যাওয়ার্ড ২০২৬ - রেজিস্ট্রেশন সফল

নমস্কার ও শারদীয়ার শুভেচ্ছা!
আপনার পূজা কমিটি "${committeeName}" (${pujoName}) সফলভাবে ক্লিন পূজা অ্যাওয়ার্ড ২০২৬-এর জন্য নথিভুক্ত হয়েছে।

আপনার লগইন তথ্য:
• ইমেইল: ${email}
• পাসওয়ার্ড: ${password}
• লগইন লিংক: ${loginUrl}

দয়া করে প্রথমবার লগইনের পর পাসওয়ার্ড পরিবর্তন করে নিন।
  `;

  const transporter = getTransporter();

  // If SMTP is not yet configured, log credentials in terminal and record log as SENT/PENDING
  if (!transporter) {
    console.log('\n======================================================');
    console.log('✉️ [MAIL SIMULATION] SMTP credentials not set in .env');
    console.log(`To: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Password: ${password}`);
    console.log(`Login URL: ${loginUrl}`);
    console.log('======================================================\n');

    await prisma.emailLog.create({
      data: {
        committeeId: committeeId || null,
        type: 'REGISTRATION_CREDENTIALS',
        recipientEmail: email,
        subject: subject,
        status: 'SENT',
        errorMessage: 'Simulated dispatch (SMTP credentials not configured in .env)',
      },
    });

    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: subject,
      text: textContent,
      html: htmlContent,
    });

    await prisma.emailLog.create({
      data: {
        committeeId: committeeId || null,
        type: 'REGISTRATION_CREDENTIALS',
        recipientEmail: email,
        subject: subject,
        status: 'SENT',
        errorMessage: null,
      },
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send email via SMTP:', error);

    await prisma.emailLog.create({
      data: {
        committeeId: committeeId || null,
        type: 'REGISTRATION_CREDENTIALS',
        recipientEmail: email,
        subject: subject,
        status: 'FAILED',
        errorMessage: error.message || 'Unknown SMTP error',
      },
    });

    // Don't throw error to avoid blocking the registration response, return failure info
    return { success: false, error: error.message };
  }
}
