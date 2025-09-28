// Send contact message to admin
export const sendContactMessage = async (name: string, email: string, message: string) => {
  const adminEmail = process.env.CONTACT_EMAIL || process.env.EMAIL_USER || 'infofullfueltv@gmail.com';
  const accentColor = '#00ff40';
  const mailOptions = {
    from: process.env.EMAIL_USER || 'infofullfueltv@gmail.com',
    to: adminEmail,
    subject: `New Contact Message from ${name}`,
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#0a0e11;color:#fff;padding:32px 24px;border-radius:14px;box-shadow:0 4px 32px rgba(29, 245, 18, 0.13);">
        <h2 style="color:${accentColor};font-size:22px;margin-bottom:8px;">New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <div style="background:#1e293b;padding:18px 16px;border-radius:8px;margin:16px 0;color:#cbd5e1;">${message || '<i>No message provided</i>'}</div>
        <p style="color:#64748b;font-size:13px;margin-top:32px;">This message was sent from the Full Fuel TV About page contact form.</p>
      </div>
    `
  };
  try {
    console.log('Sending contact message to admin:', adminEmail);
    const result = await transporter.sendMail(mailOptions);
    console.log('Contact email sent successfully:', result.messageId);
  } catch (error) {
    console.error('Error sending contact message:', error);
    throw error;
  }
};
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Email configuration with better error handling
const transporter = nodemailer.createTransport({
 host: 'smtp.gmail.com',
  port: 465, // Try SSL port instead of 587
  secure: true, // Use SSL  auth: {
    user: process.env.EMAIL_USER || 'infofullfueltv@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  },
  // Add connection timeout and retry options for production
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000
});

// Test email configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export { transporter };

// Send stream notification email
export const sendStreamNotification = async (
  userEmail: string,
  userName: string,
  streamData: any,
  template: any,
  timing: string
) => {
  // Replace template variables
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
  
  // Replace variables in template
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
    console.log('Sending stream notification to:', userEmail);
    const result = await transporter.sendMail(mailOptions);
    console.log('Stream notification sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending stream notification:', error);
    throw error;
  }
};

export const sendVerificationEmail = async (email: string, username: string, token: string) => {
  // Fix: Use the correct backend URL for verification
  const backendUrl = process.env.BACKEND_URL || process.env.CLIENT_URL || 'https://fullfueltv.online';
  const verificationUrl = `${backendUrl}/api/auth/verify-email?token=${token}`;
  console.log('Verification URL:', verificationUrl);
  console.log('Email config:', {
    user: process.env.EMAIL_USER,
    passLength: process.env.EMAIL_PASS?.length,
    clientUrl: process.env.CLIENT_URL,
    backendUrl: backendUrl
  });

  // FullFuelTV branding
  const logoUrl = 'https://scontent-dub4-1.xx.fbcdn.net/v/t39.30808-1/432924633_915835900547362_4817121139309060747_n.jpg?stp=c176.412.883.882a_dst-jpg_s200x200_tt6&_nc_cat=109&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=2FBnAPZhAJoQ7kNvwGxP55C&_nc_oc=AdkVL4H0ZOmxh32zkQLfRDyJe2xt0kG4bYNeIYGqo2_7DkDv0crOcvEoQ1SHhwlvyZG-Tdi9icOHUsiEa9TP61JH&_nc_zt=24&_nc_ht=scontent-dub4-1.xx&_nc_gid=cXVB9VpguS6yLwoJDG72zQ&oh=00_AfY1FRUDVqakjyaS9GwuHpWVSO3McYoQpbMzUAez9TEBkw&oe=68D7A083'; // Replace with your actual logo URL if available
  const accentColor = '#00ff40';
  const mailOptions = {
    from: process.env.EMAIL_USER || 'infofullfueltv@gmail.com',
    to: email,
    subject: 'Verify Your Email - Full Fuel TV',
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#0a0e11;color:#fff;padding:32px 24px;border-radius:14px;box-shadow:0 4px 32px rgba(29, 245, 18, 0.13);">
        <div style="text-align:center;margin-bottom:32px;">
          <img src="${logoUrl}" alt="FullFuelTV Logo" style="height:56px;margin-bottom:16px;"/>
          <h1 style="color:${accentColor};font-size:28px;margin-bottom:8px;">Welcome to Full Fuel TV</h1>
          <h2 style="color:#fff;font-size:20px;margin:0;">Hello ${username},</h2>
        </div>
        <p style="color:#cbd5e1;font-size:16px;line-height:1.7;margin-bottom:32px;">Thank you for joining Full Fuel TV Please verify your email address to complete your registration and unlock exclusive content, live events, and more.</p>
        <div style="text-align:center;margin:40px 0;">
          <a href="${verificationUrl}" target="_blank" style="display:inline-block;background:${accentColor};color:#fff;padding:16px 36px;border-radius:8px;font-weight:bold;text-decoration:none;font-size:18px;box-shadow:0 4px 16px ${accentColor}44;transition:background 0.2s;">🔓 Verify Email Address</a>
        </div>
        <div style="background:#1e293b;padding:18px 16px;border-radius:8px;margin:32px 0;">
          <p style="color:#cbd5e1;margin-bottom:8px;font-size:14px;">If the button doesn't work, copy and paste this link:</p>
          <p style="word-break:break-all;background:#0f172a;padding:10px;border-radius:5px;font-family:monospace;font-size:13px;">
            <a href="${verificationUrl}" style="color:${accentColor};text-decoration:none;">${verificationUrl}</a>
          </p>
        </div>
        <div style="border-top:1px solid #334155;padding-top:18px;margin-top:32px;text-align:center;">
          <p style="color:#64748b;font-size:13px;margin-bottom:6px;">This verification link will expire in 24 hours.</p>
          <p style="color:#64748b;font-size:13px;">See you on the inside!<br/>— The Full Fuel TV Team</p>
        </div>
      </div>
    `
  };

  try {
    console.log('Attempting to send email to:', email);
    console.log('Email configuration check:', {
      hasUser: !!process.env.EMAIL_USER,
      hasPass: !!process.env.EMAIL_PASS,
      userLength: process.env.EMAIL_USER?.length,
      passLength: process.env.EMAIL_PASS?.length
    });
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    console.log('Verification email sent to:', email);
    return result;
  } catch (error) {
    console.error('DETAILED EMAIL ERROR:', error);
    if (typeof error === 'object' && error !== null) {
      if ('code' in error) {
        console.error('Error code:', (error as any).code);
      }
      if ('message' in error) {
        console.error('Error message:', (error as any).message);
      }
      if ('response' in error) {
        console.error('SMTP response:', (error as any).response);
      }
    }
    
    // Don't throw the error in production to prevent registration from failing
    if (process.env.NODE_ENV === 'production') {
      console.error('Email sending failed in production, but continuing...');
      return null;
    }
    
    throw error;
  }
};
