import { useState } from 'react';
import { X, Bell, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamTitle: string;
  streamId: string;
  onSubscribe: (streamId: string, notificationType: string) => void;
}

const NotificationModal = ({ isOpen, onClose, streamTitle, streamId, onSubscribe }: NotificationModalProps) => {
  const [selectedTiming, setSelectedTiming] = useState('1hour');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      await onSubscribe(streamId, selectedTiming);
      setIsSubscribed(true);
      setTimeout(() => {
        onClose();
        setIsSubscribed(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to subscribe:', error);
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] rounded-sm max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Stream Notifications</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSubscribed ? (
          <div className="text-center py-8">
            <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h4 className="text-lg font-bold mb-2">You're all set!</h4>
            <p className="text-gray-400">We'll notify you before the stream starts.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-300 mb-4">
                Get notified before <span className="text-primary font-medium">"{streamTitle}"</span> starts streaming.
              </p>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="timing"
                    value="15min"
                    checked={selectedTiming === '15min'}
                    onChange={(e) => setSelectedTiming(e.target.value)}
                    className="text-primary"
                  />
                  <span>15 minutes before</span>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="timing"
                    value="1hour"
                    checked={selectedTiming === '1hour'}
                    onChange={(e) => setSelectedTiming(e.target.value)}
                    className="text-primary"
                  />
                  <span>1 hour before</span>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="timing"
                    value="24hour"
                    checked={selectedTiming === '24hour'}
                    onChange={(e) => setSelectedTiming(e.target.value)}
                    className="text-primary"
                  />
                  <span>24 hours before</span>
                </label>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 bg-transparent border-gray-600 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubscribe}
                disabled={isSubscribing}
                className="flex-1 bg-primary hover:bg-primary/80 text-dark"
              >
                <Bell className="h-4 w-4 mr-2" />
                {isSubscribing ? 'Setting up...' : 'Notify Me'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationModal;