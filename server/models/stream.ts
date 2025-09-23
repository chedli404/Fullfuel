import mongoose from 'mongoose';

const streamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  artist: { type: String, required: true },
  scheduledDate: { type: Date, required: true },
  youtubeId: { type: String },
  thumbnailUrl: { type: String }, // Imgur URL
  streamType: { 
    type: String, 
    enum: ['festival', 'club', 'dj-set', 'premiere'], 
    required: true 
  },
  streamStatus: { 
    type: String, 
    enum: ['scheduled', 'live', 'ended'], 
    default: 'scheduled' 
  },
  expectedViewers: { type: Number, default: 0 },
  actualViewers: { type: Number, default: 0 },
  streamUrl: { type: String },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

export const StreamModel = mongoose.model('Stream', streamSchema);