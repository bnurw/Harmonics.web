'use client';

import React, { useState, useEffect } from 'react';
import { Play, Heart, MessageSquare, Repeat2, Share2, Music, FileText, Sparkles } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/States';
import { useAudio } from '@/components/audio/AudioPlayerContext';

interface Post {
  id: string;
  type: 'MUSIC' | 'TEXT';
  content: string;
  title?: string;
  songArtist?: string;
  coverArtUrl?: string;
  duration?: string;
  genre?: string;
  mediaUrl?: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
  _count: {
    likes: number;
    comments: number;
    reposts: number;
  };
}

interface HomeFeedProps {
  onSelectProfile: (userId: string) => void;
}

export function HomeFeed({ onSelectProfile }: HomeFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { playTrack } = useAudio();

  useEffect(() => {
    let isMounted = true;
    async function loadFeed() {
      try {
        setLoading(true);
        const res = await fetch('/api/posts?page=1&limit=10');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch feed.');
        if (isMounted) {
          setPosts(data.posts);
          if (data.posts.length < 10) setHasMore(false);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadFeed();
    return () => {
      isMounted = false;
    };
  }, []);

  const loadMore = async () => {
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/posts?page=${nextPage}&limit=10`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch more posts.');
      setPosts((prev) => [...prev, ...data.posts]);
      setPage(nextPage);
      if (data.posts.length < 10) setHasMore(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading && posts.length === 0) {
    return <LoadingState message="Loading your Harmonics feed..." />;
  }

  if (error && posts.length === 0) {
    return <ErrorState title="Feed unavailable" message={error} onRetry={() => window.location.reload()} />;
  }

  if (posts.length === 0) {
    return (
      <EmptyState 
        title="Your feed is quiet" 
        description="Follow creators or publish your first music or text post to see updates here." 
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {posts.map((post) => (
        <article key={post.id} className="p-6 rounded-2xl border border-neutral-200 bg-white hover:border-neutral-300 transition-all">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => onSelectProfile(post.author.id)}
              className="flex items-center gap-3 text-left group"
            >
              <Avatar src={post.author.image} name={post.author.name} size="md" />
              <div>
                <h4 className="font-semibold text-sm text-neutral-950 group-hover:underline">
                  {post.author.name || 'Harmonics User'}
                </h4>
                <p className="text-xs text-neutral-400">
                  @{post.author.username || post.author.id.substring(0, 8)} · {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </button>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700">
              {post.type === 'MUSIC' ? 'Music Post' : 'Text Post'}
            </span>
          </div>

          {post.type === 'MUSIC' ? (
            <div className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg bg-neutral-900 text-white overflow-hidden shrink-0 group">
                {post.coverArtUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.coverArtUrl} alt={post.title || 'Track'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-xl">
                    {(post.title || 'M')[0]}
                  </div>
                )}
                {post.mediaUrl && (
                  <button 
                    onClick={() => playTrack({
                      id: post.id,
                      title: post.title || 'Untitled Track',
                      artist: post.songArtist || post.author.name || 'Creator',
                      fileUrl: post.mediaUrl || '',
                      coverArtUrl: post.coverArtUrl,
                    })}
                    className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                  >
                    <div className="w-10 h-10 rounded-full bg-white text-neutral-950 flex items-center justify-center shadow-md">
                      <Play className="w-4 h-4 ml-0.5 fill-neutral-950" />
                    </div>
                  </button>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-neutral-500 mb-1">
                  <span>{post.genre || 'Original'}</span>
                  {post.duration && (
                    <>
                      <span>·</span>
                      <span>{post.duration}</span>
                    </>
                  )}
                </div>
                <h3 className="font-bold text-neutral-950 text-base">{post.title || 'Untitled Track'}</h3>
                <p className="text-xs text-neutral-600 mb-2">{post.songArtist || post.author.name}</p>
                <p className="text-xs text-neutral-500 line-clamp-2">{post.content}</p>
                {post.mediaUrl && (
                  <button 
                    onClick={() => playTrack({
                      id: post.id,
                      title: post.title || 'Untitled Track',
                      artist: post.songArtist || post.author.name || 'Creator',
                      fileUrl: post.mediaUrl || '',
                      coverArtUrl: post.coverArtUrl,
                    })}
                    className="mt-3 px-4 py-1.5 rounded-lg bg-neutral-950 text-white text-xs font-medium hover:bg-neutral-800 transition-colors inline-flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" /> Play Track
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-800 leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>
          )}

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <button className="flex items-center gap-1.5 hover:text-neutral-950 transition-colors">
              <Heart className="w-4 h-4" />
              <span>{post._count.likes}</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-neutral-950 transition-colors">
              <MessageSquare className="w-4 h-4" />
              <span>{post._count.comments}</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-neutral-950 transition-colors">
              <Repeat2 className="w-4 h-4" />
              <span>{post._count.reposts}</span>
            </button>
            <button 
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                alert('Post link copied to clipboard!');
              }}
              className="flex items-center gap-1.5 hover:text-neutral-950 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </article>
      ))}

      {hasMore && (
        <div className="text-center pt-4">
          <button 
            onClick={loadMore}
            className="px-6 py-2.5 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
          >
            Load More Posts
          </button>
        </div>
      )}
    </div>
  );
}
