import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const emailTemplates = [
  {
    name: 'festival_stream_notification',
    streamType: 'festival',
    subject: ' {{streamTitle}} starts {{timing}}!',
    htmlContent: `
      <!DOCTYPE html>
      <html style="background-color: #0A0A0A !important;">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Festival Stream Starting Soon</title>
        <style>
          * { box-sizing: border-box; }
          body, html { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important; background-color: #0A0A0A !important; color: #ffffff !important; margin: 0 !important; padding: 20px !important; line-height: 1.6 !important; }
          .container { max-width: 600px !important; margin: 0 auto !important; background-color: #1A1A1A !important; }
          .header { background-color: #121212 !important; padding: 40px 30px !important; text-align: center !important; border-bottom: 2px solid #00ff40 !important; }
          .content { padding: 40px 30px !important; background-color: #1A1A1A !important; }
          .button { display: inline-block !important; background-color: #00ff40 !important; color: #000000 !important; padding: 12px 24px !important; text-decoration: none !important; font-weight: 600 !important; margin: 20px 0 !important; }
          .footer { background-color: #0A0A0A !important; padding: 20px 30px !important; text-align: center !important; font-size: 14px !important; color: #666 !important; }
          .highlight { color: #00ff40 !important; font-weight: 600 !important; }
          .stream-info { background-color: #121212 !important; padding: 20px !important; margin: 20px 0 !important; border-left: 3px solid #00ff40 !important; }
          h1 { margin: 0 !important; font-size: 28px !important; font-weight: 700 !important; color: #ffffff !important; }
          h2 { color: #00ff40 !important; margin: 0 0 20px 0 !important; font-size: 24px !important; }
          p { margin: 0 0 15px 0 !important; color: #e5e5e5 !important; }
        </style>
      </head>
      <body style="background-color: #0A0A0A !important; color: #ffffff !important; margin: 0; padding: 20px;">
        <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #1A1A1A !important;">
          <div class="header" style="background-color: #121212 !important; padding: 40px 30px; text-align: center; border-bottom: 2px solid #00ff40;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff !important;"> Festival Stream Alert</h1>
          </div>
          <div class="content" style="padding: 40px 30px; background-color: #1A1A1A !important;">
            <h2 style="color: #00ff40 !important; margin: 0 0 20px 0; font-size: 24px;">{{streamTitle}}</h2>
            <p style="margin: 0 0 15px 0; color: #e5e5e5 !important;">The epic festival stream <span style="color: #00ff40 !important; font-weight: 600;">"{{streamTitle}}"</span> by <span style="color: #00ff40 !important; font-weight: 600;">{{artistName}}</span> is starting {{timing}}!</p>
            <div style="background-color: #121212 !important; padding: 20px; margin: 20px 0; border-left: 3px solid #00ff40;">
              <p style="margin: 0 0 15px 0; color: #e5e5e5 !important;"><strong>Stream Time:</strong> {{streamTime}}</p>
            </div>
            <p style="margin: 0 0 15px 0; color: #e5e5e5 !important;">Get ready for an incredible festival experience with amazing visuals and the biggest names in electronic music.</p>
            <a href="{{streamUrl}}" style="display: inline-block; background-color: #00ff40 !important; color: #000000 !important; padding: 12px 24px; text-decoration: none; font-weight: 600; margin: 20px 0;"> Watch Live Stream</a>
          </div>
          <div class="footer" style="background-color: #0A0A0A !important; padding: 20px 30px; text-align: center; font-size: 14px; color: #666 !important;">
            <p style="color: #666 !important;"><strong>Full Fuel TV</strong> - Your Electronic Music Destination</p>
            <p style="color: #666 !important;">You're receiving this because you subscribed to notifications for this stream.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
 Festival Stream Alert

{{streamTitle}} by {{artistName}} is starting {{timing}}!

Stream Time: {{streamTime}}

Watch live: {{streamUrl}}

Don't miss this incredible festival experience!

---
Full Fuel TV - Your Electronic Music Destination
    `,
    variables: ['streamTitle', 'artistName', 'streamTime', 'timing', 'expectedViewers', 'streamUrl'],
    createdAt: new Date()
  },
  {
    name: 'club_stream_notification',
    streamType: 'club',
    subject: ' {{streamTitle}} starts {{timing}}!',
    htmlContent: `
      <!DOCTYPE html>
      <html style="background-color: #0A0A0A !important;">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Club Stream Starting Soon</title>
        <style>
          * { box-sizing: border-box; }
          body, html { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important; background-color: #0A0A0A !important; color: #ffffff !important; margin: 0 !important; padding: 20px !important; line-height: 1.6 !important; }
        </style>
      </head>
      <body style="background-color: #0A0A0A !important; color: #ffffff !important; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #1A1A1A !important;">
          <div style="background-color: #121212 !important; padding: 40px 30px; text-align: center; border-bottom: 2px solid #00ff40;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff !important;"> Club Night Alert</h1>
          </div>
          <div style="padding: 40px 30px; background-color: #1A1A1A !important;">
            <h2 style="color: #00ff40 !important; margin: 0 0 20px 0; font-size: 24px;">{{streamTitle}}</h2>
            <p style="margin: 0 0 15px 0; color: #e5e5e5 !important;">The intense club stream <span style="color: #00ff40 !important; font-weight: 600;">"{{streamTitle}}"</span> by <span style="color: #00ff40 !important; font-weight: 600;">{{artistName}}</span> is starting {{timing}}!</p>
            <div style="background-color: #121212 !important; padding: 20px; margin: 20px 0; border-left: 3px solid #00ff40;">
              <p style="margin: 0 0 15px 0; color: #e5e5e5 !important;"><strong>Stream Time:</strong> {{streamTime}}</p>
            </div>
            <p style="margin: 0 0 15px 0; color: #e5e5e5 !important;">Experience the raw energy of underground electronic music with pounding beats and hypnotic rhythms.</p>
            <a href="{{streamUrl}}" style="display: inline-block; background-color: #00ff40 !important; color: #000000 !important; padding: 12px 24px; text-decoration: none; font-weight: 600; margin: 20px 0;"> Enter the Club</a>
          </div>
          <div style="background-color: #0A0A0A !important; padding: 20px 30px; text-align: center; font-size: 14px; color: #666 !important;">
            <p style="color: #666 !important;"><strong>Full Fuel TV</strong> - Your Electronic Music Destination</p>
            <p style="color: #666 !important;">You're receiving this because you subscribed to notifications for this stream.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
 Club Stream Alert

{{streamTitle}} by {{artistName}} is starting {{timing}}!

Stream Time: {{streamTime}}

Enter the club: {{streamUrl}}

Feel the bass, lose yourself in the music!

---
Full Fuel TV - Your Electronic Music Destination
    `,
    variables: ['streamTitle', 'artistName', 'streamTime', 'timing', 'expectedViewers', 'streamUrl'],
    createdAt: new Date()
  },
  {
    name: 'dj_set_notification',
    streamType: 'dj-set',
    subject: ' {{streamTitle}} starts {{timing}}!',
    htmlContent: `
      <!DOCTYPE html>
      <html style="background-color: #0A0A0A !important;">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DJ Set Starting Soon</title>
        <style>
          * { box-sizing: border-box; }
          body, html { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important; background-color: #0A0A0A !important; color: #ffffff !important; margin: 0 !important; padding: 20px !important; line-height: 1.6 !important; }
        </style>
      </head>
      <body style="background-color: #0A0A0A !important; color: #ffffff !important; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #1A1A1A !important;">
          <div style="background-color: #121212 !important; padding: 40px 30px; text-align: center; border-bottom: 2px solid #00ff40;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff !important;"> Exclusive DJ Set</h1>
          </div>
          <div style="padding: 40px 30px; background-color: #1A1A1A !important;">
            <h2 style="color: #00ff40 !important; margin: 0 0 20px 0; font-size: 24px;">{{streamTitle}}</h2>
            <p style="margin: 0 0 15px 0; color: #e5e5e5 !important;">The exclusive DJ set <span style="color: #00ff40 !important; font-weight: 600;">"{{streamTitle}}"</span> by <span style="color: #00ff40 !important; font-weight: 600;">{{artistName}}</span> is starting {{timing}}!</p>
            <div style="background-color: #121212 !important; padding: 20px; margin: 20px 0; border-left: 3px solid #00ff40;">
              <p style="margin: 0 0 15px 0; color: #e5e5e5 !important;"><strong>Stream Time:</strong> {{streamTime}}</p>
            </div>
            <p style="margin: 0 0 15px 0; color: #e5e5e5 !important;">Experience a unique musical journey with carefully curated tracks and seamless mixing from one of the best.</p>
            <a href="{{streamUrl}}" style="display: inline-block; background-color: #00ff40 !important; color: #000000 !important; padding: 12px 24px; text-decoration: none; font-weight: 600; margin: 20px 0;"> Join the Set</a>
          </div>
          <div style="background-color: #0A0A0A !important; padding: 20px 30px; text-align: center; font-size: 14px; color: #666 !important;">
            <p style="color: #666 !important;"><strong>Full Fuel TV</strong> - Your Electronic Music Destination</p>
            <p style="color: #666 !important;">You're receiving this because you subscribed to notifications for this stream.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
  DJ Set Stream Alert

{{streamTitle}} by {{artistName}} is starting {{timing}}!

Stream Time: {{streamTime}}

Join the set: {{streamUrl}}

Prepare for a musical journey like no other!

---
Full Fuel TV - Your Electronic Music Destination
    `,
    variables: ['streamTitle', 'artistName', 'streamTime', 'timing', 'expectedViewers', 'streamUrl'],
    createdAt: new Date()
  },
  {
    name: 'premiere_notification',
    streamType: 'premiere',
    subject: ' {{streamTitle}} premieres {{timing}}!',
    htmlContent: `
      <!DOCTYPE html>
      <html style="background-color: #0A0A0A !important;">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Premiere Starting Soon</title>
        <style>
          * { box-sizing: border-box; }
          body, html { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important; background-color: #0A0A0A !important; color: #ffffff !important; margin: 0 !important; padding: 20px !important; line-height: 1.6 !important; }
        </style>
      </head>
      <body style="background-color: #0A0A0A !important; color: #ffffff !important; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #1A1A1A !important;">
          <div style="background-color: #121212 !important; padding: 40px 30px; text-align: center; border-bottom: 2px solid #00ff40;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff !important;"> World Premiere</h1>
          </div>
          <div style="padding: 40px 30px; background-color: #1A1A1A !important;">
            <h2 style="color: #00ff40 !important; margin: 0 0 20px 0; font-size: 24px;">{{streamTitle}}</h2>
            <p style="margin: 0 0 15px 0; color: #e5e5e5 !important;">The world premiere of <span style="color: #00ff40 !important; font-weight: 600;">"{{streamTitle}}"</span> by <span style="color: #00ff40 !important; font-weight: 600;">{{artistName}}</span> is starting {{timing}}!</p>
            <div style="background-color: #121212 !important; padding: 20px; margin: 20px 0; border-left: 3px solid #00ff40;">
              <p style="margin: 0 0 15px 0; color: #e5e5e5 !important;"><strong>Premiere Time:</strong> {{streamTime}}</p>
            </div>
            <p style="margin: 0 0 15px 0; color: #e5e5e5 !important;">You're invited to an exclusive first look at this brand new content, specially crafted for electronic music enthusiasts.</p>
            <a href="{{streamUrl}}" style="display: inline-block; background-color: #00ff40 !important; color: #000000 !important; padding: 12px 24px; text-decoration: none; font-weight: 600; margin: 20px 0;"> Watch Premiere</a>
          </div>
          <div style="background-color: #0A0A0A !important; padding: 20px 30px; text-align: center; font-size: 14px; color: #666 !important;">
            <p style="color: #666 !important;"><strong>Full Fuel TV</strong> - Your Electronic Music Destination</p>
            <p style="color: #666 !important;">You're receiving this because you subscribed to notifications for this stream.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
  Premiere Stream Alert

{{streamTitle}} by {{artistName}} is starting {{timing}}!

Premiere Time: {{streamTime}}

Watch premiere: {{streamUrl}}

Be part of electronic music history!

---
Full Fuel TV - Your Electronic Music Destination
    `,
    variables: ['streamTitle', 'artistName', 'streamTime', 'timing', 'expectedViewers', 'streamUrl'],
    createdAt: new Date()
  }
];

async function addEmailTemplates() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const templatesCollection = db.collection('emailtemplates');

    // Clear existing templates
    await templatesCollection.deleteMany({});
    console.log('Cleared existing email templates');

    // Insert email templates
    const result = await templatesCollection.insertMany(emailTemplates);
    console.log(`Added ${result.insertedCount} email templates`);

    // Display the added templates
    const addedTemplates = await templatesCollection.find({}).toArray();
    console.log('\nAdded email templates:');
    addedTemplates.forEach(template => {
      console.log(`- ${template.name} (${template.streamType})`);
      console.log(`  Subject: ${template.subject}`);
      console.log(`  Variables: ${template.variables.join(', ')}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error adding email templates:', error);
  } finally {
    await client.close();
  }
}

addEmailTemplates();
