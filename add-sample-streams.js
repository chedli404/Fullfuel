import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const sampleStreams = [
  {
    title: 'Tomorrowland Festival Live',
    description: 'Experience the magic of Tomorrowland with an exclusive live stream featuring the biggest names in electronic music.',
    artist: 'Martin Garrix',
    scheduledDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    thumbnailUrl: 'https://i.imgur.com/tomorrowland.jpg',
    streamType: 'festival',
    streamStatus: 'scheduled',
    expectedViewers: 15000,
    actualViewers: 0,
    featured: true,
    createdAt: new Date()
  },
  {
    title: 'Club Night Sessions',
    description: 'Underground techno vibes from the hottest club in Berlin. Get ready for an intense night of electronic beats.',
    artist: 'Charlotte de Witte',
    scheduledDate: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
    thumbnailUrl: 'https://i.imgur.com/clubnight.jpg',
    streamType: 'club',
    streamStatus: 'scheduled',
    expectedViewers: 8000,
    actualViewers: 0,
    featured: false,
    createdAt: new Date()
  },
  {
    title: 'Exclusive DJ Set Premiere',
    description: 'World premiere of an exclusive DJ set recorded at a secret location. This is a must-watch for electronic music fans.',
    artist: 'Amelie Lens',
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    thumbnailUrl: 'https://i.imgur.com/djset.jpg',
    streamType: 'dj-set',
    streamStatus: 'scheduled',
    expectedViewers: 12000,
    actualViewers: 0,
    featured: true,
    createdAt: new Date()
  },
  {
    title: 'Ultra Music Festival Highlights',
    description: 'Relive the best moments from Ultra Music Festival with this special highlight reel and live commentary.',
    artist: 'David Guetta',
    scheduledDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
    thumbnailUrl: 'https://i.imgur.com/ultra.jpg',
    streamType: 'festival',
    streamStatus: 'scheduled',
    expectedViewers: 25000,
    actualViewers: 0,
    featured: true,
    createdAt: new Date()
  },
  {
    title: 'Warehouse Rave Live',
    description: 'Raw underground energy from a secret warehouse location. Experience the authentic rave culture.',
    artist: 'I Hate Models',
    scheduledDate: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours from now
    thumbnailUrl: 'https://i.imgur.com/warehouse.jpg',
    streamType: 'club',
    streamStatus: 'scheduled',
    expectedViewers: 6000,
    actualViewers: 0,
    featured: false,
    createdAt: new Date()
  }
];

async function addSampleStreams() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const streamsCollection = db.collection('streams');
    
    // Clear existing streams (optional)
    await streamsCollection.deleteMany({});
    console.log('Cleared existing streams');
    
    // Insert sample streams
    const result = await streamsCollection.insertMany(sampleStreams);
    console.log(`Added ${result.insertedCount} sample streams`);
    
    // Display the added streams
    const addedStreams = await streamsCollection.find({}).toArray();
    console.log('\nAdded streams:');
    addedStreams.forEach(stream => {
      console.log(`- ${stream.title} by ${stream.artist} (${stream.streamType})`);
      console.log(`  Scheduled: ${stream.scheduledDate}`);
      console.log(`  Expected viewers: ${stream.expectedViewers}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error adding sample streams:', error);
  } finally {
    await client.close();
  }
}

addSampleStreams();