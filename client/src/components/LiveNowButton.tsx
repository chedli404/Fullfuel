
import { Link } from 'wouter';

interface LiveNowButtonProps {
  isLive: boolean;
  liveUrl?: string;
}

const LiveNowButton: React.FC<LiveNowButtonProps> = ({ isLive, liveUrl }) => {
  if (!isLive) return null;
  return (
    <div className="fixed bottom-8 right-8 z-40">
      <Link href={liveUrl || '/videos'}>
        <a className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-full font-medium transition-colors shadow-lg">
          <span className="w-3 h-3 bg-dark rounded-full animate-pulse"></span>
          <span className="uppercase font-bold text-sm">Live Now</span>
        </a>
      </Link>
    </div>
  );
};

export default LiveNowButton;
