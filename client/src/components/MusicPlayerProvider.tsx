
// TypeScript global declarations for YouTube API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

import React, { createContext, useContext, useState, useRef, useEffect, useMemo, ReactNode } from 'react';
import { Pause, Play, X } from 'lucide-react';
import { Mix } from '@shared/schema';

export interface MusicPlayerContextType {
  mixes: Mix[];
  setMixes: React.Dispatch<React.SetStateAction<Mix[]>>;
  activeMix: string | null;
  setActiveMix: React.Dispatch<React.SetStateAction<string | null>>;
  // isPlaying is now derived, not state
  localVolume: number;
  setLocalVolume: React.Dispatch<React.SetStateAction<number>>;
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  audioRef: React.RefObject<HTMLAudioElement>;
  ytPlayerRef: React.RefObject<any>;
  ytReady: boolean;
  setYtReady: React.Dispatch<React.SetStateAction<boolean>>;

  handleSeek: (value: number) => void;
  handleBarPlayPause: () => void;
}


const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const useMusicPlayer = () => {
  const ctx = useContext(MusicPlayerContext);
  if (!ctx) throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  return ctx;
};

interface MusicPlayerProviderProps {
  children: ReactNode;
}

export const MusicPlayerProvider = ({ children }: MusicPlayerProviderProps) => {
  // Player state
  const [mixes, setMixes] = useState<Mix[]>([]); // To be set from API or page
  const [activeMix, setActiveMix] = useState<string | null>(null);
  // Remove isPlaying state, use derived value
  const [ytPlayerState, setYtPlayerState] = useState<number | null>(null); // For YouTube
  const [localVolume, setLocalVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ytReady, setYtReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const ytPlayerRef = useRef<any>(null);

  // Debug: log audioRef.current when activeMix changes
  useEffect(() => {
    console.log('audioRef.current in effect:', audioRef.current);
  }, [activeMix]);

  // --- YouTube player setup and cleanup ---
  useEffect(() => {
    setYtReady(false);
    const mix = mixes?.find((mix) => mix.id === activeMix);
    const ytDiv = document.getElementById('youtube-player');
    if (!mix || !mix.youtubeId || !ytDiv) {
      if (ytPlayerRef.current) {
        ytPlayerRef.current.destroy?.();
        ytPlayerRef.current = null;
      }
      return;
    }
    // Load YouTube IFrame API if not loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }
    function createYTPlayer() {
      if (!mix || !ytDiv) return;
      if (ytPlayerRef.current) {
        ytPlayerRef.current.destroy();
      }
      ytPlayerRef.current = new window.YT.Player(ytDiv, {
        videoId: mix.youtubeId,
        events: {
          onReady: (event: any) => {
            ytPlayerRef.current = event.target;
            event.target.setVolume(localVolume);
            event.target.playVideo();
            setYtReady(true);
          },
        },
      });
    }
    if (window.YT && window.YT.Player) {
      createYTPlayer();
    } else {
      window.onYouTubeIframeAPIReady = createYTPlayer;
    }
    return () => {
      if (ytPlayerRef.current) {
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      }
      setYtReady(false);
    };
    // eslint-disable-next-line
  }, [activeMix, mixes]);

  // --- Volume effect for both audio and YouTube ---
  useEffect(() => {
    const mix = mixes?.find((mix) => mix.id === activeMix);
    if (mix?.audioUrl && audioRef.current) {
      audioRef.current.volume = localVolume / 100;
    } else if (mix?.youtubeId && ytPlayerRef.current && ytPlayerRef.current.setVolume) {
      ytPlayerRef.current.setVolume(localVolume);
    }
  }, [localVolume, activeMix, mixes]);

  // --- Update currentTime and duration for audio ---
  useEffect(() => {
    const mix = mixes?.find((mix) => mix.id === activeMix);
    if (mix?.audioUrl && audioRef.current) {
      const audio = audioRef.current;
      const update = () => {
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration || 0);
      };
      audio.addEventListener('timeupdate', update);
      audio.addEventListener('loadedmetadata', update);
      return () => {
        audio.removeEventListener('timeupdate', update);
        audio.removeEventListener('loadedmetadata', update);
      };
    }
  }, [activeMix, mixes]);

  // --- Update currentTime and duration for YouTube (only when ready) ---
  useEffect(() => {
    let interval: any;
    const mix = mixes?.find((mix) => mix.id === activeMix);
    if (mix?.youtubeId && ytReady && ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
      const update = () => {
        const cur = ytPlayerRef.current.getCurrentTime?.();
        const dur = ytPlayerRef.current.getDuration?.();
        if (typeof cur === 'number' && !isNaN(cur)) setCurrentTime(cur);
        if (typeof dur === 'number' && !isNaN(dur)) setDuration(dur);
      };
      interval = setInterval(update, 500);
    }
    return () => interval && clearInterval(interval);
  }, [activeMix, mixes, ytReady]);

  // --- Reset currentTime when activeMix changes ---
  useEffect(() => {
    setCurrentTime(0);
    const mix = mixes?.find((mix) => mix.id === activeMix);
    if (mix?.audioUrl && audioRef.current) {
      audioRef.current.currentTime = 0;
    } else if (mix?.youtubeId && ytPlayerRef.current && ytPlayerRef.current.seekTo) {
      ytPlayerRef.current.seekTo(0, true);
    }
  }, [activeMix]);

  // --- Handler for seeking ---
  const handleSeek = (value: number) => {
    const mix = mixes?.find((mix) => mix.id === activeMix);
    if (mix?.audioUrl && audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    } else if (mix?.youtubeId && ytPlayerRef.current && ytPlayerRef.current.seekTo) {
      ytPlayerRef.current.seekTo(value, true);
      setCurrentTime(value);
    }
  };

  // --- Go to next mix when current finishes & track YouTube state ---
  useEffect(() => {
    const mix = mixes?.find((mix) => mix.id === activeMix);
    if (!mix) return;
    // For audio
    if (mix.audioUrl && audioRef.current) {
      const handleEnded = () => {
        const currentIdx = mixes.findIndex((m) => m.id === activeMix);
        if (currentIdx !== -1 && mixes[currentIdx + 1]) {
          setActiveMix(mixes[currentIdx + 1].id);
        } else {
          setActiveMix(null);
        }
      };
      audioRef.current.addEventListener('ended', handleEnded);
      return () => audioRef.current?.removeEventListener('ended', handleEnded);
    }
    // For YouTube
    if (mix.youtubeId && ytPlayerRef.current && typeof ytPlayerRef.current.addEventListener === 'function') {
      const handleYTState = (event: any) => {
        setYtPlayerState(event.data);
        if (event.data === window.YT?.PlayerState?.ENDED) {
          const currentIdx = mixes.findIndex((m) => m.id === activeMix);
          if (currentIdx !== -1 && mixes[currentIdx + 1]) {
            setActiveMix(mixes[currentIdx + 1].id);
          } else {
            setActiveMix(null);
          }
        }
      };
      ytPlayerRef.current.addEventListener('onStateChange', handleYTState);
      return () => ytPlayerRef.current?.removeEventListener('onStateChange', handleYTState);
    }
  }, [activeMix, mixes]);

  // --- Play/Pause handler for bar ---
  const handleBarPlayPause = () => {
    const mix = mixes?.find((mix) => mix.id === activeMix);
    if (mix?.audioUrl && audioRef.current) {
      if (!audioRef.current.paused) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    } else if (mix?.youtubeId && ytPlayerRef.current) {
      // For YouTube, use last known state
      if (ytPlayerState === window.YT?.PlayerState?.PLAYING) {
        ytPlayerRef.current.pauseVideo();
      } else {
        ytPlayerRef.current.playVideo();
      }
    }
  };

  // --- Expose controls and state ---
  // --- Derived isPlaying value ---
  const isPlaying = useMemo(() => {
    const mix = mixes?.find((mix) => mix.id === activeMix);
    if (mix?.audioUrl && audioRef.current) {
      return !audioRef.current.paused;
    } else if (mix?.youtubeId) {
      return ytPlayerState === window.YT?.PlayerState?.PLAYING;
    }
    return false;
  }, [mixes, activeMix, audioRef.current, ytPlayerState]);

  const value = {
    mixes,
    setMixes,
    activeMix,
    setActiveMix,
    // isPlaying is now derived
    isPlaying,
    setIsPlaying: () => {}, // no-op for compatibility
    localVolume,
    setLocalVolume,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    audioRef,
    ytPlayerRef,
    ytReady,
    setYtReady,
    handleSeek,
    handleBarPlayPause,
  };

  // --- Music bar UI (global, persistent) ---
  const mix = mixes?.find((mix) => mix.id === activeMix);

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
      {/* Music bar UI, only if a mix is active */}
      {activeMix && mix && (
        <div className="fixed inset-x-0 bottom-0 bg-black bg-opacity-90 backdrop-blur-md border-t border-[#1A1A1A] p-2 md:p-4 z-40">
          <div className="container mx-auto px-1 md:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
              {/* Song info and close */}
              <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-start">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <p className="font-bold mb-0 text-sm md:text-base truncate max-w-[120px] md:max-w-xs">{mix.title}</p>
                    <button
                      onClick={() => setActiveMix(null)}
                      className="p-1 ml-1 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                      title="Close player"
                    >
                      <X className="text-white h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs md:text-sm text-gray-400 truncate max-w-[120px] md:max-w-xs">{mix.artist}</p>
                </div>
              </div>
              {/* Play/Pause and status */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
                <button
                  onClick={handleBarPlayPause}
                  className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="text-white h-5 w-5" /> : <Play className="text-white h-5 w-5" />}
                </button>
                <span className="text-xs text-gray-400  xs:inline">Audio Only</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              {/* Volume and player */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={localVolume}
                  onChange={e => setLocalVolume(Number(e.target.value))}
                  className="w-20 md:w-24 accent-primary"
                  aria-label="Volume"
                />
                <span className="text-xs text-gray-400">{localVolume}</span>
                {mix.audioUrl ? (
                  <audio
                    ref={audioRef}
                    id="audio-player"
                    src={mix.audioUrl}
                    controls
                    autoPlay
                    className="w-32 md:w-64 h-8 md:h-10"
                    style={{ background: 'black' }}
                  />
                ) : mix.youtubeId ? (
                  <div style={{ display: 'none' }}>
                    <div id="youtube-player" />
                  </div>
                ) : (
                  <span className="text-red-500">No audio or video available for this mix.</span>
                )}
              </div>
              {/* Timeline/Seek bar */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
                <input
                  type="range"
                  min="0"
                  max={duration && !isNaN(duration) ? duration : 0}
                  value={currentTime}
                  onChange={e => handleSeek(Number(e.target.value))}
                  className="w-32 md:w-48 accent-primary"
                  aria-label="Seek"
                  disabled={!duration || isNaN(duration)}
                />
                <span className="text-xs text-gray-400">
                  {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} /
                  {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Hidden YouTube player div for global use */}
      <div id="youtube-player" style={{ display: 'none' }} />
    </MusicPlayerContext.Provider>
  );
};
