'use client';

import React, { useState } from 'react';
import { X, Headphones, FileText, Upload, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

export function CreateModal({ isOpen, onClose, onPostCreated }: CreateModalProps) {
  const [selectedType, setSelectedType] = useState<'MUSIC' | 'TEXT' | null>(null);
  
  // Track / Post form states
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [content, setContent] = useState('');
  const [genre, setGenre] = useState('Ambient');
  
  // Files
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // States
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleResetAndClose = () => {
    setSelectedType(null);
    setTitle('');
    setArtist('');
    setContent('');
    setGenre('Ambient');
    setAudioFile(null);
    setImageFile(null);
    setUploading(false);
    setUploadProgress(0);
    setError(null);
    setSuccessMessage(null);
    onClose();
  };

  const handleUploadAndPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError(null);
    setUploadProgress(10);

    try {
      let fileUrl = '';
      let coverArtUrl = 'https://picsum.photos/seed/harmonics/400/400';

      // 1. Upload audio file if MUSIC post
      if (selectedType === 'MUSIC') {
        if (!audioFile) {
          throw new Error('Please select an audio file to upload.');
        }

        const audioFormData = new FormData();
        audioFormData.append('file', audioFile);
        audioFormData.append('type', 'audio');

        setUploadProgress(30);
        const audioRes = await fetch('/api/upload', {
          method: 'POST',
          body: audioFormData,
        });
        const audioData = await audioRes.json();
        if (!audioRes.ok) throw new Error(audioData.error || 'Audio upload failed.');
        fileUrl = audioData.fileUrl;
        setUploadProgress(60);
      }

      // 2. Upload cover image if selected
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('file', imageFile);
        imageFormData.append('type', 'image');

        const imageRes = await fetch('/api/upload', {
          method: 'POST',
          body: imageFormData,
        });
        const imageData = await imageRes.json();
        if (!imageRes.ok) throw new Error(imageData.error || 'Cover image upload failed.');
        coverArtUrl = imageData.fileUrl;
      }

      setUploadProgress(80);

      // 3. Create Track and Post record in database
      const endpoint = selectedType === 'MUSIC' ? '/api/tracks' : '/api/posts';
      const payload = selectedType === 'MUSIC' ? {
        title,
        description: content,
        fileUrl,
        coverArtUrl,
        genre,
        duration: 210, // 3:30 default
      } : {
        type: 'TEXT',
        content,
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save publication.');

      setUploadProgress(100);
      setSuccessMessage('Successfully published!');
      if (onPostCreated) onPostCreated();

      setTimeout(() => {
        handleResetAndClose();
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setError(err.message);
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-neutral-200 w-full max-w-lg p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">
        <button 
          onClick={handleResetAndClose}
          className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-950 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-neutral-950 tracking-tight">Create on Harmonics</h2>
          <p className="text-sm text-neutral-500 mt-1">Upload audio tracks with cover art or share text notes.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {!selectedType ? (
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => setSelectedType('MUSIC')}
              className="flex items-center gap-4 p-5 rounded-xl border border-neutral-200 hover:border-neutral-950 hover:bg-neutral-50 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-950 group-hover:bg-neutral-950 group-hover:text-white transition-colors">
                <Headphones className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-950">Music Track Upload</h3>
                <p className="text-xs text-neutral-500">Upload audio files (.mp3, .wav) and select cover art.</p>
              </div>
              <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-950 transition-colors" />
            </button>

            <button 
              onClick={() => setSelectedType('TEXT')}
              className="flex items-center gap-4 p-5 rounded-xl border border-neutral-200 hover:border-neutral-950 hover:bg-neutral-50 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-950 group-hover:bg-neutral-950 group-hover:text-white transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-950">Text Note</h3>
                <p className="text-xs text-neutral-500">Share announcements or updates with your followers.</p>
              </div>
              <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-950 transition-colors" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleUploadAndPublish} className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                {selectedType === 'MUSIC' ? 'Upload Music Track' : 'Create Text Note'}
              </span>
              <button 
                type="button"
                onClick={() => setSelectedType(null)} 
                className="text-xs text-neutral-700 hover:underline font-medium"
              >
                Change type
              </button>
            </div>

            {selectedType === 'MUSIC' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Track Title</label>
                  <input 
                    type="text" 
                    required
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Midnight Resonance..."
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-neutral-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Artist / Creator Name</label>
                  <input 
                    type="text" 
                    value={artist} 
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="Aura Collective..."
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-neutral-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Audio File (.mp3, .wav, max 50MB)</label>
                  <input 
                    type="file" 
                    accept="audio/*"
                    required
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-900 hover:file:bg-neutral-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Cover Image (Optional)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-900 hover:file:bg-neutral-200"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                {selectedType === 'MUSIC' ? 'Caption / Description' : 'Note Content'}
              </label>
              <textarea 
                rows={3}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={selectedType === 'MUSIC' ? 'Describe your track...' : 'What is on your mind?'}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-neutral-950 resize-none"
              />
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-600 font-medium">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-neutral-950" /> Uploading media...
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-neutral-950 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4">
              <button 
                type="button"
                disabled={uploading}
                onClick={() => setSelectedType(null)}
                className="px-4 py-2.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button 
                type="submit"
                disabled={uploading}
                className="px-5 py-2.5 text-xs font-medium text-white bg-neutral-950 hover:bg-neutral-800 rounded-xl transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {uploading ? 'Publishing...' : 'Publish Track'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
