import sgMail from '@sendgrid/mail';
import crypto from 'crypto';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const sendVerificationEmail = async (email: string, username: string, token: string) => {
  const verificationUrl = `${process.env.CLIENT_URL || 'https://fullfueltv.online'}/api/auth/verify-email?token=${token}`;
  console.log('Verification URL:', verificationUrl);
  
  const logoUrl = 'https://scontent-dub4-1.xx.fbcdn.net/v/t39.30808-1/432924633_915835900547362_4817121139309060747_n.jpg?stp=c176.412.883.882a_dst-jpg_s200x200_tt6&_nc_cat=109&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=2FBnAPZhAJoQ7kNvwGxP55C&_nc_oc=AdkVL4H0ZOmxh32zkQLfRDyJe2xt0kG4bYNeIYGqo2_7DkDv0crOcvEoQ1SHhwlvyZG-Tdi9icOHUsiEa9TP61JH&_nc_zt=24&_nc_ht=scontent-dub4-1.xx&_nc_gid=cXVB9VpguS6yLwoJDG72zQ&oh=00_AfY1FRUDVqakjyaS9GwuHpWVSO3McYoQpbMzUAez9TEBkw&oe=68D7A083';
  const accentColor = '#00ff40';
  
  const msg = {
    to: email,
    from: {
      email: 'noreply@fullfueltv.online',
      name: 'Full Fuel TV'
    },
    replyTo: 'support@fullfueltv.online',
    subject: 'Verify Your Email - Full Fuel TV',
    categories: ['email-verification'],
    customArgs: {
      type: 'verification'
    },
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#0a0e11;color:#fff;padding:32px 24px;border-radius:14px;box-shadow:0 4px 32px rgba(29, 245, 18, 0.13);">
        <div style="text-align:center;margin-bottom:32px;">
          <img src="${logoUrl}" alt="FullFuelTV Logo" style="height:56px;margin-bottom:16px;"/>
          <h1 style="color:${accentColor};font-size:28px;margin-bottom:8px;">Welcome to Full Fuel TV</h1>
          <h2 style="color:#fff;font-size:20px;margin:0;">Hello ${username},</h2>
        </div>
        <p style="color:#cbd5e1;font-size:16px;line-height:1.7;margin-bottom:32px;">Thank you for joining Full Fuel TV! Please verify your email address to complete your registration and unlock exclusive content, live events, and more.</p>
        <div style="text-align:center;margin:40px 0;">
          <a href="${verificationUrl}" target="_blank" style="display:inline-block;background:${accentColor};color:#000;padding:16px 36px;border-radius:8px;font-weight:bold;text-decoration:none;font-size:18px;box-shadow:0 4px 16px ${accentColor}44;transition:background 0.2s;">🔓 Verify Email Address</a>
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
    console.log('Attempting to send email via SendGrid to:', email);
    await sgMail.send(msg);
    console.log('Verification email sent successfully via SendGrid');
  } catch (error) {
    console.error('SendGrid verification email error:', error);
    throw error;
  }
};

export const sendContactMessage = async (name: string, email: string, message: string) => {
  const msg = {
    to: 'support@fullfueltv.online',
    from: {
      email: 'noreply@fullfueltv.online',
      name: 'Full Fuel TV'
    },
    replyTo: email,
    subject: `New Contact Message from ${name}`,
    categories: ['contact-form'],
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#0a0e11;color:#fff;padding:32px 24px;border-radius:14px;box-shadow:0 4px 32px rgba(29, 245, 18, 0.13);">
        <h2 style="color:#00ff40;font-size:22px;margin-bottom:8px;">New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <div style="background:#1e293b;padding:18px 16px;border-radius:8px;margin:16px 0;color:#cbd5e1;">${message || '<i>No message provided</i>'}</div>
        <p style="color:#64748b;font-size:13px;margin-top:32px;">This message was sent from the Full Fuel TV contact form.</p>
      </div>
    `
  };

  try {
    console.log('Sending contact message via SendGrid');
    await sgMail.send(msg);
    console.log('Contact email sent successfully via SendGrid');
  } catch (error) {
    console.error('SendGrid contact email error:', error);
    throw error;
  }
};

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
  
  const msg = {
    to: userEmail,
    from: {
      email: 'noreply@fullfueltv.online',
      name: 'Full Fuel TV'
    },
    subject: subject,
    categories: ['stream-notification'],
    html: htmlContent,
    text: textContent
  };
  
  try {
    console.log('Sending stream notification via SendGrid to:', userEmail);
    await sgMail.send(msg);
    console.log('Stream notification sent successfully via SendGrid');
  } catch (error) {
    console.error('SendGrid stream notification error:', error);
    throw error;
  }
};
