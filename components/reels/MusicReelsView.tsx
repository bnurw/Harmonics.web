'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Heart, MessageSquare, Repeat2, ChevronDown, ChevronUp } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingState, EmptyState } from '@/components/ui/States';

interface Reel {
  id: string;
  title?: string;
  songArtist?: string;
  content: string;
  mediaUrl: string;
  coverArtUrl?: string;
  genre?: string;
  lyrics?: string;
  author: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
  _count: {
    likes: number;
    comments: number;
    reposts: number;
  };
}

export function MusicReelsView() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadReels() {
      try {
        setLoading(true);
        const res = await fetch('/api/reels');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        if (isMounted) setReels(data.reels || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadReels();
    return () => {
      isMounted = false;
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (reels.length === 0) return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;
    audio.pause();
    audio.src = reels[currentIndex].mediaUrl;
    audio.currentTime = 0;

    const updateTime = () => {
      if (isMounted) setCurrentTime(audio.currentTime);
    };
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', () => {
      if (isMounted) setIsPlaying(false);
    });

    audio.play().then(() => {
      if (isMounted) setIsPlaying(true);
    }).catch(() => {
      if (isMounted) setIsPlaying(false);
    });

    return () => {
      isMounted = false;
      audio.removeEventListener('timeupdate', updateTime);
      audio.pause();
    };
  }, [currentIndex, reels]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleScroll = (direction: 'up' | 'down') => {
    if (direction === 'down' && currentIndex < reels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (direction === 'up' && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (loading) return <LoadingState message="Loading music reels..." />;
  if (reels.length === 0) return <EmptyState title="No music reels available" description="Upload a music track to see it featured here." />;

  const currentReel = reels[currentIndex];

  const lyricLines = currentReel.lyrics 
    ? currentReel.lyrics.split('\n') 
    : [
        "In the quiet hum of digital space,",
        "We trace the echoes of a distant time,",
        "Harmonics rising through the ambient haze,",
        "A melody woven in rhythm and rhyme."
      ];

  return (
    <div className="relative w-full h-[calc(100vh-8rem)] md:h-[calc(100vh-5rem)] bg-neutral-950 rounded-3xl overflow-hidden flex flex-col justify-between text-white shadow-2xl">
      <div 
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-40 scale-125 pointer-events-none"
        style={{ backgroundImage: `url(${currentReel.coverArtUrl || 'https://picsum.photos/seed/harmonics/600/600'})` }}
      />

      <div className="relative z-10 p-6 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider uppercase bg-white/10 backdrop-blur-md px-3 py-1 rounded-full">
          Music Reel {currentIndex + 1} / {reels.length}
        </span>
        <div className="flex flex-col gap-1">
          <button 
            onClick={() => handleScroll('up')}
            disabled={currentIndex === 0}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center disabled:opacity-30 transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleScroll('down')}
            disabled={currentIndex === reels.length - 1}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center disabled:opacity-30 transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-center px-6 gap-8">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0">
          {currentReel.coverArtUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentReel.coverArtUrl} alt={currentReel.title || 'Reel Cover'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-3xl font-bold">
              {(currentReel.title || 'R')[0]}
            </div>
          )}
          <button 
            onClick={togglePlay}
            className="absolute inset-0 bg-black/30 hover:bg-black/10 transition-colors flex items-center justify-center"
          >
            <div className="w-14 h-14 rounded-full bg-white text-neutral-950 flex items-center justify-center shadow-xl">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5 fill-neutral-950" />}
            </div>
          </button>
        </div>

        <div className="max-w-md w-full text-center md:text-left space-y-3 overflow-hidden h-36 flex flex-col justify-center">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">Synchronized Lyrics</span>
          <div className="space-y-2 transition-all duration-500">
            {lyricLines.map((line, idx) => {
              const active = idx === Math.floor(currentTime / 5) % lyricLines.length;
              return (
                <p 
                  key={idx} 
                  className={`text-sm sm:text-base font-medium transition-all duration-300 ${active ? 'text-white scale-105 font-bold drop-shadow' : 'text-white/40'}`}
                >
                  {line}
                </p>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative z-10 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Avatar src={currentReel.author.image} name={currentReel.author.name} size="sm" />
            <span className="font-semibold text-sm">{currentReel.author.name || 'Creator'}</span>
          </div>
          <h2 className="text-xl font-bold">{currentReel.title || 'Untitled Track'}</h2>
          <p className="text-xs text-neutral-300 max-w-lg line-clamp-2">{currentReel.content}</p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button className="flex flex-col items-center gap-1 text-white hover:text-neutral-300">
            <Heart className="w-6 h-6" />
            <span className="text-[10px] font-semibold">{currentReel._count.likes}</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white hover:text-neutral-300">
            <MessageSquare className="w-6 h-6" />
            <span className="text-[10px] font-semibold">{currentReel._count.comments}</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white hover:text-neutral-300">
            <Repeat2 className="w-6 h-6" />
            <span className="text-[10px] font-semibold">{currentReel._count.reposts}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
