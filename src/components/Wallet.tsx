import React from 'react';
import { motion } from 'framer-motion';
import { Coins, ArrowUpRight, ArrowDownLeft, Send, History, TrendingUp, Users, Heart, Video } from 'lucide-react';

export default function Wallet({ balance }: { balance: number }) {
  const earningWays = [
    { icon: Video, label: 'Publicar Vídeos', reward: '+10', color: 'text-ango-amber' },
    { icon: Heart, label: 'Receber Likes', reward: '+1', color: 'text-ango-terracotta' },
    { icon: Users, label: 'Novos Seguidores', reward: '+5', color: 'text-ango-gold' },
    { icon: TrendingUp, label: 'Vídeo Viral', reward: '+50', color: 'text-ango-amber' },
  ];

  return (
    <div className="h-full bg-ango-black overflow-y-auto pb-24 baobab-pattern">
      <div className="p-6 pt-20">
        <h1 className="font-display text-3xl text-ango-gold mb-6 tracking-wider">Minha Carteira</h1>

        {/* Balance Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-card rounded-3xl p-8 mb-8 relative overflow-hidden border-ango-gold/20"
        >
          <div className="relative z-10">
            <p className="text-ango-cream/60 text-xs uppercase tracking-[0.2em] mb-2">Saldo Total</p>
            <div className="flex items-center gap-3 mb-8">
              <Coins className="w-10 h-10 text-ango-gold animate-pulse-beat" />
              <span className="text-5xl font-display text-ango-gold">{balance}</span>
              <span className="text-ango-cream/40 font-bold self-end mb-1">AngoCoins</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-2xl bg-ango-amber/10 flex items-center justify-center text-ango-amber group-hover:bg-ango-amber group-hover:text-ango-black transition-all">
                  <ArrowDownLeft size={24} />
                </div>
                <span className="text-[10px] font-bold uppercase text-ango-cream/60">Depositar</span>
              </button>
              <button className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-2xl bg-ango-terracotta/10 flex items-center justify-center text-ango-terracotta group-hover:bg-ango-terracotta group-hover:text-ango-black transition-all">
                  <ArrowUpRight size={24} />
                </div>
                <span className="text-[10px] font-bold uppercase text-ango-cream/60">Sacar</span>
              </button>
              <button className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-2xl bg-ango-gold/10 flex items-center justify-center text-ango-gold group-hover:bg-ango-gold group-hover:text-ango-black transition-all">
                  <Send size={24} />
                </div>
                <span className="text-[10px] font-bold uppercase text-ango-cream/60">Transferir</span>
              </button>
            </div>
          </div>

          {/* Decorative Pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-ango-gold/5 rounded-full -mr-16 -mt-16 blur-3xl" />
        </motion.div>

        {/* Earning Ways */}
        <div className="mb-8">
          <h2 className="text-ango-cream font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
            <History size={16} className="text-ango-amber" />
            Como Ganhar Moedas
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {earningWays.map((way, i) => (
              <motion.div 
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-4 rounded-2xl flex items-center justify-between border-white/5"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${way.color}`}>
                    <way.icon size={20} />
                  </div>
                  <span className="text-ango-cream font-medium text-sm">{way.label}</span>
                </div>
                <span className={`font-display ${way.color}`}>{way.reward}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
