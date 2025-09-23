import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

async function createTestStream() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const streamsCollection = db.collection('streams');
    
    // Create a test stream that starts in 17 minutes (so 15min notification triggers in 2 minutes)
    const testStream = {
      title: 'TEST NOTIFICATION STREAM',
      description: 'This is a test stream to verify notifications work',
      artist: 'Test Artist',
      scheduledDate: new Date(Date.now() + 17 * 60 * 1000), // 17 minutes from now
      thumbnailUrl: 'https://i.imgur.com/test.jpg',
      streamType: 'festival',
      streamStatus: 'scheduled',
      expectedViewers: 1000,
      actualViewers: 0,
      featured: false,
      createdAt: new Date()
    };
    
    const result = await streamsCollection.insertOne(testStream);
    console.log('Test stream created with ID:', result.insertedId);
    
    console.log('\nTest stream details:');
    console.log('- Title:', testStream.title);
    console.log('- Scheduled for:', testStream.scheduledDate);
    console.log('- Stream type:', testStream.streamType);
    console.log('\nNow go to your homepage and click "Notify Me" with "15 minutes before"');
    console.log('The notification should be sent in about 2 minutes!');
    
  } catch (error) {
    console.error('Error creating test stream:', error);
  } finally {
    await client.close();
  }
}

createTestStream();