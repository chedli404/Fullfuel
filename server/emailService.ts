import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Email configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || 'infofullfueltv@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  },
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000
});

export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export { transporter };

export const sendVerificationEmail = async (email: string, username: string, token: string) => {
  const verificationUrl = `${process.env.CLIENT_URL || 'https://fullfueltv.online'}/api/auth/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'infofullfueltv@gmail.com',
    to: email,
    subject: 'Verify Your Email - Full Fuel TV',
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#0a0e11;color:#fff;padding:32px 24px;border-radius:14px;">
        <h1 style="color:#00ff40;font-size:28px;margin-bottom:8px;">Welcome to Full Fuel TV</h1>
        <h2 style="color:#fff;font-size:20px;margin:0;">Hello ${username},</h2>
        <p style="color:#cbd5e1;font-size:16px;line-height:1.7;margin-bottom:32px;">Please verify your email address to complete your registration.</p>
        <div style="text-align:center;margin:40px 0;">
          <a href="${verificationUrl}" target="_blank" style="display:inline-block;background:#00ff40;color:#fff;padding:16px 36px;border-radius:8px;font-weight:bold;text-decoration:none;font-size:18px;">🔓 Verify Email Address</a>
        </div>
      </div>
    `
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Send contact message to admin
export const sendContactMessage = async (name: string, email: string, message: string) => {
  const adminEmail = process.env.CONTACT_EMAIL || process.env.EMAIL_USER || 'infofullfueltv@gmail.com';
  const mailOptions = {
    from: process.env.EMAIL_USER || 'infofullfueltv@gmail.com',
    to: adminEmail,
    subject: `New Contact Message from ${name}`,
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#0a0e11;color:#fff;padding:32px 24px;border-radius:14px;">
        <h2 style="color:#00ff40;font-size:22px;margin-bottom:8px;">New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <div style="background:#1e293b;padding:18px 16px;border-radius:8px;margin:16px 0;color:#cbd5e1;">${message || '<i>No message provided</i>'}</div>
      </div>
    `
  };
  
  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Contact email sent successfully:', result.messageId);
  } catch (error) {
    console.error('Error sending contact message:', error);
    throw error;
  }
};

// Send stream notification email
export const sendStreamNotification = async (
  userEmail: string,
  userName: string,
  streamData: any,
  template: any,
  timing: string
) => {
  const timingText = timing === '15min' ? 'in 15 minutes' : 
                    timing === '1hour' ? 'in 1 hour' : 
                    'in 24 hours';
  
  const streamTime = new Date(streamData.scheduledDate).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
  
  const streamUrl = `${process.env.CLIENT_URL || 'https://fullfueltv.online'}/#streams`;
  
  let subject = template.subject
    .replace('{{streamTitle}}', streamData.title)
    .replace('{{timing}}', timingText);
    
  let htmlContent = template.htmlContent
    .replace(/{{streamTitle}}/g, streamData.title)
    .replace(/{{artistName}}/g, streamData.artist)
    .replace(/{{streamTime}}/g, streamTime)
    .replace(/{{timing}}/g, timingText)
    .replace(/{{expectedViewers}}/g, streamData.expectedViewers?.toLocaleString() || '0')
    .replace(/{{streamUrl}}/g, streamUrl);
    
  let textContent = template.textContent
    .replace(/{{streamTitle}}/g, streamData.title)
    .replace(/{{artistName}}/g, streamData.artist)
    .replace(/{{streamTime}}/g, streamTime)
    .replace(/{{timing}}/g, timingText)
    .replace(/{{expectedViewers}}/g, streamData.expectedViewers?.toLocaleString() || '0')
    .replace(/{{streamUrl}}/g, streamUrl);
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'infofullfueltv@gmail.com',
    to: userEmail,
    subject: subject,
    html: htmlContent,
    text: textContent
  };
  
  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Stream notification sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending stream notification:', error);
    throw error;
  }
};
