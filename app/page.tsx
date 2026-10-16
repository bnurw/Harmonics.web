'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { Footer } from '@/components/layout/Footer';
import { CreateModal } from '@/components/modals/CreateModal';
import { HomeFeed } from '@/components/feed/HomeFeed';
import { ProfileView } from '@/components/profile/ProfileView';
import { MusicReelsView } from '@/components/reels/MusicReelsView';
import { SoundSnapsRow } from '@/components/snaps/SoundSnapsRow';
import { SearchView } from '@/components/search/SearchView';
import { PlaylistsView } from '@/components/playlists/PlaylistsView';
import { InboxView } from '@/components/messaging/InboxView';
import { MiniPlayer } from '@/components/audio/MiniPlayer';
import { Plus } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'playlists' | 'reels' | 'inbox' | 'profile'>('home');
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
      <Navbar onNavigate={(tab) => {
        setSelectedProfileUserId(null);
        setActiveTab(tab as any);
      }} />

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
              <div className="space-y-6">
                <SoundSnapsRow currentUser={currentUser} />

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-xs font-medium mb-3">
                      <span>Phase 8 Social, Playlists & Messaging</span>
                      <span aria-hidden="true">·</span>
                      <span>Full-Stack Platform Integration</span>
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

            {activeTab === 'search' && (
              <SearchView onSelectProfile={(userId) => setSelectedProfileUserId(userId)} />
            )}

            {activeTab === 'playlists' && (
              <PlaylistsView currentUser={currentUser} />
            )}

            {activeTab === 'reels' && (
              <MusicReelsView />
            )}

            {activeTab === 'inbox' && (
              <InboxView currentUser={currentUser} />
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
                </div>
              )
            )}
          </>
        )}
      </main>

      <MiniPlayer activeTab={activeTab} />

      <BottomNav 
        activeTab={activeTab === 'search' || activeTab === 'playlists' ? 'home' : activeTab as any} 
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
