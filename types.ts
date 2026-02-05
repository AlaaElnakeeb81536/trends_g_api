
export type AppMode = 'global' | 'ngo';
export type Region = 'arab' | 'international';

export interface TrendItem {
  title: string;
  category: 'music' | 'content' | 'hashtag';
  platform: string[];
  engagement: string;
  momentum: number; // 0-100
  description: string;
  url: string; // Direct link or search link for the trend
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface TrendData {
  items: TrendItem[];
  sources: GroundingSource[];
  analysis: string;
}

export interface PlatformStat {
  name: string;
  volume: number;
}
