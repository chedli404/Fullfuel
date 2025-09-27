import { Helmet } from 'react-helmet';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import FeaturedVideos from '@/components/FeaturedVideos';
import EventsSection from '@/components/EventsSection';
import MusicSection from '@/components/MusicSection';
import GallerySection from '@/components/GallerySection';
import AboutSection from '@/components/AboutSection';
import LiveNowButton from '@/components/LiveNowButton';
import YouTubeLiveEmbed from '@/components/YouTubeLiveEmbed';
import UpcomingStreamsSection from '@/components/UpcomingStreamsSection';
import StatsCounter from '@/components/StatsCounter';



const YOUTUBE_CHANNEL_ID = 'UCfiwzLy-8yKzIbsmZTzxDgw';

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>Full Fuel TV | Live Streaming Platform for Music Artists</title>
        <meta name="description" content="Full Fuel TV explores electronic music through the best live sets & DJ mixes from around the world." />
      </Helmet>
      <Header />
      <main>
        {/* Show live stream in place of HeroSection if live, otherwise show HeroSection */}
        <YouTubeLiveEmbed channelId={YOUTUBE_CHANNEL_ID}>
          {({ isLive, liveVideoId }) => (
            <>
              {isLive ? (
                <YouTubeLiveEmbed channelId={YOUTUBE_CHANNEL_ID} />
              ) : (
                <HeroSection />
              )}
              <LiveNowButton isLive={isLive} liveUrl={liveVideoId ? `/videos/${liveVideoId}` : undefined} />
            </>
          )}
        </YouTubeLiveEmbed>
        <FeaturedVideos />
        <StatsCounter />
        <UpcomingStreamsSection />
        
        <MusicSection />
        <GallerySection />
        <AboutSection />
      </main>
      <Footer />
    </>
  );
};

export default HomePage;
