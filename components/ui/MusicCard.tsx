import React from 'react';
import { Play, Heart } from 'lucide-react';

interface MusicCardProps {
  title: string;
  artist: string;
  genre: string;
  duration: string;
  coverArtUrl?: string;
  plays: number;
  likes: number;
  onPlay?: () => void;
  onLike?: () => void;
}

export function MusicCard({
  title,
  artist,
  genre,
  duration,
  coverArtUrl,
  plays,
  likes,
  onPlay,
  onLike,
}: MusicCardProps) {
  return (
    <div className="p-4 rounded-2xl border border-neutral-200 bg-white hover:border-neutral-300 transition-all flex flex-col justify-between">
      <div>
        <div className="relative aspect-square rounded-xl bg-neutral-100 overflow-hidden mb-4 group">
          {coverArtUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverArtUrl} alt={title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-white font-bold text-xl">
              {title[0]}
            </div>
          )}
          <button 
            onClick={onPlay}
            className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
          >
            <div className="w-12 h-12 rounded-full bg-white text-neutral-950 flex items-center justify-center shadow-lg">
              <Play className="w-5 h-5 ml-0.5 fill-neutral-950" />
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
          <span>{genre}</span>
          <span aria-hidden="true">·</span>
          <span>{duration}</span>
        </div>

        <h3 className="font-semibold text-neutral-950 truncate">{title}</h3>
        <p className="text-sm text-neutral-600 truncate">{artist}</p>
      </div>

      <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
        <span>{plays.toLocaleString()} plays</span>
        <button onClick={onLike} className="flex items-center gap-1 hover:text-neutral-950 transition-colors">
          <Heart className="w-4 h-4" />
          <span>{likes}</span>
        </button>
      </div>
    </div>
  );
}
