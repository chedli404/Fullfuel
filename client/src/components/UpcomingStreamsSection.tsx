import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Clock, Bell, Users } from 'lucide-react';
import NotificationModal from './NotificationModal';

// Define the Stream type
interface Stream {
  id: string;
  title: string;
  artist: string;
  scheduledDate: string;
  thumbnailUrl: string;
  streamType: 'festival' | 'club' | 'dj-set' | 'premiere';
  expectedViewers: number;
}

const UpcomingStreamsSection = () => {
  const [filter, setFilter] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: streams = [], isLoading, error } = useQuery<Stream[]>({
    queryKey: ['/api/streams/upcoming'],
    queryFn: async () => {
      const response = await fetch('/api/streams/upcoming');
      if (!response.ok) throw new Error('Failed to fetch streams');
      return response.json();
    },
  });

  const filteredStreams = filter === 'all' 
    ? streams 
    : streams.filter((stream: Stream) => stream.streamType === filter);

  const getCountdown = (scheduledDate: Date | string) => {
    const date = new Date(scheduledDate);
    const diff = date.getTime() - currentTime.getTime();
    
    if (diff <= 0) return 'LIVE NOW';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const subscribeToNotification = useMutation({
    mutationFn: async ({ streamId, notificationType }: { streamId: string; notificationType: string }) => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Please log in to set up notifications');
      }
      
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ streamId, notificationType })
      });
      
      if (!response.ok) {
        throw new Error('Failed to subscribe to notifications');
      }
      
      return response.json();
    },
    onSuccess: () => {
      console.log('Successfully subscribed to notifications');
    },
    onError: (error) => {
      console.error('Failed to subscribe:', error);
      alert(error.message);
    }
  });

  const handleNotifyMe = (stream: Stream) => {
    setSelectedStream(stream);
    setIsModalOpen(true);
  };

  const handleSubscribe = async (streamId: string, notificationType: string) => {
    await subscribeToNotification.mutateAsync({ streamId, notificationType });
  };

  if (isLoading) {
    return (
      <section className="py-12 bg-[#1A1A1A]">
        <div className="container mx-auto px-6 md:px-12">
          <div className="h-6 bg-gray-800 mb-6 w-1/4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#1A1A1A] p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-800 mb-3"></div>
                <div className="h-5 bg-gray-800 mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-800 w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-[#1A1A1A]">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="font-bold text-2xl mb-6">
            Upcoming <span className="text-primary">Streams</span>
          </h2>
          <div className="text-center py-8">
            <Clock className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Failed to load streams</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-[#1A1A1A]">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-bold text-3xl md:text-4xl">
            Upcoming <span className="text-primary">Streams</span>
          </h2>
          
          <div className="flex space-x-3 text-sm">
            <button 
              className={`px-4 py-2 transition-colors ${
                filter === 'all' ? 'text-primary' : 'text-gray-400 hover:text-primary'
              }`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`px-4 py-2 transition-colors ${
                filter === 'festival' ? 'text-primary' : 'text-gray-400 hover:text-primary'
              }`}
              onClick={() => setFilter('festival')}
            >
              Festivals
            </button>
            <button 
              className={`px-4 py-2 transition-colors ${
                filter === 'club' ? 'text-primary' : 'text-gray-400 hover:text-primary'
              }`}
              onClick={() => setFilter('club')}
            >
              Clubs
            </button>
          </div>
        </div>

        {filteredStreams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStreams.map((stream: Stream) => (
              <div key={stream.id} className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20">
                <div className="relative overflow-hidden mb-4">
                  <img 
                    src={stream.thumbnailUrl || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f'}
                    alt={stream.title} 
                    className="w-full h-48 object-cover"
                  />
                  
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      stream.streamType === 'festival' ? 'bg-purple-600 text-white' :
                      stream.streamType === 'club' ? 'bg-blue-600 text-white' :
                      stream.streamType === 'dj-set' ? 'bg-green-600 text-white' :
                      'bg-orange-600 text-white'
                    }`}>
                      {stream.streamType.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="absolute bottom-2 left-2">
                    <span className={`px-2 py-1 text-sm font-mono rounded ${
                      getCountdown(stream.scheduledDate) === 'LIVE NOW' 
                        ? 'bg-red-600 text-white animate-pulse' 
                        : 'bg-black/80 text-primary'
                    }`}>   {getCountdown(stream.scheduledDate)}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-2">
                    {stream.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm">by {stream.artist}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-500 text-sm">
                      <Users className="h-4 w-4 hidden" />
                    </div>
                    <button 
                      onClick={() => handleNotifyMe(stream)}
                      className="flex items-center space-x-2 text-primary hover:text-white transition-colors bg-[#1A1A1A] hover:bg-primary hover:text-dark px-3 py-1 rounded text-sm"
                    >
                      <Bell className="h-4 w-4" />
                      <span>Notify Me</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No upcoming streams</h3>
            <p className="text-gray-400">Check back soon for new streams</p>
          </div>
        )}
        
        <NotificationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          streamTitle={selectedStream?.title || ''}
          streamId={selectedStream?.id || ''}
          onSubscribe={handleSubscribe}
        />
      </div>
    </section>
  );
};

export default UpcomingStreamsSection;
