'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { Footer } from '@/components/layout/Footer';
import { CreateModal } from '@/components/modals/CreateModal';
import { HomeFeed } from '@/components/feed/HomeFeed';
import { ProfileView } from '@/components/profile/ProfileView';
import { MiniPlayer } from '@/components/audio/MiniPlayer';
import { PlaySquare, MessageSquare, Radio, Plus } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'reels' | 'inbox' | 'profile'>('home');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 pb-24 md:pb-0">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {selectedProfileUserId ? (
          <ProfileView 
            userId={selectedProfileUserId} 
            currentUserId={currentUser?.id}
            onBackToFeed={() => setSelectedProfileUserId(null)} 
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-xs font-medium mb-3">
                      <span>Phase 6 Audio Uploads & Player</span>
                      <span aria-hidden="true">·</span>
                      <span>Real Audio Storage & Playback</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-950">
                      Harmonics Home Feed
                    </h1>
                  </div>

                  {currentUser && (
                    <button 
                      onClick={() => setIsCreateOpen(true)}
                      className="px-5 py-2.5 rounded-xl bg-neutral-950 text-white text-xs font-medium hover:bg-neutral-800 transition-colors inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Upload Track
                    </button>
                  )}
                </div>

                <HomeFeed onSelectProfile={(userId) => setSelectedProfileUserId(userId)} />
              </div>
            )}

            {activeTab === 'reels' && (
              <div className="max-w-xl mx-auto space-y-6">
                <div className="p-6 rounded-2xl border border-neutral-200 bg-neutral-50 text-center">
                  <PlaySquare className="w-10 h-10 mx-auto text-neutral-900 mb-3" />
                  <h3 className="font-bold text-lg text-neutral-950">Music Reels & Teasers</h3>
                  <p className="text-xs text-neutral-500 mt-1">Playback is stopped and mini-player hidden in Reels mode.</p>
                </div>
                <div className="aspect-[9/16] max-h-[500px] rounded-3xl bg-neutral-950 text-white flex flex-col justify-between p-8 relative overflow-hidden shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
                  <div className="relative flex items-center justify-between">
                    <span className="text-xs font-medium bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">#AmbientReel</span>
                    <Radio className="w-5 h-5 animate-pulse text-emerald-400" />
                  </div>
                  <div className="relative space-y-2">
                    <h4 className="font-bold text-xl">Floating Through Ether</h4>
                    <p className="text-xs text-neutral-300">Aura Collective · 12.4k views</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'inbox' && (
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold">AC</div>
                    <div>
                      <h4 className="font-semibold text-sm text-neutral-950">Aura Collective</h4>
                      <p className="text-xs text-neutral-500">Loved your comment on Midnight Resonance!</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-neutral-400">2m ago</span>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              currentUser ? (
                <ProfileView 
                  userId={currentUser.id} 
                  currentUserId={currentUser.id}
                  onBackToFeed={() => setActiveTab('home')} 
                />
              ) : (
                <div className="text-center py-20">
                  <h3 className="font-bold text-lg text-neutral-950 mb-2">Sign in required</h3>
                  <p className="text-xs text-neutral-500 mb-6">Please sign in to view and edit your profile.</p>
                  <button 
                    onClick={() => {
                      const btn = document.querySelector('header button') as HTMLButtonElement;
                      btn?.click();
                    }}
                    className="px-6 py-2.5 bg-neutral-950 text-white rounded-xl text-xs font-medium"
                  >
                    Sign In / Register
                  </button>
                </div>
              )
            )}
          </>
        )}
      </main>

      {/* Persistent Mini Player (hidden on reels) */}
      <MiniPlayer activeTab={activeTab} />

      <BottomNav 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setSelectedProfileUserId(null);
          setActiveTab(tab);
        }} 
        onOpenCreate={() => setIsCreateOpen(true)} 
      />

      <CreateModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

      <Footer />
    </div>
  );
}
