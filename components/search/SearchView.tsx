'use client';

import React, { useState } from 'react';
import { Search, Music, Users, ListMusic, FileText, Play } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useAudio } from '@/components/audio/AudioPlayerContext';
import { LoadingState, EmptyState } from '@/components/ui/States';

interface SearchViewProps {
  onSelectProfile: (userId: string) => void;
}

export function SearchView({ onSelectProfile }: SearchViewProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'users' | 'tracks' | 'playlists' | 'posts'>('all');
  const [results, setResults] = useState<{ users: any[]; tracks: any[]; playlists: any[]; posts: any[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const { playTrack } = useAudio();

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&filter=${filter}`);
      const data = await res.json();
      if (res.ok) {
        setResults(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-4 w-5 h-5 text-neutral-400" />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users, songs, artists, playlists, or posts..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-neutral-300 text-sm focus:outline-none focus:border-neutral-950 shadow-sm"
        />
        <button type="submit" className="absolute right-3 top-2.5 px-5 py-2 bg-neutral-950 text-white rounded-xl text-xs font-medium hover:bg-neutral-800">
          Search
        </button>
      </form>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {(['all', 'users', 'tracks', 'playlists', 'posts'] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); if (query) handleSearch(); }}
            className={`px-4 py-2 rounded-xl text-xs font-medium capitalize transition-colors ${filter === f ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && <LoadingState message="Searching Harmonics..." />}

      {results && !loading && (
        <div className="space-y-8">
          {/* Users */}
          {(filter === 'all' || filter === 'users') && results.users.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">Users</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.users.map((user: any) => (
                  <button 
                    key={user.id}
                    onClick={() => onSelectProfile(user.id)}
                    className="p-4 rounded-2xl border border-neutral-200 bg-white hover:border-neutral-300 flex items-center gap-3 text-left"
                  >
                    <Avatar src={user.image} name={user.name} size="md" />
                    <div>
                      <h4 className="font-semibold text-sm text-neutral-950">{user.name || 'User'}</h4>
                      <p className="text-xs text-neutral-400 font-mono">@{user.username || user.id.substring(0, 8)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tracks */}
          {(filter === 'all' || filter === 'tracks') && results.tracks.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">Songs & Tracks</h3>
              <div className="space-y-3">
                {results.tracks.map((track: any) => (
                  <div key={track.id} className="p-4 rounded-2xl border border-neutral-200 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
                        <Music className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-neutral-950">{track.title}</h4>
                        <p className="text-xs text-neutral-500">{track.genre || 'Original'} · {track.plays} plays</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => playTrack({
                        id: track.id,
                        title: track.title,
                        artist: track.user?.name || 'Creator',
                        fileUrl: track.fileUrl,
                        coverArtUrl: track.coverArtUrl,
                      })}
                      className="w-10 h-10 rounded-full bg-neutral-950 text-white flex items-center justify-center hover:bg-neutral-800"
                    >
                      <Play className="w-4 h-4 ml-0.5 fill-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Playlists */}
          {(filter === 'all' || filter === 'playlists') && results.playlists.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">Playlists</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.playlists.map((pl: any) => (
                  <div key={pl.id} className="p-4 rounded-2xl border border-neutral-200 bg-white">
                    <h4 className="font-semibold text-sm text-neutral-950">{pl.title}</h4>
                    <p className="text-xs text-neutral-500 line-clamp-1 mt-1">{pl.description || 'Public playlist'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Posts */}
          {(filter === 'all' || filter === 'posts') && results.posts.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">Posts</h3>
              <div className="space-y-4">
                {results.posts.map((post: any) => (
                  <div key={post.id} className="p-6 rounded-2xl border border-neutral-200 bg-white">
                    <p className="text-sm text-neutral-900">{post.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.users.length === 0 && results.tracks.length === 0 && results.playlists.length === 0 && results.posts.length === 0 && (
            <EmptyState title="No results found" description="Try searching with different keywords." />
          )}
        </div>
      )}
    </div>
  );
}
