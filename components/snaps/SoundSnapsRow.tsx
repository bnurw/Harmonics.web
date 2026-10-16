'use client';

import React, { useState, useEffect } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Plus, Play, Pause, X, Disc3 } from 'lucide-react';

interface Snap {
  id: string;
  title: string;
  fileUrl: string;
  duration: number;
  createdAt: string;
  expiresAt: string;
  user: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
}

interface SoundSnapsRowProps {
  currentUser: any;
}

export function SoundSnapsRow({ currentUser }: SoundSnapsRowProps) {
  const [snaps, setSnaps] = useState<Snap[]>([]);
  const [activeSnap, setActiveSnap] = useState<Snap | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCreatingSnap, setIsCreatingSnap] = useState(false);
  const [snapTitle, setSnapTitle] = useState('');
  const [snapAudioUrl, setSnapAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchSnaps() {
      try {
        const res = await fetch('/api/snaps');
        const data = await res.json();
        if (res.ok && isMounted) {
          setSnaps(data.snaps || []);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchSnaps();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateSnap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapTitle) return;
    setLoading(true);
    try {
      const res = await fetch('/api/snaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: snapTitle,
          fileUrl: snapAudioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          duration: 20,
        }),
      });
      if (res.ok) {
        setIsCreatingSnap(false);
        setSnapTitle('');
        setSnapAudioUrl('');
        const updated = await fetch('/api/snaps').then((r) => r.json());
        setSnaps(updated.snaps || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
        {currentUser && (
          <button 
            onClick={() => setIsCreatingSnap(true)}
            className="flex flex-col items-center gap-1.5 shrink-0 group"
          >
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-neutral-300 flex items-center justify-center bg-neutral-50 group-hover:border-neutral-950 transition-colors">
              <Plus className="w-6 h-6 text-neutral-600 group-hover:text-neutral-950" />
            </div>
            <span className="text-xs font-medium text-neutral-700">Add Snap</span>
          </button>
        )}

        {snaps.map((snap) => (
          <button 
            key={snap.id}
            onClick={() => setActiveSnap(snap)}
            className="flex flex-col items-center gap-1.5 shrink-0 group"
          >
            <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-neutral-900 to-neutral-600 group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full bg-white p-0.5 overflow-hidden">
                <Avatar src={snap.user.image} name={snap.user.name} size="lg" className="w-full h-full" />
              </div>
            </div>
            <span className="text-xs font-medium text-neutral-800 truncate max-w-[70px]">
              {snap.user.name?.split(' ')[0] || 'Creator'}
            </span>
          </button>
        ))}
      </div>

      {activeSnap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-neutral-950 text-white rounded-3xl w-full max-w-sm p-8 relative shadow-2xl flex flex-col items-center text-center">
            <button 
              onClick={() => setActiveSnap(null)}
              className="absolute top-6 right-6 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-8">
              <Avatar src={activeSnap.user.image} name={activeSnap.user.name} size="sm" />
              <div className="text-left">
                <h4 className="font-semibold text-sm">{activeSnap.user.name}</h4>
                <p className="text-[11px] text-neutral-400">Expires in 24h</p>
              </div>
            </div>

            <div className="relative w-48 h-48 rounded-full bg-neutral-900 border-4 border-neutral-800 flex items-center justify-center shadow-2xl mb-8 group">
              <div className="absolute inset-2 rounded-full border border-neutral-800/60" />
              <div className="absolute inset-6 rounded-full border border-neutral-800/40" />
              <div className={`w-20 h-20 rounded-full bg-gradient-to-tr from-neutral-950 to-neutral-800 flex items-center justify-center border-2 border-neutral-700 ${isPlaying ? 'animate-spin' : ''}`}>
                <Disc3 className="w-10 h-10 text-neutral-400" />
              </div>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
              >
                <div className="w-12 h-12 rounded-full bg-white text-neutral-950 flex items-center justify-center shadow-lg">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5 fill-neutral-950" />}
                </div>
              </button>
            </div>

            <h3 className="font-bold text-lg mb-2">{activeSnap.title}</h3>
            <p className="text-xs text-neutral-400 mb-6">SoundSnap teaser (20s)</p>

            <div className="w-full flex items-center gap-3 pt-4 border-t border-neutral-800">
              <input 
                type="text" 
                placeholder="Reply to snap..." 
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-neutral-600"
              />
              <button 
                onClick={() => alert('Reply sent!')}
                className="px-4 py-2.5 bg-white text-neutral-950 rounded-xl text-xs font-semibold hover:bg-neutral-200"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {isCreatingSnap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-neutral-200 w-full max-w-md p-8 relative shadow-2xl">
            <button 
              onClick={() => setIsCreatingSnap(false)}
              className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-950"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-neutral-950 mb-2">Create SoundSnap</h2>
            <p className="text-xs text-neutral-500 mb-6">Record or upload a 15–30 second audio snippet (expires in 24 hours).</p>

            <form onSubmit={handleCreateSnap} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Snap Title</label>
                <input 
                  type="text" 
                  required
                  value={snapTitle}
                  onChange={(e) => setSnapTitle(e.target.value)}
                  placeholder="Studio acoustic preview..."
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Audio Source URL (.mp3)</label>
                <input 
                  type="text" 
                  value={snapAudioUrl}
                  onChange={(e) => setSnapAudioUrl(e.target.value)}
                  placeholder="https://... (Leave blank for default sample)"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-neutral-950 font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsCreatingSnap(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-medium text-white bg-neutral-950 hover:bg-neutral-800 rounded-xl disabled:opacity-50"
                >
                  {loading ? 'Publishing...' : 'Publish Snap (24h)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
