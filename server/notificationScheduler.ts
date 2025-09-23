import { StreamNotificationModel, EmailTemplateModel, StreamModel, UserModel } from './models/db';
import { sendStreamNotification } from './emailService';

export class NotificationScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  start() {
    if (this.isRunning) {
      console.log('Notification scheduler is already running');
      return;
    }

    console.log('Starting notification scheduler...');
    this.isRunning = true;
    
    // Check for notifications every minute
    this.intervalId = setInterval(async () => {
      await this.processNotifications();
    }, 60000); // 60 seconds

    // Run immediately on start
    this.processNotifications();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Notification scheduler stopped');
  }

  private async processNotifications() {
    try {
      const now = new Date();
      
      // Find notifications that are due to be sent
      const dueNotifications = await StreamNotificationModel.find({
        status: 'pending',
        notifyAt: { $lte: now }
      }).populate('userId').populate('streamId');

      if (dueNotifications.length === 0) {
        return; // No notifications to process
      }

      console.log(`Processing ${dueNotifications.length} due notifications`);

      for (const notification of dueNotifications) {
        try {
          await this.sendNotification(notification);
        } catch (error) {
          console.error(`Failed to send notification ${notification._id}:`, error);
          
          // Mark as failed
          await StreamNotificationModel.findByIdAndUpdate(notification._id, {
            status: 'failed'
          });
        }
      }
    } catch (error) {
      console.error('Error processing notifications:', error);
    }
  }

  private async sendNotification(notification: any) {
    const user = notification.userId;
    const stream = notification.streamId;

    if (!user || !stream) {
      console.error(`Missing user or stream data for notification: ${notification._id}`);
      console.error(`User exists: ${!!user}, Stream exists: ${!!stream}`);
      
      // Mark notification as failed since referenced data is missing
      await StreamNotificationModel.findByIdAndUpdate(notification._id, {
        status: 'failed'
      });
      return;
    }

    // Get the appropriate email template
    const template = await EmailTemplateModel.findOne({
      streamType: stream.streamType
    });

    if (!template) {
      console.error(`No email template found for stream type: ${stream.streamType}`);
      
      // Mark notification as failed since template is missing
      await StreamNotificationModel.findByIdAndUpdate(notification._id, {
        status: 'failed'
      });
      return;
    }

    try {
      // Send the email
      await sendStreamNotification(
        user.email,
        user.name,
        stream,
        template,
        notification.notificationType
      );

      // Mark notification as sent
      await StreamNotificationModel.findByIdAndUpdate(notification._id, {
        status: 'sent'
      });

      console.log(`Notification sent successfully to ${user.email} for stream: ${stream.title}`);
    } catch (emailError) {
      console.error(`Failed to send email for notification ${notification._id}:`, emailError);
      
      // Mark notification as failed
      await StreamNotificationModel.findByIdAndUpdate(notification._id, {
        status: 'failed'
      });
      throw emailError;
    }
  }
}

// Create singleton instance
export const notificationScheduler = new NotificationScheduler();
