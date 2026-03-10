import React, { useState, useRef } from 'react';
import { X, Upload, Loader2, Video, Music2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const generateThumbnail = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        video.currentTime = 1;
      };
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create thumbnail blob'));
        }, 'image/jpeg', 0.8);
      };
      video.onerror = () => reject(new Error('Error loading video'));
      video.src = URL.createObjectURL(file);
    });
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(10);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileId = crypto.randomUUID();
      const extension = file.name.split('.').pop() || 'mp4';
      const videoFileName = `${fileId}.${extension}`;
      const thumbFileName = `${fileId}.jpg`;

      // 1. Generate thumbnail
      const thumbBlob = await generateThumbnail(file);
      setProgress(30);

      // 2. Get upload URLs from our backend
      const videoUrlRes = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: videoFileName, contentType: file.type, prefix: 'posts' }),
      });
      
      if (!videoUrlRes.ok) throw new Error('Falha ao obter URL de upload');
      const { url: videoUploadUrl, key: videoKey } = await videoUrlRes.json();

      const thumbUrlRes = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: thumbFileName, contentType: 'image/jpeg', prefix: 'thumbnails' }),
      });
      const { url: thumbUploadUrl, key: thumbKey } = await thumbUrlRes.json();
      setProgress(50);

      // 3. Upload to R2
      await fetch(videoUploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      setProgress(70);
      await fetch(thumbUploadUrl, { method: 'PUT', body: thumbBlob, headers: { 'Content-Type': 'image/jpeg' } });
      setProgress(90);

      // 4. Create post in Supabase
      const publicUrl = import.meta.env.VITE_R2_PUBLIC_URL || "https://pub-787d908cd4db458da923c4d16758ba46.r2.dev";
      const mediaUrl = `${publicUrl}/${videoKey}`;
      const thumbnailUrl = `${publicUrl}/${thumbKey}`;

      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content,
          media_url: mediaUrl,
          thumbnail_url: thumbnailUrl,
          media_type: 'video',
        });

      if (postError) throw postError;

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ango-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md glass-card rounded-[2.5rem] overflow-hidden border-ango-gold/20 shadow-2xl shadow-ango-amber/10">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <h2 className="font-display text-xl text-ango-gold tracking-wider uppercase">Novo Vídeo</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-ango-cream/60">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 baobab-pattern">
          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[3/4] border-2 border-dashed border-ango-amber/30 rounded-[2rem] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-ango-amber/60 hover:bg-ango-amber/5 transition-all group"
            >
              <div className="w-20 h-20 rounded-3xl bg-ango-amber/10 flex items-center justify-center text-ango-amber group-hover:scale-110 transition-transform">
                <Upload size={40} />
              </div>
              <div className="text-center">
                <p className="text-ango-cream font-bold mb-1">Escolher Vídeo</p>
                <p className="text-ango-cream/40 text-xs uppercase tracking-widest">MP4 ou MOV (Max 50MB)</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
                accept="video/*" 
                className="hidden" 
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-24 aspect-[3/4] bg-zinc-900 rounded-2xl overflow-hidden relative border border-white/10">
                  <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setFile(null)}
                    className="absolute top-1 right-1 p-1 bg-ango-black/60 rounded-full text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
                <div className="flex-1">
                  <textarea
                    placeholder="Escreve uma legenda... #Angola #Kuduro"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-ango-cream placeholder:text-ango-cream/20 focus:border-ango-gold/30 outline-none transition-all h-32 resize-none text-sm"
                  />
                </div>
              </div>

              <div className="glass-card p-4 rounded-2xl flex items-center justify-between border-ango-gold/10">
                <div className="flex items-center gap-3">
                  <Music2 className="text-ango-amber" size={20} />
                  <span className="text-ango-cream text-xs font-bold uppercase tracking-widest">Música Angolana</span>
                </div>
                <button className="text-[10px] font-black text-ango-gold uppercase tracking-widest bg-ango-gold/10 px-3 py-1 rounded-full">
                  Escolher
                </button>
              </div>

              {error && (
                <p className="text-ango-terracotta text-xs font-bold text-center bg-ango-terracotta/10 p-3 rounded-xl">
                  {error}
                </p>
              )}

              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-ango-amber text-ango-black font-black py-5 rounded-2xl uppercase tracking-[0.2em] hover:bg-ango-gold transition-all shadow-lg shadow-ango-amber/20 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    <span>A Publicar ({progress}%)</span>
                  </>
                ) : (
                  <span>Publicar Vídeo</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
