'use client';

import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

interface AudioPlayerControlsProps {
  trackTitle?: string;
  artistName?: string;
}

export function AudioPlayerControls({ trackTitle = 'Select a track', artistName = 'Harmonics Creator' }: AudioPlayerControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(30);

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-1/4">
          <div className="w-10 h-10 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
            ♪
          </div>
          <div className="truncate">
            <h4 className="text-xs font-semibold text-neutral-950 truncate">{trackTitle}</h4>
            <p className="text-[11px] text-neutral-500 truncate">{artistName}</p>
          </div>
        </div>

        <div className="flex-1 max-w-xl flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-4">
            <button className="text-neutral-500 hover:text-neutral-950 transition-colors">
              <SkipBack className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-9 h-9 rounded-full bg-neutral-950 text-white flex items-center justify-center hover:bg-neutral-800 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5 fill-white" />}
            </button>
            <button className="text-neutral-500 hover:text-neutral-950 transition-colors">
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
          <div className="w-full flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
            <span>01:12</span>
            <div className="flex-1 h-1 bg-neutral-200 rounded-full overflow-hidden">
              <div className="h-full bg-neutral-950" style={{ width: `${progress}%` }} />
            </div>
            <span>03:45</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 w-1/4 justify-end text-neutral-500">
          <Volume2 className="w-4 h-4" />
          <div className="w-20 h-1 bg-neutral-200 rounded-full overflow-hidden">
            <div className="h-full bg-neutral-950 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}
