import React from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Grid, Heart, Coins, Award, LogOut, Video } from 'lucide-react';
import { Profile as ProfileType, Post } from '../types';
import { supabase } from '../lib/supabase';

interface ProfileProps {
  user: any;
  profile: ProfileType | null;
  userPosts: Post[];
}

export default function Profile({ user, profile, userPosts }: ProfileProps) {
  const levels = {
    Bronze: { color: 'text-orange-400', bg: 'bg-orange-400/10' },
    Prata: { color: 'text-zinc-300', bg: 'bg-zinc-300/10' },
    Ouro: { color: 'text-ango-gold', bg: 'bg-ango-gold/10' },
    Platina: { color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  };

  const currentLevel = profile?.level || 'Bronze';

  return (
    <div className="h-full bg-ango-black overflow-y-auto pb-24 baobab-pattern">
      <div className="relative pt-20 px-6">
        {/* Header Actions */}
        <div className="absolute top-6 right-6 flex gap-4">
          <button className="text-ango-cream/60 hover:text-ango-gold transition-colors">
            <Settings size={24} />
          </button>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="text-ango-terracotta/60 hover:text-ango-terracotta transition-colors"
          >
            <LogOut size={24} />
          </button>
        </div>

        {/* Profile Info */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full border-4 border-ango-amber p-1">
              <div className="w-full h-full rounded-full bg-zinc-800 overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-full h-full p-6 text-zinc-500" />
                )}
              </div>
            </div>
            <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full border-2 border-ango-black font-black text-[10px] uppercase tracking-widest ${levels[currentLevel].bg} ${levels[currentLevel].color}`}>
              {currentLevel}
            </div>
          </div>

          <h2 className="font-display text-2xl text-ango-gold mb-1 tracking-wider">
            @{profile?.username || user.user_metadata?.username || 'Kizombeiro'}
          </h2>
          <p className="text-ango-cream/60 text-sm mb-6 max-w-[250px] text-center italic">
            {profile?.bio || "A dançar Semba desde que nasci. 🇦🇴"}
          </p>

          {/* Stats */}
          <div className="flex gap-8 mb-8">
            <div className="text-center">
              <p className="text-ango-cream font-black text-lg">1.2k</p>
              <p className="text-ango-cream/40 text-[10px] uppercase font-bold tracking-widest">Seguidores</p>
            </div>
            <div className="text-center">
              <p className="text-ango-cream font-black text-lg">850</p>
              <p className="text-ango-cream/40 text-[10px] uppercase font-bold tracking-widest">Seguindo</p>
            </div>
            <div className="text-center">
              <p className="text-ango-gold font-black text-lg">{profile?.angocoins || 0}</p>
              <p className="text-ango-gold/40 text-[10px] uppercase font-bold tracking-widest">AngoCoins</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full">
            <button className="flex-1 bg-ango-amber text-ango-black font-black py-3 rounded-2xl text-sm uppercase tracking-widest hover:bg-ango-gold transition-all">
              Editar Perfil
            </button>
            <button className="w-14 bg-white/5 text-ango-cream flex items-center justify-center rounded-2xl hover:bg-white/10 transition-all border border-white/5">
              <Award size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 mb-4">
          <button className="flex-1 py-4 flex items-center justify-center gap-2 border-b-2 border-ango-gold text-ango-gold">
            <Grid size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Vídeos</span>
          </button>
          <button className="flex-1 py-4 flex items-center justify-center gap-2 text-ango-cream/40">
            <Heart size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Gostos</span>
          </button>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-3 gap-1">
          {userPosts.length > 0 ? userPosts.map((post) => (
            <div key={post.id} className="aspect-[3/4] bg-zinc-900 relative group overflow-hidden">
              <img src={post.thumbnail_url || post.media_url} alt="" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-[10px] font-bold">
                <Coins size={10} className="text-ango-gold" />
                {post.angocoins_earned || 0}
              </div>
            </div>
          )) : (
            <div className="col-span-3 py-20 flex flex-col items-center text-ango-cream/20">
              <Video size={48} className="mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest">Nenhum vídeo ainda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
