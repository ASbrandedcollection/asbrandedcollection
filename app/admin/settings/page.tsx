'use client';

import { useEffect, useState } from 'react';
import type { SocialPlatform } from '@/components/SocialIcons';

interface SocialLink {
  platform: SocialPlatform;
  url: string;
  enabled: boolean;
}

interface Settings {
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  store_name: string;
  free_delivery_threshold: string;
  delivery_days: string;
  tagline: string;
}

const STORE_FIELDS: { key: keyof Settings; label: string; placeholder: string; hint?: string }[] = [
  { key: 'store_name', label: 'Store Name', placeholder: 'A&S Branded Collection' },
  { key: 'tagline', label: 'Tagline (Top Bar)', placeholder: '100% Original Products · Delivered Across Pakistan' },
  { key: 'phone', label: 'Phone Number', placeholder: '0300-0000000' },
  {
    key: 'whatsapp',
    label: 'WhatsApp Number',
    placeholder: '923001234567',
    hint: 'Country code without + e.g. 923001234567',
  },
  { key: 'email', label: 'Email Address', placeholder: 'store@email.com' },
  { key: 'address', label: 'Address', placeholder: 'Karachi, Pakistan' },
  { key: 'free_delivery_threshold', label: 'Free Delivery Above (PKR)', placeholder: '3000' },
  { key: 'delivery_days', label: 'Delivery Timeframe', placeholder: '3-5', hint: 'e.g. 3-5 (shown as "3-5 working days")' },
];

const PLATFORM_OPTIONS: { value: SocialPlatform; label: string }[] = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'pinterest', label: 'Pinterest' },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    phone: '',
    email: '',
    address: '',
    whatsapp: '',
    store_name: '',
    free_delivery_threshold: '3000',
    delivery_days: '3-5',
    tagline: '',
  });
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const { social_media, ...rest } = data.data;
          setSettings(prev => ({ ...prev, ...rest }));
          try {
            const parsed = typeof social_media === 'string' ? JSON.parse(social_media) : (social_media ?? []);
            setSocialLinks(parsed);
          } catch {
            setSocialLinks([]);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setError('');

    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...settings,
        social_media: JSON.stringify(socialLinks),
      }),
    });
    const data = await res.json();

    if (!data.success) {
      setError(data.error);
      setSaving(false);
      return;
    }

    setSaving(false);
    setSuccessMsg('Settings saved! Changes will appear on the store.');
    setTimeout(() => setSuccessMsg(''), 4000);
  }

  function addSocialLink() {
    setSocialLinks(prev => [...prev, { platform: 'instagram', url: '', enabled: true }]);
  }

  function removeSocialLink(index: number) {
    setSocialLinks(prev => prev.filter((_, i) => i !== index));
  }

  function updateSocialLink(index: number, field: keyof SocialLink, value: string | boolean) {
    setSocialLinks(prev => prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)));
  }

  const inputStyle = {
    width: '100%',
    padding: '0.7rem 0.85rem',
    border: '1px solid var(--border)',
    background: 'var(--off-white)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.875rem',
    color: 'var(--text-dark)',
    outline: 'none',
    borderRadius: '4px',
    transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.72rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-mid)',
    marginBottom: '0.4rem',
  };

  if (loading)
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-light)' }}>Loading settings...</p>
      </div>
    );

  return (
    <div style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem',
            fontWeight: 700,
            color: 'var(--text-dark)',
            marginBottom: '0.25rem',
          }}
        >
          Store Settings
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>
          Changes here update the navbar, footer, and store info automatically.
        </p>
      </div>

      {successMsg && (
        <div
          style={{
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '6px',
            fontSize: '0.85rem',
            color: '#16a34a',
          }}
        >
          ✓ {successMsg}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            fontSize: '0.85rem',
            color: '#dc2626',
          }}
        >
          {error}
        </div>
      )}

      {/* ── Store Info ── */}
      <div
        style={{
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            background: 'var(--off-white)',
          }}
        >
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)' }}>Store Information</h3>
        </div>
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {STORE_FIELDS.map(field => (
            <div key={field.key}>
              <label style={labelStyle}>{field.label}</label>
              <input
                type="text"
                value={settings[field.key]}
                onChange={e => setSettings(prev => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--blush-deep)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
              {field.hint && (
                <p style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '0.3rem' }}>{field.hint}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Social Media ── */}
      <div
        style={{
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            background: 'var(--off-white)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)' }}>Social Media Links</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.15rem' }}>
              Shown in the footer. Toggle to show/hide.
            </p>
          </div>
          <button
            onClick={addSocialLink}
            style={{
              padding: '0.45rem 0.85rem',
              background: 'var(--text-dark)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
            }}
          >
            + Add
          </button>
        </div>

        <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {socialLinks.length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', textAlign: 'center', padding: '1rem' }}>
              No social media links yet. Click + Add to add one.
            </p>
          ) : (
            socialLinks.map((link, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '140px 1fr 44px 44px',
                  gap: '0.5rem',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: 'var(--off-white)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                }}
              >
                {/* Platform select */}
                <select
                  value={link.platform}
                  onChange={e => updateSocialLink(i, 'platform', e.target.value)}
                  style={{
                    ...inputStyle,
                    padding: '0.5rem',
                    cursor: 'pointer',
                  }}
                >
                  {PLATFORM_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {/* URL */}
                <input
                  type="url"
                  value={link.url}
                  onChange={e => updateSocialLink(i, 'url', e.target.value)}
                  placeholder="https://..."
                  style={{ ...inputStyle, padding: '0.5rem' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--blush-deep)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />

                {/* Toggle */}
                <button
                  onClick={() => updateSocialLink(i, 'enabled', !link.enabled)}
                  title={link.enabled ? 'Visible' : 'Hidden'}
                  style={{
                    width: '44px',
                    height: '38px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    background: link.enabled ? '#f0fdf4' : '#fef2f2',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {link.enabled ? '👁' : '🙈'}
                </button>

                {/* Delete */}
                <button
                  onClick={() => removeSocialLink(i)}
                  style={{
                    width: '44px',
                    height: '38px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    background: 'transparent',
                    fontSize: '1rem',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  🗑
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Save button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
          style={{ opacity: saving ? 0.7 : 1, minWidth: '140px' }}
        >
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
}
