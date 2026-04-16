'use client';

import { useEffect, useState } from 'react';
import type { Banner } from '@/types';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formLinkUrl, setFormLinkUrl] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  async function fetchBanners() {
    setLoading(true);
    const res = await fetch('/api/admin/banners');
    const data = await res.json();
    if (data.success) setBanners(data.data);
    setLoading(false);
  }

  useEffect(() => { fetchBanners(); }, []);

  function openModal() {
    setImageFile(null);
    setImagePreview(null);
    setFormTitle('');
    setFormLinkUrl('');
    setFormIsActive(true);
    setError('');
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setError('');
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleUpload() {
    if (!imageFile) {
      setError('Please select an image');
      return;
    }

    setSaving(true);
    setError('');

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('title', formTitle);
    formData.append('link_url', formLinkUrl);
    formData.append('is_active', formIsActive.toString());

    const res = await fetch('/api/admin/banners', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (!data.success) {
      setError(data.error);
      setSaving(false);
      return;
    }

    setSaving(false);
    closeModal();
    fetchBanners();
    setSuccessMsg('Banner uploaded!');
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  async function toggleActive(banner: Banner) {
    await fetch(`/api/admin/banners/${banner.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !banner.is_active }),
    });
    fetchBanners();
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      setDeletingId(null);
      fetchBanners();
      setSuccessMsg('Banner deleted!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  }

  async function updateOrder(id: string, direction: 'up' | 'down') {
    const index = banners.findIndex(b => b.id === id);
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === banners.length - 1) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...banners];
    [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]];
    setBanners(updated);

    await Promise.all([
      fetch(`/api/admin/banners/${updated[index].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_order: index + 1 }),
      }),
      fetch(`/api/admin/banners/${updated[swapIndex].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_order: swapIndex + 1 }),
      }),
    ]);
  }

  const inputStyle = {
    width: '100%', padding: '0.65rem 0.75rem',
    border: '1px solid var(--border)',
    background: 'var(--off-white)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.85rem', color: 'var(--text-dark)',
    outline: 'none', borderRadius: '4px',
  };

  const labelStyle = {
    display: 'block' as const,
    fontSize: '0.7rem', fontWeight: 500 as const,
    letterSpacing: '0.08em', textTransform: 'uppercase' as const,
    color: 'var(--text-mid)', marginBottom: '0.4rem',
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '1.5rem',
        flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem', fontStyle: 'italic',
            color: 'var(--text-dark)', marginBottom: '0.2rem',
          }}>
            Banners
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
            Homepage banner images — toggle on/off anytime
          </p>
        </div>
        <button onClick={openModal} className="btn-primary">
          + Upload Banner
        </button>
      </div>

      {/* Info box */}
      <div style={{
        padding: '0.85rem 1rem', marginBottom: '1.5rem',
        background: '#eff6ff', border: '1px solid #bfdbfe',
        borderRadius: '6px', fontSize: '0.8rem', color: '#1d4ed8',
        display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
      }}>
        <span>ℹ️</span>
        <span>
          Only <strong>active</strong> banners show on the homepage slider.
          Recommended size: <strong>1400 × 500px</strong> (wide landscape).
          Max file size: <strong>10MB</strong>.
        </span>
      </div>

      {/* Success message */}
      {successMsg && (
        <div style={{
          padding: '0.75rem 1rem', marginBottom: '1rem',
          background: '#f0fdf4', border: '1px solid #86efac',
          borderRadius: '4px', fontSize: '0.85rem', color: '#16a34a',
        }}>
          ✓ {successMsg}
        </div>
      )}

      {/* Banners grid */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Loading banners...</p>
        </div>
      ) : banners.length === 0 ? (
        <div style={{
          padding: '4rem 2rem', textAlign: 'center',
          background: 'var(--white)', border: '1px solid var(--border)',
          borderRadius: '8px',
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'var(--blush-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem', fontSize: '1.6rem',
          }}>
            🖼
          </div>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.2rem', fontStyle: 'italic',
            color: 'var(--text-dark)', marginBottom: '0.5rem',
          }}>
            No banners yet
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '1.5rem' }}>
            Upload your first banner to show on the homepage
          </p>
          <button onClick={openModal} className="btn-primary">
            Upload Banner
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {banners.map((banner, i) => (
            <div key={banner.id} style={{
              background: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: '8px', overflow: 'hidden',
              display: 'flex', gap: '0',
              opacity: banner.is_active ? 1 : 0.65,
              transition: 'opacity 0.2s',
            }}>
              {/* Banner image preview */}
              <div style={{
                width: '260px', flexShrink: 0,
                background: 'var(--blush-light)',
                position: 'relative', overflow: 'hidden',
              }}>
                <img
                  src={banner.image_url}
                  alt={banner.title ?? 'Banner'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '120px' }}
                />
                {!banner.is_active && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 500,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      color: 'white', background: 'rgba(0,0,0,0.5)',
                      padding: '4px 10px', borderRadius: '20px',
                    }}>
                      Hidden
                    </span>
                  </div>
                )}
              </div>

              {/* Banner info */}
              <div style={{
                flex: 1, padding: '1.25rem',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                gap: '0.75rem',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <p style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1rem', fontStyle: 'italic',
                      color: 'var(--text-dark)',
                    }}>
                      {banner.title || 'Untitled Banner'}
                    </p>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 500,
                      padding: '2px 8px', borderRadius: '20px',
                      background: banner.is_active ? '#f0fdf4' : '#fef2f2',
                      color: banner.is_active ? '#16a34a' : '#dc2626',
                    }}>
                      {banner.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </div>

                  {banner.link_url && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
                      🔗 {banner.link_url}
                    </p>
                  )}

                  <p style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                    Uploaded {new Date(banner.created_at).toLocaleDateString('en-PK', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {/* Reorder */}
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button
                      onClick={() => updateOrder(banner.id, 'up')}
                      disabled={i === 0}
                      title="Move up"
                      style={{
                        width: '28px', height: '28px',
                        border: '1px solid var(--border)',
                        borderRadius: '4px', background: 'transparent',
                        cursor: i === 0 ? 'not-allowed' : 'pointer',
                        opacity: i === 0 ? 0.3 : 1,
                        fontSize: '0.8rem', color: 'var(--text-mid)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => updateOrder(banner.id, 'down')}
                      disabled={i === banners.length - 1}
                      title="Move down"
                      style={{
                        width: '28px', height: '28px',
                        border: '1px solid var(--border)',
                        borderRadius: '4px', background: 'transparent',
                        cursor: i === banners.length - 1 ? 'not-allowed' : 'pointer',
                        opacity: i === banners.length - 1 ? 0.3 : 1,
                        fontSize: '0.8rem', color: 'var(--text-mid)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      ↓
                    </button>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => toggleActive(banner)}
                    style={{
                      padding: '0.4rem 0.9rem',
                      border: '1px solid var(--border)',
                      borderRadius: '4px', background: 'transparent',
                      cursor: 'pointer', fontSize: '0.75rem',
                      color: 'var(--text-mid)', fontFamily: 'var(--font-body)',
                      fontWeight: 500, transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--blush-deep)';
                      e.currentTarget.style.color = 'var(--blush-deep)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = 'var(--text-mid)';
                    }}
                  >
                    {banner.is_active ? 'Hide Banner' : 'Show Banner'}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setDeletingId(banner.id)}
                    style={{
                      padding: '0.4rem 0.9rem',
                      border: '1px solid var(--border)',
                      borderRadius: '4px', background: 'transparent',
                      cursor: 'pointer', fontSize: '0.75rem',
                      color: 'var(--text-mid)', fontFamily: 'var(--font-body)',
                      fontWeight: 500, transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#ef4444';
                      e.currentTarget.style.color = '#ef4444';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = 'var(--text-mid)';
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Upload Modal ── */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div style={{
            background: 'var(--white)', borderRadius: '8px',
            width: '100%', maxWidth: '520px',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            {/* Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.2rem', fontStyle: 'italic',
                color: 'var(--text-dark)',
              }}>
                Upload Banner
              </h3>
              <button onClick={closeModal} style={{
                background: 'none', border: 'none',
                cursor: 'pointer', fontSize: '1.1rem',
                color: 'var(--text-light)',
              }}>
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {error && (
                <div style={{
                  padding: '0.75rem', background: '#fef2f2',
                  border: '1px solid #fecaca', borderRadius: '4px',
                  fontSize: '0.82rem', color: '#dc2626',
                }}>
                  {error}
                </div>
              )}

              {/* Image upload */}
              <div>
                <label style={labelStyle}>Banner Image *</label>
                <div
                  style={{
                    border: '2px dashed var(--border)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                    minHeight: '160px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--blush-deep)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  onClick={() => document.getElementById('banner-upload')?.click()}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🖼</div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>
                        Click to upload banner image
                      </p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                        Recommended: 1400 × 500px · Max 10MB
                      </p>
                    </div>
                  )}
                  <input
                    id="banner-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </div>
                {imagePreview && (
                  <button
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    style={{
                      marginTop: '0.4rem', background: 'none',
                      border: 'none', cursor: 'pointer',
                      fontSize: '0.75rem', color: 'var(--text-light)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    ✕ Remove
                  </button>
                )}
              </div>

              {/* Title */}
              <div>
                <label style={labelStyle}>Title (optional)</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Summer Sale"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--blush-deep)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>

              {/* Link URL */}
              <div>
                <label style={labelStyle}>Link URL (optional)</label>
                <input
                  type="text"
                  value={formLinkUrl}
                  onChange={e => setFormLinkUrl(e.target.value)}
                  placeholder="e.g. /category/makeup or /products"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--blush-deep)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
                <p style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.3rem' }}>
                  Where should this banner link to when clicked?
                </p>
              </div>

              {/* Active toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  onClick={() => setFormIsActive(p => !p)}
                  style={{
                    width: '44px', height: '24px',
                    borderRadius: '12px', border: 'none',
                    background: formIsActive ? 'var(--blush-deep)' : 'var(--border-dark)',
                    cursor: 'pointer', position: 'relative',
                    transition: 'background 0.2s', flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: '18px', height: '18px',
                    borderRadius: '50%', background: 'white',
                    position: 'absolute', top: '3px',
                    left: formIsActive ? '23px' : '3px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </button>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-mid)' }}>
                  {formIsActive ? 'Show on homepage immediately' : 'Save as hidden'}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border)',
              display: 'flex', justifyContent: 'flex-end', gap: '0.75rem',
            }}>
              <button onClick={closeModal} className="btn-outline">Cancel</button>
              <button
                onClick={handleUpload}
                disabled={saving || !imageFile}
                className="btn-primary"
                style={{ opacity: saving || !imageFile ? 0.7 : 1 }}
              >
                {saving ? 'Uploading...' : 'Upload Banner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm ── */}
      {deletingId && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}>
          <div style={{
            background: 'var(--white)', borderRadius: '8px',
            padding: '1.5rem', maxWidth: '360px', width: '100%',
            textAlign: 'center',
          }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: '#fef2f2', fontSize: '1.4rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              🗑
            </div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem', fontStyle: 'italic',
              color: 'var(--text-dark)', marginBottom: '0.5rem',
            }}>
              Delete Banner?
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginBottom: '1.5rem' }}>
              This will permanently delete the banner image. Cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => setDeletingId(null)} className="btn-outline">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#ef4444', color: 'white',
                  border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8rem', fontWeight: 500,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}