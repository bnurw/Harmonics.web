'use client';

import React from 'react';
import { useAudio } from './AudioPlayerContext';
import { Play, Pause, Volume2, SkipBack, SkipForward } from 'lucide-react';

interface MiniPlayerProps {
  activeTab: string;
}

export function MiniPlayer({ activeTab }: MiniPlayerProps) {
  const { currentTrack, isPlaying, currentTime, duration, volume, togglePlay, seek, setVolume } = useAudio();

  // Hide mini player when in Music Reels
  if (!currentTrack || activeTab === 'reels') {
    return null;
  }

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = Math.floor(secs % 60);
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-6 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-1/4">
          <div className="w-10 h-10 rounded-lg bg-neutral-900 text-white overflow-hidden shrink-0 flex items-center justify-center">
            {currentTrack.coverArtUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentTrack.coverArtUrl} alt={currentTrack.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="font-bold text-sm">♪</span>
            )}
          </div>
          <div className="truncate">
            <h4 className="text-xs font-semibold text-neutral-950 truncate">{currentTrack.title}</h4>
            <p className="text-[11px] text-neutral-500 truncate">{currentTrack.artist}</p>
          </div>
        </div>

        <div className="flex-1 max-w-xl flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-4">
            <button 
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-neutral-950 text-white flex items-center justify-center hover:bg-neutral-800 transition-colors shadow"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5 fill-white" />}
            </button>
          </div>
          <div className="w-full flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <input 
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-neutral-200 rounded-full appearance-none accent-neutral-950 cursor-pointer"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 w-1/4 justify-end text-neutral-500">
          <Volume2 className="w-4 h-4" />
          <input 
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-1 bg-neutral-200 rounded-full appearance-none accent-neutral-950 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
