'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/States';
import { Edit3, MapPin, Link as LinkIcon, UserPlus, UserCheck, Music, FileText, Bookmark, Repeat2, Tag } from 'lucide-react';

interface ProfileViewProps {
  userId: string;
  currentUserId?: string;
  onBackToFeed: () => void;
}

export function ProfileView({ userId, currentUserId, onBackToFeed }: ProfileViewProps) {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tracks' | 'notes' | 'saved' | 'reposts' | 'tagged'>('tracks');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editImage, setEditImage] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${userId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch profile.');
      setProfileData(data.user);
      setEditName(data.user.name || '');
      setEditUsername(data.user.username || '');
      setEditBio(data.user.profile?.bio || '');
      setEditLocation(data.user.profile?.location || '');
      setEditWebsite(data.user.profile?.website || '');
      setEditImage(data.user.image || '');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (userId) {
        await fetchProfile();
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [userId, fetchProfile]);

  const handleFollowToggle = async () => {
    try {
      const res = await fetch(`/api/users/${userId}/follow`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update follow status.');
      
      setProfileData((prev: any) => ({
        ...prev,
        isFollowing: data.isFollowing,
        counts: {
          ...prev.counts,
          followers: prev.counts.followers + (data.isFollowing ? 1 : -1),
        },
      }));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          username: editUsername,
          bio: editBio,
          location: editLocation,
          website: editWebsite,
          image: editImage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile.');
      
      setProfileData((prev: any) => ({
        ...prev,
        name: data.user.name,
        username: data.user.username,
        image: data.user.image,
        profile: data.user.profile,
      }));
      setIsEditing(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingState message="Loading profile..." />;
  if (error) return <ErrorState title="Profile unavailable" message={error} onRetry={fetchProfile} />;
  if (!profileData) return <EmptyState title="User not found" />;

  const { counts, isFollowing, isOwnProfile } = profileData;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <button 
          onClick={onBackToFeed}
          className="text-xs font-medium text-neutral-500 hover:text-neutral-950 transition-colors"
        >
          ← Back to Feed
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Avatar src={profileData.image} name={profileData.name} size="lg" className="w-20 h-20 text-xl" />
            <div>
              <h1 className="text-2xl font-bold text-neutral-950">{profileData.name || 'Harmonics Creator'}</h1>
              <p className="text-sm text-neutral-400 font-mono mt-0.5">@{profileData.username || profileData.id.substring(0, 10)}</p>
              
              <div className="flex items-center gap-6 mt-4 text-xs text-neutral-600">
                <span><strong>{counts.posts || profileData.notes?.length || 0}</strong> Posts</span>
                <span><strong>{counts.audioTracks || profileData.tracks?.length || 0}</strong> Tracks</span>
                <span><strong>{counts.followers}</strong> Followers</span>
                <span><strong>{counts.following}</strong> Following</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isOwnProfile ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-900 hover:bg-neutral-50 transition-colors inline-flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <button 
                onClick={handleFollowToggle}
                className={`px-6 py-2.5 rounded-xl text-xs font-medium transition-colors inline-flex items-center gap-2 ${isFollowing ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200' : 'bg-neutral-950 text-white hover:bg-neutral-800'}`}
              >
                {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-neutral-100 space-y-3">
          {profileData.profile?.bio && (
            <p className="text-sm text-neutral-800 leading-relaxed">{profileData.profile.bio}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
            {profileData.profile?.location && (
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {profileData.profile.location}</span>
            )}
            {profileData.profile?.website && (
              <a href={profileData.profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-neutral-900 hover:underline">
                <LinkIcon className="w-3.5 h-3.5" /> {profileData.profile.website}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-neutral-200 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('tracks')}
          className={`px-5 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap inline-flex items-center gap-2 ${activeTab === 'tracks' ? 'border-neutral-950 text-neutral-950' : 'border-transparent text-neutral-400 hover:text-neutral-700'}`}
        >
          <Music className="w-4 h-4" /> Tracks ({profileData.tracks?.length || 0})
        </button>
        <button 
          onClick={() => setActiveTab('notes')}
          className={`px-5 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap inline-flex items-center gap-2 ${activeTab === 'notes' ? 'border-neutral-950 text-neutral-950' : 'border-transparent text-neutral-400 hover:text-neutral-700'}`}
        >
          <FileText className="w-4 h-4" /> Notes ({profileData.notes?.length || 0})
        </button>
        <button 
          onClick={() => setActiveTab('saved')}
          className={`px-5 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap inline-flex items-center gap-2 ${activeTab === 'saved' ? 'border-neutral-950 text-neutral-950' : 'border-transparent text-neutral-400 hover:text-neutral-700'}`}
        >
          <Bookmark className="w-4 h-4" /> Saved ({profileData.saved?.length || 0})
        </button>
        <button 
          onClick={() => setActiveTab('reposts')}
          className={`px-5 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap inline-flex items-center gap-2 ${activeTab === 'reposts' ? 'border-neutral-950 text-neutral-950' : 'border-transparent text-neutral-400 hover:text-neutral-700'}`}
        >
          <Repeat2 className="w-4 h-4" /> Reposts ({profileData.reposts?.length || 0})
        </button>
        <button 
          onClick={() => setActiveTab('tagged')}
          className={`px-5 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap inline-flex items-center gap-2 ${activeTab === 'tagged' ? 'border-neutral-950 text-neutral-950' : 'border-transparent text-neutral-400 hover:text-neutral-700'}`}
        >
          <Tag className="w-4 h-4" /> Tagged (0)
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === 'tracks' && (
          profileData.tracks?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profileData.tracks.map((track: any) => (
                <div key={track.id} className="p-4 rounded-2xl border border-neutral-200 bg-white flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-neutral-950 text-sm">{track.title}</h4>
                    <p className="text-xs text-neutral-500">{track.genre || 'Original'} · {track.plays} plays</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No tracks uploaded yet" description="Published audio tracks will appear here." />
          )
        )}

        {activeTab === 'notes' && (
          profileData.notes?.length > 0 ? (
            <div className="space-y-4">
              {profileData.notes.map((note: any) => (
                <div key={note.id} className="p-6 rounded-2xl border border-neutral-200 bg-white">
                  <p className="text-sm text-neutral-900">{note.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No posts yet" description="Published notes and music posts will appear here." />
          )
        )}

        {activeTab === 'saved' && (
          profileData.saved?.length > 0 ? (
            <div className="space-y-4">
              {profileData.saved.map((item: any) => (
                <div key={item.id} className="p-4 rounded-2xl border border-neutral-200 bg-white">
                  <p className="text-sm text-neutral-900">{item.post?.content || item.track?.title || 'Saved item'}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No saved items" description="Items you bookmark will appear here." />
          )
        )}

        {activeTab === 'reposts' && (
          profileData.reposts?.length > 0 ? (
            <div className="space-y-4">
              {profileData.reposts.map((repo: any) => (
                <div key={repo.id} className="p-4 rounded-2xl border border-neutral-200 bg-white">
                  <p className="text-sm text-neutral-900">{repo.post?.content || repo.track?.title || 'Reposted item'}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No reposts yet" description="Reposted tracks and posts will appear here." />
          )
        )}

        {activeTab === 'tagged' && (
          <EmptyState title="No tagged posts" description="Posts where you are tagged will appear here." />
        )}
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-neutral-200 w-full max-w-md p-8 relative shadow-2xl">
            <h2 className="text-xl font-bold text-neutral-950 mb-4">Edit Profile</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Username (@)</label>
                <input 
                  type="text" 
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Avatar Image URL</label>
                <input 
                  type="text" 
                  value={editImage}
                  onChange={(e) => setEditImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Bio</label>
                <textarea 
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-neutral-950 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Location</label>
                <input 
                  type="text" 
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Website</label>
                <input 
                  type="text" 
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-neutral-950 hover:bg-neutral-800 rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
