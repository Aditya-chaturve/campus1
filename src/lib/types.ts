export interface AppConfig {
  id: number;
  name: string;
  eyebrow: string | null;
  headline: string | null;
  description: string | null;
  philosophy_heading: string | null;
  philosophy_body: string | null;
  icon_url: string | null;
  developer_name: string | null;
  contact_email: string | null;
  website_url: string | null;
  github_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  is_placeholder: boolean | null;
}

export interface Release {
  id: number;
  version: string | null;
  apk_url: string | null;
  apk_size_bytes: number | null;
  released_at: string | null;
  min_android: string | null;
  architectures: string | null;
  notes: string | null;
  ios_url: string | null;
  play_url: string | null;
  is_current: boolean | null;
}

export type FeatureLayout = 'right' | 'left' | 'zoom' | 'center';

export interface Feature {
  id: number;
  position: number;
  kicker: string | null;
  title: string;
  description: string | null;
  layout: string | null;
  screen_key: string | null;
  is_placeholder: boolean | null;
}

export type ScreenKind = 'home' | 'feed' | 'detail' | 'profile' | 'grid';

export interface Screen {
  id: number;
  position: number;
  key: string;
  label: string;
  caption: string | null;
  image_url: string | null;
  kind: string | null;
  is_placeholder: boolean | null;
}

export interface InstallStep {
  id: number;
  position: number;
  title: string;
  body: string | null;
}

export interface Faq {
  id: number;
  position: number;
  question: string;
  answer: string;
}

export interface SiteData {
  config: AppConfig;
  release: Release | null;
  features: Feature[];
  screens: Screen[];
  steps: InstallStep[];
  faqs: Faq[];
}

export interface VerifyResult {
  available: boolean;
  kind: 'file' | 'page' | null;
  status: number | null;
  size: number | null;
  contentType: string | null;
  reason: string | null;
}

export type Platform = 'android' | 'ios';
