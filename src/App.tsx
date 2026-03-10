import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { Post, Profile as ProfileType } from './types';
import Auth from './components/Auth';
import VideoCard from './components/VideoCard';
import Navbar from './components/Navbar';
import UploadModal from './components/UploadModal';
import SplashScreen from './components/SplashScreen';
import Wallet from './components/Wallet';
import Profile from './components/Profile';
import { Loader2, Video, Search, Compass, Wallet as WalletIcon, User } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState('home');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (!error) setProfile(data);
  };

  const fetchPosts = async () => {
    setLastError(null);
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      setLastError(error.message);
    } else {
      setPosts(data || []);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPosts();
      fetchProfile(user.id);
    }
  }, [user]);

  const handleScroll = () => {
    if (feedRef.current) {
      const index = Math.round(feedRef.current.scrollTop / feedRef.current.clientHeight);
      setActiveIndex(index);
    }
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ango-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-ango-amber animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'explore':
        return (
          <div className="h-full bg-ango-black p-6 pt-20 baobab-pattern">
            <h1 className="font-display text-3xl text-ango-gold mb-6 tracking-wider">Explorar</h1>
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ango-cream/40 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Pesquisar Kuduro, Semba..." 
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-ango-cream placeholder:text-ango-cream/20 focus:border-ango-gold/30 outline-none transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {['Kizomba', 'Semba', 'Kuduro', 'Afrohouse'].map((tag) => (
                <div key={tag} className="glass-card p-6 rounded-3xl border-ango-gold/10 flex flex-col items-center justify-center gap-2 group hover:border-ango-gold/30 transition-all cursor-pointer">
                  <Compass className="w-8 h-8 text-ango-amber group-hover:scale-110 transition-transform" />
                  <span className="text-ango-cream font-bold uppercase tracking-widest text-[10px]">{tag}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'wallet':
        return <Wallet balance={profile?.angocoins || 0} />;
      case 'profile':
        return <Profile user={user} profile={profile} userPosts={posts.filter(p => p.user_id === user.id)} />;
      default:
        return (
          <div 
            ref={feedRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto snap-y-mandatory scrollbar-hide"
          >
            {posts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-ango-cream/20 p-8 text-center baobab-pattern">
                <Video className="w-16 h-16 mb-4 opacity-20" />
                <h3 className="text-xl font-display text-ango-gold mb-2 tracking-wider">Sem vídeos ainda</h3>
                <p className="text-sm mb-6 max-w-[200px]">Sê o primeiro a partilhar o teu talento com Angola!</p>
                <button 
                  onClick={() => setIsUploadOpen(true)}
                  className="bg-ango-amber text-ango-black px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-ango-gold transition-all shadow-lg shadow-ango-amber/20"
                >
                  Publicar Agora
                </button>
              </div>
            ) : (
              posts.map((post, index) => (
                <div key={post.id} className="h-full w-full snap-start">
                  <VideoCard 
                    post={post} 
                    isActive={activeIndex === index && activeTab === 'home'} 
                  />
                </div>
              ))
            )}
          </div>
        );
    }
  };

  return (
    <div className="h-full bg-ango-black flex flex-col max-w-md mx-auto relative overflow-hidden shadow-2xl shadow-ango-amber/10">
      {/* Top Header */}
      {activeTab === 'home' && (
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-center gap-8 z-50 bg-gradient-to-b from-ango-black/60 to-transparent">
          <button className="text-ango-cream/40 font-black text-xs uppercase tracking-widest hover:text-ango-cream transition-colors">Seguindo</button>
          <button className="text-ango-gold font-black text-lg uppercase tracking-widest border-b-4 border-ango-gold pb-1">Para Ti</button>
        </div>
      )}

      {/* Main Content */}
      {renderContent()}

      {/* Bottom Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onUploadClick={() => setIsUploadOpen(true)} 
      />

      {/* Upload Modal */}
      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onSuccess={() => {
          fetchPosts();
          fetchProfile(user.id);
        }} 
      />
    </div>
  );
}
