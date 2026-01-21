export type FilterType = 'language' | 'job' | 'level' | 'price' | 'algorithm';

export interface SlideData {
  id: number;
  title: string;
  highlight: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  features: string[];
  type: 'editor' | 'insight';
}
