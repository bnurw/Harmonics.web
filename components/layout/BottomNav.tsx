import React from 'react';
import { Home, PlaySquare, Plus, MessageSquare, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'reels' | 'inbox' | 'profile';
  onTabChange: (tab: 'home' | 'reels' | 'inbox' | 'profile') => void;
  onOpenCreate: () => void;
}

export function BottomNav({ activeTab, onTabChange, onOpenCreate }: BottomNavProps) {
  return (
    <nav aria-label="Bottom Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-45 bg-white border-t border-neutral-200 h-16 flex items-center justify-around px-2 shadow-sm">
      <button 
        onClick={() => onTabChange('home')}
        aria-label="Home"
        className={`p-3 rounded-xl transition-colors ${activeTab === 'home' ? 'text-neutral-950 bg-neutral-100 font-bold' : 'text-neutral-400 hover:text-neutral-700'}`}
      >
        <Home className="w-6 h-6" />
      </button>

      <button 
        onClick={() => onTabChange('reels')}
        aria-label="Music Reels"
        className={`p-3 rounded-xl transition-colors ${activeTab === 'reels' ? 'text-neutral-950 bg-neutral-100 font-bold' : 'text-neutral-400 hover:text-neutral-700'}`}
      >
        <PlaySquare className="w-6 h-6" />
      </button>

      <button 
        onClick={onOpenCreate}
        aria-label="Create"
        className="w-12 h-12 rounded-full bg-neutral-950 text-white flex items-center justify-center shadow-md hover:bg-neutral-800 transition-transform active:scale-95"
      >
        <Plus className="w-6 h-6" />
      </button>

      <button 
        onClick={() => onTabChange('inbox')}
        aria-label="Inbox"
        className={`p-3 rounded-xl transition-colors ${activeTab === 'inbox' ? 'text-neutral-950 bg-neutral-100 font-bold' : 'text-neutral-400 hover:text-neutral-700'}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      <button 
        onClick={() => onTabChange('profile')}
        aria-label="Profile"
        className={`p-3 rounded-xl transition-colors ${activeTab === 'profile' ? 'text-neutral-950 bg-neutral-100 font-bold' : 'text-neutral-400 hover:text-neutral-700'}`}
      >
        <User className="w-6 h-6" />
      </button>
    </nav>
  );
}
