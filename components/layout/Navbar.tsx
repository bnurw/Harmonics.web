'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuthModal } from '@/components/auth/AuthModal';
import { User, LogOut, Shield } from 'lucide-react';

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
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
          {/* Zone 1: Single text element wordmark */}
          <Link href="/" className="text-lg font-bold tracking-tight text-neutral-950 whitespace-nowrap shrink-0">
            Harmonics
          </Link>

          {/* Zone 2: 4-5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
            <Link href="#architecture" className="hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0">
              Architecture
            </Link>
            <Link href="#features" className="hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0">
              Features
            </Link>
            <Link href="#roadmap" className="hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0">
              Roadmap
            </Link>
            {user?.role && (user.role === 'OWNER' || user.role === 'ADMIN') && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 bg-neutral-100 px-2 py-1 rounded-md">
                <Shield className="w-3 h-3" /> {user.role}
              </span>
            )}
          </nav>

          {/* Zone 3: 1 primary action / User Auth */}
          <div className="flex items-center gap-3 shrink-0">
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
    </>
  );
}
