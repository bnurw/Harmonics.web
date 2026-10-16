'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ListMusic, Plus, Lock, Globe, Trash2 } from 'lucide-react';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { useAudio } from '@/components/audio/AudioPlayerContext';

interface PlaylistViewProps {
  currentUser: any;
}

export function PlaylistsView({ currentUser }: PlaylistViewProps) {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any | null>(null);

  const { playTrack } = useAudio();

  const fetchPlaylists = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/playlists');
      const data = await res.json();
      if (res.ok) {
        setPlaylists(data.playlists || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (isMounted) {
        await fetchPlaylists();
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [fetchPlaylists]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, isPublic }),
      });
      if (res.ok) {
        setIsCreating(false);
        setTitle('');
        setDescription('');
        fetchPlaylists();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    try {
      const res = await fetch(`/api/playlists/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSelectedPlaylist(null);
        fetchPlaylists();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingState message="Loading playlists..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-950">Playlists</h1>
          <p className="text-xs text-neutral-500 mt-1">Organize and share your favorite collections of tracks.</p>
        </div>
        {currentUser && (
          <button 
            onClick={() => setIsCreating(true)}
            className="px-5 py-2.5 rounded-xl bg-neutral-950 text-white text-xs font-medium hover:bg-neutral-800 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Playlist
          </button>
        )}
      </div>

      {selectedPlaylist ? (
        <div className="space-y-6">
          <button 
            onClick={() => setSelectedPlaylist(null)}
            className="text-xs font-medium text-neutral-500 hover:text-neutral-950"
          >
            ← Back to Playlists
          </button>

          <div className="bg-white rounded-3xl border border-neutral-200 p-8 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-bold text-2xl overflow-hidden shrink-0">
                {selectedPlaylist.coverArtUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedPlaylist.coverArtUrl} alt={selectedPlaylist.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <ListMusic className="w-8 h-8" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-neutral-950">{selectedPlaylist.title}</h2>
                  {selectedPlaylist.isPublic ? <Globe className="w-4 h-4 text-neutral-400" /> : <Lock className="w-4 h-4 text-neutral-400" />}
                </div>
                <p className="text-xs text-neutral-500">{selectedPlaylist.description || 'No description provided.'}</p>
                <p className="text-xs text-neutral-400 mt-2">Created by {selectedPlaylist.user?.name || 'Creator'}</p>
              </div>
            </div>

            {currentUser && currentUser.id === selectedPlaylist.userId && (
              <button 
                onClick={() => handleDelete(selectedPlaylist.id)}
                className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Tracks</h3>
            {selectedPlaylist.playlistTracks?.length > 0 ? (
              selectedPlaylist.playlistTracks.map(({ track }: any) => (
                <div key={track.id} className="p-4 rounded-2xl border border-neutral-200 bg-white flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-neutral-950">{track.title}</h4>
                    <p className="text-xs text-neutral-500">{track.genre || 'Original'} · {track.plays} plays</p>
                  </div>
                  <button 
                    onClick={() => playTrack({
                      id: track.id,
                      title: track.title,
                      artist: 'Creator',
                      fileUrl: track.fileUrl,
                      coverArtUrl: track.coverArtUrl,
                    })}
                    className="px-4 py-2 bg-neutral-950 text-white rounded-xl text-xs font-medium"
                  >
                    Play
                  </button>
                </div>
              ))
            ) : (
              <EmptyState title="Playlist is empty" description="Add tracks to this playlist to start listening." />
            )}
          </div>
        </div>
      ) : (
        playlists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((pl: any) => (
              <div 
                key={pl.id}
                onClick={() => setSelectedPlaylist(pl)}
                className="p-6 rounded-2xl border border-neutral-200 bg-white hover:border-neutral-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-video rounded-xl bg-neutral-100 mb-4 overflow-hidden">
                    {pl.coverArtUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={pl.coverArtUrl} alt={pl.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <ListMusic className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-neutral-950 text-base">{pl.title}</h3>
                    {pl.isPublic ? <Globe className="w-3.5 h-3.5 text-neutral-400" /> : <Lock className="w-3.5 h-3.5 text-neutral-400" />}
                  </div>
                  <p className="text-xs text-neutral-500 line-clamp-2">{pl.description || 'Public playlist'}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
                  <span>{pl.playlistTracks?.length || 0} tracks</span>
                  <span>By {pl.user?.name || 'Creator'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No playlists found" description="Create your first playlist to get started." />
        )
      )}

      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-neutral-200 w-full max-w-md p-8 relative shadow-2xl">
            <h2 className="text-xl font-bold text-neutral-950 mb-4">Create Playlist</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Playlist Title</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Late Night Ambient..."
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Description</label>
                <textarea 
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="My favorite late night listening tracks..."
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-neutral-950 resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded border-neutral-300 text-neutral-950 focus:ring-0"
                />
                <label htmlFor="isPublic" className="text-xs text-neutral-700 font-medium">
                  Make playlist public
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-neutral-950 hover:bg-neutral-800 rounded-xl"
                >
                  Create Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
