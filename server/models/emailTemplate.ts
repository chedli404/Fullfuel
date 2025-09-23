import mongoose from 'mongoose';

const emailTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  streamType: { 
    type: String, 
    enum: ['festival', 'club', 'dj-set', 'premiere'], 
    required: true 
  },
  subject: { type: String, required: true },
  htmlContent: { type: String, required: true },
  textContent: { type: String },
  variables: [{ type: String }], // e.g. ['streamTitle', 'artistName', 'streamTime']
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

export const EmailTemplateModel = mongoose.model('EmailTemplate', emailTemplateSchema);