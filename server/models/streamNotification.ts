import mongoose from 'mongoose';

const streamNotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  streamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stream', required: true },
  notifyAt: { type: Date, required: true },
  notificationType: { 
    type: String, 
    enum: ['15min', '1hour', '24hour'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'sent', 'failed'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now }
});

export const StreamNotificationModel = mongoose.model('StreamNotification', streamNotificationSchema);