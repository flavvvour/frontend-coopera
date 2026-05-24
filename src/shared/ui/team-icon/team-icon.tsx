import {
  BookOpen, GraduationCap, Code2, Briefcase, Palette,
  Globe, Heart, Users, Layers, Rocket, Trophy,
  Building2, Leaf, Wrench, Camera, Music, Star, Zap, FlaskConical,
} from 'lucide-react';

// eslint-disable-next-line react-refresh/only-export-components
export const TEAM_ICON_MAP: Record<string, React.FC<{ size?: number; color?: string }>> = {
  BookOpen, GraduationCap, Code2, Briefcase, Palette,
  Globe, Heart, Users, Layers, Rocket, Trophy,
  Building2, Leaf, Wrench, Camera, Music, Star, Zap, FlaskConical,
};

// eslint-disable-next-line react-refresh/only-export-components
export const TEAM_ICON_NAMES = Object.keys(TEAM_ICON_MAP);

export function TeamIcon({ name, size = 18, color }: { name: string; size?: number; color?: string }) {
  const Icon = TEAM_ICON_MAP[name];
  if (Icon) return <Icon size={size} color={color} />;
  return <span style={{ fontSize: size * 0.8, lineHeight: 1 }}>{name}</span>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const TEAM_COLORS = ['#d4ede6','#fde8d8','#e8ddf7','#ddeedd','#fef0d4','#f5dde5','#d8eef5'];
