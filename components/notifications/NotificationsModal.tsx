'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X, Heart, MessageSquare, UserPlus, Repeat2 } from 'lucide-react';
import { LoadingState, EmptyState } from '@/components/ui/States';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications || []);
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
      if (isOpen && isMounted) {
        await fetchNotifications();
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [isOpen, fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl border border-neutral-200 w-full max-w-lg p-6 relative shadow-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-neutral-950" />
            <h2 className="text-xl font-bold text-neutral-950">Notifications</h2>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleMarkAllRead}
              className="text-xs text-neutral-600 hover:underline font-medium"
            >
              Mark all read
            </button>
            <button onClick={onClose} className="text-neutral-400 hover:text-neutral-950">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 py-2">
          {loading ? (
            <LoadingState message="Loading notifications..." />
          ) : notifications.length > 0 ? (
            notifications.map((n: any) => (
              <div key={n.id} className={`p-4 flex items-start gap-3 rounded-xl transition-colors ${!n.read ? 'bg-neutral-50/80 font-medium' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                  {n.type === 'LIKE' && <Heart className="w-4 h-4 text-red-500" />}
                  {n.type === 'COMMENT' && <MessageSquare className="w-4 h-4 text-blue-500" />}
                  {n.type === 'FOLLOW' && <UserPlus className="w-4 h-4 text-emerald-500" />}
                  {n.type === 'REPOST' && <Repeat2 className="w-4 h-4 text-purple-500" />}
                  {n.type === 'MESSAGE' && <MessageSquare className="w-4 h-4 text-amber-500" />}
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-semibold text-neutral-950">{n.title}</h4>
                  <p className="text-xs text-neutral-600 mt-0.5">{n.message}</p>
                  <span className="text-[10px] text-neutral-400 mt-1 block">
                    {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-neutral-950 self-center" />
                )}
              </div>
            ))
          ) : (
            <EmptyState title="No notifications yet" description="Activity on your posts, tracks, and follows will appear here." />
          )}
        </div>
      </div>
    </div>
  );
}
