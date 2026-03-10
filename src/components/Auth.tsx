import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Mail, Lock, User, TreeDeciduous } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username,
            }
          }
        });
        if (signUpError) throw signUpError;
        
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              { id: data.user.id, username: username, name: username }
            ]);
          if (profileError && profileError.code !== '23505') throw profileError;
        }
        
        alert('Verifica o teu email para confirmar a conta!');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ango-black flex items-center justify-center p-4 baobab-pattern">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card rounded-[3rem] p-10 border-ango-gold/10 shadow-2xl shadow-ango-amber/5"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-ango-amber/10 text-ango-amber mb-6 relative">
            <TreeDeciduous size={40} />
            <div className="absolute inset-0 border-2 border-ango-gold/20 rounded-3xl animate-pulse-beat" />
          </div>
          <h1 className="font-display text-4xl text-ango-gold mb-2 tracking-widest uppercase">AngoChat</h1>
          <p className="text-ango-cream/40 text-xs font-bold uppercase tracking-[0.3em]">
            {isSignUp ? 'Cria a tua conta' : 'Bem-vindo de volta'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          {isSignUp && (
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-ango-amber/40 group-focus-within:text-ango-amber transition-colors" size={20} />
              <input
                type="text"
                placeholder="Nome de utilizador"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 text-ango-cream pl-14 pr-6 py-5 rounded-2xl border border-white/5 focus:border-ango-gold/30 outline-none transition-all text-sm"
                required
              />
            </div>
          )}
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-ango-amber/40 group-focus-within:text-ango-amber transition-colors" size={20} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 text-ango-cream pl-14 pr-6 py-5 rounded-2xl border border-white/5 focus:border-ango-gold/30 outline-none transition-all text-sm"
              required
            />
          </div>
          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-ango-amber/40 group-focus-within:text-ango-amber transition-colors" size={20} />
            <input
              type="password"
              placeholder="Palavra-passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 text-ango-cream pl-14 pr-6 py-5 rounded-2xl border border-white/5 focus:border-ango-gold/30 outline-none transition-all text-sm"
              required
            />
          </div>

          {error && (
            <p className="text-ango-terracotta text-xs font-bold text-center bg-ango-terracotta/10 p-3 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ango-amber text-ango-black font-black py-5 rounded-2xl uppercase tracking-[0.2em] hover:bg-ango-gold transition-all shadow-lg shadow-ango-amber/20 disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? 'Registar' : 'Entrar')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-ango-cream/40 text-xs font-bold uppercase tracking-widest hover:text-ango-gold transition-colors"
          >
            {isSignUp ? 'Já tens conta? Entrar' : "Não tens conta? Registar"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
