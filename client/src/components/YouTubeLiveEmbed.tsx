import React, { useEffect, useState, useRef } from 'react';

interface YouTubeLiveEmbedProps {
  channelId: string;
  width?: string | number;
  height?: string | number;
}

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;


// Now supports render prop for parent to know if live is available
type YouTubeLiveEmbedRenderProps = {
  isLive: boolean;
  liveVideoId: string | null;
  loading: boolean;
  error: string | null;
};

interface YouTubeLiveEmbedWithRenderProps extends YouTubeLiveEmbedProps {
  children?: (props: YouTubeLiveEmbedRenderProps) => React.ReactNode;
}

const YouTubeLiveEmbed: React.FC<YouTubeLiveEmbedWithRenderProps> = ({ channelId, width = '100%', height = 480, children }) => {
  const [liveVideoId, setLiveVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLiveVideo = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${YOUTUBE_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          setLiveVideoId(data.items[0].id.videoId);
        } else {
          setLiveVideoId(null);
        }
      } catch (err) {
        setError('Failed to fetch live stream info.');
        setLiveVideoId(null);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveVideo();
  }, [channelId]);

  const isLive = !!liveVideoId && !loading && !error;

  if (children) {
    return <>{children({ isLive, liveVideoId, loading, error })}</>;
  }

  // Always call hooks at the top level
  const iframeRef = useRef<HTMLIFrameElement>(null);

  if (!isLive) return null;

  // Fullscreen handler for iframe
  const handleFullscreen = () => {
    const iframe = iframeRef.current;
    if (iframe) {
      // Try to use the Fullscreen API
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else if ((iframe as any).webkitRequestFullscreen) {
        (iframe as any).webkitRequestFullscreen();
      } else if ((iframe as any).mozRequestFullScreen) {
        (iframe as any).mozRequestFullScreen();
      } else if ((iframe as any).msRequestFullscreen) {
        (iframe as any).msRequestFullscreen();
      }
    }
  };

  return (
    <section className="relative w-full h-[90vh] md:h-screen overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${liveVideoId}?autoplay=1`}
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="YouTube Live Stream"
          className="w-full h-full object-cover"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        />
        {/* Fullscreen button overlay */}
        <button
          onClick={handleFullscreen}
          className="absolute bottom-6 right-6 z-20 bg-black/70 hover:bg-primary text-white hover:text-black rounded-full p-3 shadow-lg transition-colors"
          title="Full Screen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3H5a2 2 0 00-2 2v3m0 8v3a2 2 0 002 2h3m8-16h3a2 2 0 012 2v3m0 8v3a2 2 0 01-2 2h-3" /></svg>
        </button>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30 flex flex-col justify-end pb-12 md:pb-24 px-6 md:px-12 pointer-events-none">
        <div className="container mx-auto">
          <div className="inline-block bg-primary px-3 py-1 mb-4">
            <span className="font-mono text-dark text-sm uppercase font-bold">Live Now</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-4">Live Stream</h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl">Enjoy the live broadcast from Full Fuel TV.</p>
        </div>
      </div>
    </section>
  );
};

export default YouTubeLiveEmbed;
