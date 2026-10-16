'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuthModal } from '@/components/auth/AuthModal';
import { NotificationsModal } from '@/components/notifications/NotificationsModal';
import { User, LogOut, Shield, Bell, Search, ListMusic } from 'lucide-react';

interface NavbarProps {
  onNavigate?: (tab: string) => void;
}

export function Navbar({ onNavigate }: NavbarProps) {
  const [user, setUser] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});

    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (data.notifications) {
          const unread = data.notifications.filter((n: any) => !n.read).length;
          setUnreadCount(unread);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.reload();
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 h-16">
          <Link href="/" className="text-lg font-bold tracking-tight text-neutral-950 whitespace-nowrap shrink-0">
            Harmonics
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
            <button onClick={() => onNavigate?.('home')} className="hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0">
              Feed
            </button>
            <button onClick={() => onNavigate?.('search')} className="hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5">
              <Search className="w-4 h-4" /> Search
            </button>
            <button onClick={() => onNavigate?.('playlists')} className="hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5">
              <ListMusic className="w-4 h-4" /> Playlists
            </button>
            <button onClick={() => onNavigate?.('reels')} className="hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0">
              Music Reels
            </button>
            {user?.role && (user.role === 'OWNER' || user.role === 'ADMIN' || user.role === 'MODERATOR') && (
              <button onClick={() => onNavigate?.('admin')} className="hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded-lg">
                <Shield className="w-3.5 h-3.5" /> Dashboard
              </button>
            )}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {user && (
              <button 
                onClick={() => setIsNotifOpen(true)}
                className="relative p-2.5 rounded-xl text-neutral-700 hover:bg-neutral-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-neutral-950" />
                )}
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-neutral-800 hidden sm:inline">
                  {user.name || user.email}
                </span>
                <button 
                  onClick={handleLogout}
                  className="px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }}
                  className="px-3 py-2 text-xs font-medium text-neutral-700 hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setAuthMode('signup'); setIsAuthOpen(true); }}
                  className="px-4 py-2 text-xs font-medium text-white bg-neutral-950 rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        onSuccess={(newUser) => {
          setUser(newUser);
          window.location.reload();
        }}
      />

      <NotificationsModal 
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />
    </>
  );
}
