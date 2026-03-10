import React, { useState, useEffect, useRef } from 'react';
import { Post } from '../types';
import { Heart, MessageCircle, Share2, Music2, User, Video, Coins, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VideoCardProps {
  post: Post;
  isActive: boolean;
}

export default function VideoCard({ post, isActive }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [liked, setLiked] = useState(post.user_has_reacted || false);
  const [likesCount, setLikesCount] = useState(post.reactions?.[0]?.count || 0);
  const [showLikeAnim, setShowLikeAnim] = useState(false);
  const [coins, setCoins] = useState(post.angocoins_earned || 0);
  const [floatingCoins, setFloatingCoins] = useState<{ id: number; x: number; y: number }[]>([]);

  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch((err) => {
          console.error('Video play error:', err);
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().catch(e => console.error('Muted play also failed:', e));
          }
        });
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isActive]);

  const handleLike = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (liked) {
      setLiked(false);
      setLikesCount(prev => prev - 1);
      await supabase
        .from('reactions')
        .delete()
        .match({ post_id: post.id, user_id: user.id });
    } else {
      setLiked(true);
      setLikesCount(prev => prev + 1);
      setShowLikeAnim(true);
      setTimeout(() => setShowLikeAnim(false), 1000);
      await supabase
        .from('reactions')
        .insert({ post_id: post.id, user_id: user.id });
    }
  };

  const handleGiveCoin = () => {
    const id = Date.now();
    setFloatingCoins(prev => [...prev, { id, x: Math.random() * 100 - 50, y: 0 }]);
    setCoins(prev => prev + 1);
    setTimeout(() => {
      setFloatingCoins(prev => prev.filter(c => c.id !== id));
    }, 2000);
  };

  return (
    <div className="relative h-full w-full bg-ango-black snap-start overflow-hidden">
      <video
        ref={videoRef}
        src={post.media_url}
        className="h-full w-full object-cover"
        loop
        playsInline
        muted={!isActive}
        onError={() => setVideoError(true)}
        onClick={() => {
          if (videoRef.current?.paused) videoRef.current.play();
          else videoRef.current?.pause();
        }}
      />

      {videoError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-ango-black text-ango-cream/40 p-8 text-center">
          <Video className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-sm">Erro ao carregar vídeo</p>
        </div>
      )}

      {/* AngoCoins Counter Top Right */}
      <div className="absolute top-6 right-4 z-30">
        <div className="glass-card px-3 py-1.5 rounded-full flex items-center gap-2 border-ango-gold/30">
          <Coins className="w-4 h-4 text-ango-gold animate-pulse-beat" />
          <span className="text-ango-gold font-bold text-sm">{coins}</span>
        </div>
      </div>

      {/* Like Animation Overlay */}
      <AnimatePresence>
        {showLikeAnim && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          >
            <Heart className="w-32 h-32 text-ango-terracotta fill-ango-terracotta drop-shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Coins */}
      <AnimatePresence>
        {floatingCoins.map(coin => (
          <motion.div
            key={coin.id}
            initial={{ y: 0, x: coin.x, opacity: 1, scale: 1 }}
            animate={{ y: -400, x: coin.x + (Math.random() * 40 - 20), opacity: 0, scale: 1.5 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute bottom-20 right-6 z-40 pointer-events-none"
          >
            <Coins className="w-8 h-8 text-ango-gold fill-ango-gold/20" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Sidebar Actions */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-30">
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full border-2 border-ango-gold overflow-hidden mb-2 relative">
            {post.profiles?.avatar_url ? (
              <img src={post.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-ango-black">
                <User className="w-6 h-6 text-ango-cream/40" />
              </div>
            )}
            <button className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-ango-amber text-ango-black rounded-full p-0.5">
              <Plus size={12} strokeWidth={4} />
            </button>
          </div>
        </div>

        <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all glass-card",
            liked ? "text-ango-terracotta" : "text-ango-cream"
          )}>
            <Heart className={cn("w-6 h-6", liked && "fill-current")} />
          </div>
          <span className="text-xs font-bold text-ango-cream">{likesCount}</span>
        </button>

        <button className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 rounded-full flex items-center justify-center glass-card text-ango-cream">
            <MessageCircle className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-ango-cream">{post.comments?.[0]?.count || 0}</span>
        </button>

        <button className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 rounded-full flex items-center justify-center glass-card text-ango-cream">
            <Share2 className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-ango-cream">Partilhar</span>
        </button>

        {/* DAR MOEDA Button */}
        <button 
          onClick={handleGiveCoin}
          className="flex flex-col items-center gap-1 group"
        >
          <motion.div 
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-ango-gold to-ango-amber text-ango-black shadow-lg shadow-ango-gold/20"
          >
            <Coins className="w-8 h-8 animate-pulse-beat" />
          </motion.div>
          <span className="text-[10px] font-black text-ango-gold uppercase tracking-tighter">Dar Moeda</span>
        </button>
      </div>

      {/* Overlay Info */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-28 bg-gradient-to-t from-ango-black to-transparent pointer-events-none">
        <div className="flex flex-col gap-3 pointer-events-auto max-w-[80%]">
          <div className="flex items-center gap-2">
            <span className="font-display text-ango-gold text-xl tracking-wider">@{post.profiles?.username}</span>
            <span className="bg-ango-terracotta text-ango-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">AO VIVO</span>
          </div>
          <p className="text-ango-cream text-sm line-clamp-2 font-medium leading-relaxed">{post.content}</p>
          <div className="flex items-center gap-3 text-ango-amber text-xs font-bold">
            <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-full backdrop-blur-sm">
              <Music2 className="w-3 h-3 animate-pulse-beat" />
              <span className="truncate">Som original - {post.profiles?.name || post.profiles?.username}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
