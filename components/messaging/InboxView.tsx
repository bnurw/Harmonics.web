'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send, ArrowLeft, Trash2 } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingState, EmptyState } from '@/components/ui/States';

interface InboxViewProps {
  currentUser: any;
}

export function InboxView({ currentUser }: InboxViewProps) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/conversations');
      const data = await res.json();
      if (res.ok) {
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (convId: string) => {
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`);
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (currentUser && isMounted) {
        await fetchConversations();
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [currentUser, fetchConversations]);

  useEffect(() => {
    let isMounted = true;
    async function loadMsg() {
      if (activeConv && isMounted) {
        await fetchMessages(activeConv.id);
      }
    }
    loadMsg();
    if (activeConv) {
      const interval = setInterval(() => fetchMessages(activeConv.id), 5000);
      return () => clearInterval(interval);
    }
  }, [activeConv, fetchMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;
    try {
      const res = await fetch(`/api/conversations/${activeConv.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      });
      if (res.ok) {
        setNewMessage('');
        fetchMessages(activeConv.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center py-20">
        <h3 className="font-bold text-lg text-neutral-950 mb-2">Sign in required</h3>
        <p className="text-xs text-neutral-500 mb-6">Please sign in to access your secure inbox.</p>
      </div>
    );
  }

  if (loading) return <LoadingState message="Loading your inbox..." />;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm h-[600px] flex">
      <div className={`w-full md:w-1/3 border-r border-neutral-200 flex flex-col ${activeConv ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-950">Inbox</h2>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
          {conversations.length > 0 ? (
            conversations.map((conv: any) => {
              const otherParticipant = conv.participants?.find((p: any) => p.userId !== currentUser.id)?.user;
              const lastMsg = conv.messages?.[0];

              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`w-full p-4 flex items-center gap-3 text-left hover:bg-neutral-50 transition-colors ${activeConv?.id === conv.id ? 'bg-neutral-100' : ''}`}
                >
                  <Avatar src={otherParticipant?.image} name={otherParticipant?.name} size="md" />
                  <div className="flex-1 truncate">
                    <h4 className="font-semibold text-sm text-neutral-950">{otherParticipant?.name || 'User'}</h4>
                    <p className="text-xs text-neutral-500 truncate">{lastMsg?.content || 'No messages yet'}</p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-neutral-400 text-xs">
              No conversations yet. Start a chat from any user profile.
            </div>
          )}
        </div>
      </div>

      <div className={`flex-1 flex flex-col bg-neutral-50/50 ${!activeConv ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        {activeConv ? (
          <>
            <div className="p-4 bg-white border-b border-neutral-200 flex items-center gap-3">
              <button 
                onClick={() => setActiveConv(null)}
                className="md:hidden text-neutral-500 hover:text-neutral-950"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h3 className="font-semibold text-sm text-neutral-950">
                {activeConv.participants?.find((p: any) => p.userId !== currentUser.id)?.user?.name || 'Chat'}
              </h3>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.map((msg: any) => {
                const isOwn = msg.senderId === currentUser.id;
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs sm:max-w-md px-4 py-3 rounded-2xl text-xs ${isOwn ? 'bg-neutral-950 text-white rounded-br-none' : 'bg-white text-neutral-900 border border-neutral-200 rounded-bl-none shadow-sm'}`}>
                      <p>{msg.content}</p>
                      <span className={`text-[9px] mt-1 block text-right ${isOwn ? 'text-neutral-400' : 'text-neutral-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-neutral-200 flex items-center gap-3">
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-neutral-950"
              />
              <button 
                type="submit"
                className="px-4 py-2.5 bg-neutral-950 text-white rounded-xl text-xs font-medium hover:bg-neutral-800"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="text-center text-neutral-400 p-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
