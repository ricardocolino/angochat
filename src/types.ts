export interface Profile {
  id: string;
  username: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  angocoins: number;
  level: 'Bronze' | 'Prata' | 'Ouro' | 'Platina';
}

export interface Post {
  id: string;
  user_id: string;
  content: string | null;
  media_url: string;
  thumbnail_url: string | null;
  media_type: 'image' | 'video';
  views: number;
  created_at: string;
  profiles?: Profile;
  reactions?: { count: number }[];
  comments?: { count: number }[];
  user_has_reacted?: boolean;
  angocoins_earned?: number;
}

export interface Comment {
  id: number;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Profile;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}
