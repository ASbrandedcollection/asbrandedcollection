import { useEffect, useState } from 'react';

export interface SocialMediaLink {
  platform: 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'pinterest';
  url: string;
  enabled: boolean;
}

interface StoreSettings {
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  store_name: string;
  free_delivery_threshold: string;
  delivery_days: string;
  tagline: string;
  social_media: SocialMediaLink[];
}

const defaultSettings: StoreSettings = {
  phone: '+923306897702',
  email: 'store@email.com',
  address: 'Karachi, Pakistan',
  whatsapp: '+923306897702',
  store_name: 'A&S Branded Collection',
  free_delivery_threshold: '3000',
  delivery_days: '7',
  tagline: '100% Original Products · Delivered Across Pakistan',
  social_media: [],
};

let cachedSettings: StoreSettings | null = null;

export function useSettings() {
  const [settings, setSettings] = useState<StoreSettings>(cachedSettings ?? defaultSettings);
  const [loading, setLoading] = useState(!cachedSettings);

  useEffect(() => {
    if (cachedSettings) return;
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const parsed = {
            ...defaultSettings,
            ...data.data,
            social_media:
              typeof data.data.social_media === 'string'
                ? JSON.parse(data.data.social_media)
                : (data.data.social_media ?? []),
          };
          cachedSettings = parsed;
          setSettings(parsed);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading };
}
