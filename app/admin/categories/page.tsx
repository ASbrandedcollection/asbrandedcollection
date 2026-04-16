'use client';

import type { Category, Subcategory } from '@/types';
import { useEffect, useState } from 'react';

const COMMON_ICONS = ['👗', '👔', '🧒', '💄', '🧴', '✨', '🧸', '👟', '👜', '💍', '🕶', '🧣', '🏷'];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  // Category modal
  const [catModal, setCatModal] = useState<'add' | 'edit' | null>(null);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({ name: '', slug: '', icon: '' });
  const [catSaving, setCatSaving] = useState(false);
  const [catError, setCatError] = useState('');
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);
  const [catDeleteError, setCatDeleteError] = useState('');

  // Subcategory modal
  const [subModal, setSubModal] = useState<'add' | 'edit' | null>(null);
  const [editingSub, setEditingSub] = useState<Subcategory | null>(null);
  const [selectedCatForSub, setSelectedCatForSub] = useState<Category | null>(null);
  const [subForm, setSubForm] = useState({ name: '', slug: '', group_name: '' });
  const [subSaving, setSubSaving] = useState(false);
  const [subError, setSubError] = useState('');
  const [deletingSubId, setDeletingSubId] = useState<string | null>(null);
  const [subDeleteError, setSubDeleteError] = useState('');

  // Expanded categories (to show subcategories)
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  const [subImageFile, setSubImageFile] = useState<File | null>(null);
  const [subImagePreview, setSubImagePreview] = useState<string | null>(null);
  const [subImageUploading, setSubImageUploading] = useState(false);

  async function fetchCategories() {
    setLoading(true);
    const res = await fetch('/api/admin/categories');
    const data = await res.json();
    if (data.success) {
      // Fetch subcategories for each category
      const subsRes = await fetch('/api/admin/subcategories');
      const subsData = await subsRes.json();
      const subs: Subcategory[] = subsData.success ? subsData.data : [];

      const withSubs = data.data.map((cat: Category) => ({
        ...cat,
        subcategories: subs.filter(s => s.category_id === cat.id),
      }));
      setCategories(withSubs);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  // ── Category handlers ─────────────────────────
  function openAddCat() {
    setCatForm({ name: '', slug: '', icon: '' });
    setEditingCat(null);
    setCatError('');
    setCatModal('add');
  }

  function openEditCat(cat: Category) {
    setCatForm({ name: cat.name, slug: cat.slug, icon: cat.icon ?? '' });
    setEditingCat(cat);
    setCatError('');
    setCatModal('edit');
  }

  function handleCatNameChange(name: string) {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setCatForm(f => ({ ...f, name, slug: editingCat ? f.slug : slug }));
  }

  async function handleSaveCat() {
    setCatSaving(true);
    setCatError('');
    if (!catForm.name) {
      setCatError('Name is required');
      setCatSaving(false);
      return;
    }

    const payload = {
      name: catForm.name.trim(),
      slug: catForm.slug.trim(),
      icon: catForm.icon || null,
    };

    const url = editingCat ? `/api/admin/categories/${editingCat.id}` : '/api/admin/categories';

    const res = await fetch(url, {
      method: editingCat ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) {
      setCatError(data.error);
      setCatSaving(false);
      return;
    }

    setCatModal(null);
    setCatSaving(false);
    fetchCategories();
    showSuccess(editingCat ? 'Category updated!' : 'Category added!');
  }

  async function toggleCatActive(cat: Category) {
    await fetch(`/api/admin/categories/${cat.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !cat.is_active }),
    });
    fetchCategories();
  }

  async function handleDeleteCat(id: string) {
    setCatDeleteError('');
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!data.success) {
      setCatDeleteError(data.error);
      return;
    }
    setDeletingCatId(null);
    fetchCategories();
    showSuccess('Category deleted!');
  }

  // ── Subcategory handlers ──────────────────────
  function openAddSub(cat: Category) {
    setSubForm({ name: '', slug: '', group_name: '' });
    setEditingSub(null);
    setSelectedCatForSub(cat);
    setSubError('');
    setSubImageFile(null);
    setSubImagePreview(null);
    setSubModal('add');
  }

  function openEditSub(sub: Subcategory, cat: Category) {
    setSubForm({ name: sub.name, slug: sub.slug, group_name: sub.group_name ?? '' });
    setEditingSub(sub);
    setSelectedCatForSub(cat);
    setSubError('');
    setSubImageFile(null);
    setSubImagePreview(sub.image_url ?? null);
    setSubModal('edit');
  }

  function handleSubNameChange(name: string) {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSubForm(f => ({ ...f, name, slug: editingSub ? f.slug : slug }));
  }

  async function handleSaveSub() {
    setSubSaving(true);
    setSubError('');

    if (!subForm.name) {
      setSubError('Name is required');
      setSubSaving(false);
      return;
    }

    if (editingSub) {
      let imageUrl = editingSub.image_url ?? null;

      // Upload new image if selected
      if (subImageFile) {
        imageUrl = await uploadSubImage(editingSub.id, subImageFile);
      }

      const res = await fetch(`/api/admin/subcategories/${editingSub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: subForm.name.trim(),
          slug: subForm.slug.trim(),
          group_name: subForm.group_name.trim() || null,
          image_url: imageUrl,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setSubError(data.error);
        setSubSaving(false);
        return;
      }
    } else {
      // Create subcategory first to get ID
      const res = await fetch('/api/admin/subcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: subForm.name.trim(),
          slug: subForm.slug.trim(),
          category_id: selectedCatForSub?.id,
          group_name: subForm.group_name.trim() || null,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setSubError(data.error);
        setSubSaving(false);
        return;
      }

      // Upload image if selected
      if (subImageFile && data.data?.id) {
        const imageUrl = await uploadSubImage(data.data.id, subImageFile);
        if (imageUrl) {
          await fetch(`/api/admin/subcategories/${data.data.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url: imageUrl }),
          });
        }
      }
    }

    setSubModal(null);
    setSubSaving(false);
    setSubImageFile(null);
    setSubImagePreview(null);
    fetchCategories();
    showSuccess(editingSub ? 'Subcategory updated!' : 'Subcategory added!');
  }

  async function toggleSubActive(sub: Subcategory) {
    await fetch(`/api/admin/subcategories/${sub.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !sub.is_active }),
    });
    fetchCategories();
  }

  async function handleDeleteSub(id: string) {
    setSubDeleteError('');
    const res = await fetch(`/api/admin/subcategories/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!data.success) {
      setSubDeleteError(data.error);
      return;
    }
    setDeletingSubId(null);
    fetchCategories();
    showSuccess('Subcategory deleted!');
  }

  async function uploadSubImage(subcategoryId: string, file: File): Promise<string | null> {
    setSubImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`/api/admin/subcategories/${subcategoryId}/image`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!data.success) return null;
      return data.data.image_url;
    } finally {
      setSubImageUploading(false);
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '0.65rem 0.75rem',
    border: '1px solid var(--border)',
    background: 'var(--off-white)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.85rem',
    color: 'var(--text-dark)',
    outline: 'none',
    borderRadius: '4px',
  };

  const labelStyle = {
    display: 'block' as const,
    fontSize: '0.7rem',
    fontWeight: 500 as const,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: 'var(--text-mid)',
    marginBottom: '0.4rem',
  };

  const badgeStyle = (active: boolean) => ({
    padding: '3px 10px',
    borderRadius: '20px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.68rem',
    fontWeight: 500 as const,
    background: active ? '#f0fdf4' : '#fef2f2',
    color: active ? '#16a34a' : '#dc2626',
    fontFamily: 'var(--font-body)',
  });

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem',
              fontWeight: 700,
              color: 'var(--text-dark)',
              marginBottom: '0.2rem',
            }}
          >
            Categories & Subcategories
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
            {categories.length} categories · click ▶ to manage subcategories
          </p>
        </div>
        <button onClick={openAddCat} className="btn-primary">
          + Add Category
        </button>
      </div>

      {successMsg && (
        <div
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '4px',
            fontSize: '0.85rem',
            color: '#16a34a',
          }}
        >
          ✓ {successMsg}
        </div>
      )}

      {/* Categories list */}
      <div
        style={{
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Loading...</p>
          </div>
        ) : categories.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '1rem' }}>No categories yet</p>
            <button onClick={openAddCat} className="btn-primary">
              Add First Category
            </button>
          </div>
        ) : (
          categories.map((cat, i) => {
            const isExpanded = expandedCats.has(cat.id);
            const subCount = cat.subcategories?.length ?? 0;

            return (
              <div key={cat.id}>
                {/* Category row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '32px 48px 1fr 120px 80px 160px',
                    padding: '0.85rem 1rem',
                    borderBottom: '1px solid var(--border)',
                    gap: '0.75rem',
                    alignItems: 'center',
                    background: isExpanded ? 'var(--blush-light)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  {/* Expand toggle */}
                  <button
                    onClick={() =>
                      setExpandedCats(prev => {
                        const next = new Set(prev);
                        if (next.has(cat.id)) next.delete(cat.id);
                        else next.add(cat.id);
                        return next;
                      })
                    }
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.7rem',
                      color: 'var(--text-light)',
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      padding: '2px',
                    }}
                  >
                    ▶
                  </button>

                  {/* Icon */}
                  <div style={{ fontSize: '1.4rem' }}>{cat.icon ?? '📁'}</div>

                  {/* Name + sub count */}
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>{cat.name}</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>
                      {subCount} subcategor{subCount === 1 ? 'y' : 'ies'} · /{cat.slug}
                    </p>
                  </div>

                  {/* Slug */}
                  <p
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-light)',
                      fontFamily: 'monospace',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {cat.slug}
                  </p>

                  {/* Toggle */}
                  <button onClick={() => toggleCatActive(cat)} style={badgeStyle(cat.is_active)}>
                    {cat.is_active ? 'Active' : 'Hidden'}
                  </button>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      onClick={() => openAddSub(cat)}
                      style={{
                        padding: '4px 8px',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: '0.72rem',
                        color: 'var(--text-mid)',
                        fontFamily: 'var(--font-body)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#16a34a';
                        e.currentTarget.style.color = '#16a34a';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.color = 'var(--text-mid)';
                      }}
                    >
                      + Sub
                    </button>
                    <button
                      onClick={() => openEditCat(cat)}
                      style={{
                        padding: '4px 8px',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: '0.72rem',
                        color: 'var(--text-mid)',
                        fontFamily: 'var(--font-body)',
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
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setDeletingCatId(cat.id);
                        setCatDeleteError('');
                      }}
                      style={{
                        padding: '4px 8px',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: '0.72rem',
                        color: 'var(--text-mid)',
                        fontFamily: 'var(--font-body)',
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

                {/* Subcategories (expanded) */}
                {isExpanded && (
                  <div style={{ background: '#fafafa', borderBottom: '1px solid var(--border)' }}>
                    {subCount === 0 ? (
                      <div
                        style={{
                          padding: '1rem 1rem 1rem 5rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                        }}
                      >
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>No subcategories yet</p>
                        <button
                          onClick={() => openAddSub(cat)}
                          style={{
                            padding: '4px 12px',
                            border: '1px solid #16a34a',
                            borderRadius: '4px',
                            background: 'transparent',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            color: '#16a34a',
                            fontFamily: 'var(--font-body)',
                          }}
                        >
                          + Add subcategory
                        </button>
                      </div>
                    ) : (
                      cat.subcategories?.map(sub => (
                        <div
                          key={sub.id}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '80px 1fr 120px 80px 120px',
                            padding: '0.65rem 1rem',
                            borderBottom: '1px solid var(--border)',
                            gap: '0.75rem',
                            alignItems: 'center',
                          }}
                        >
                          {/* Indent indicator */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              paddingLeft: '2rem',
                            }}
                          >
                            <div
                              style={{
                                width: '16px',
                                height: '1px',
                                background: 'var(--border-dark)',
                              }}
                            />
                          </div>

                          {/* Name */}
                          <div>
                            <p style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-dark)' }}>{sub.name}</p>
                            <p style={{ fontSize: '0.68rem', color: 'var(--text-light)' }}>/{sub.slug}</p>
                          </div>

                          {/* Slug */}
                          <p
                            style={{
                              fontSize: '0.72rem',
                              color: 'var(--text-light)',
                              fontFamily: 'monospace',
                            }}
                          >
                            {sub.slug}
                          </p>

                          {/* Toggle */}
                          <button onClick={() => toggleSubActive(sub)} style={badgeStyle(sub.is_active)}>
                            {sub.is_active ? 'Active' : 'Hidden'}
                          </button>

                          {/* Actions */}
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              onClick={() => openEditSub(sub, cat)}
                              style={{
                                padding: '4px 8px',
                                border: '1px solid var(--border)',
                                borderRadius: '4px',
                                background: 'transparent',
                                cursor: 'pointer',
                                fontSize: '0.72rem',
                                color: 'var(--text-mid)',
                                fontFamily: 'var(--font-body)',
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
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setDeletingSubId(sub.id);
                                setSubDeleteError('');
                              }}
                              style={{
                                padding: '4px 8px',
                                border: '1px solid var(--border)',
                                borderRadius: '4px',
                                background: 'transparent',
                                cursor: 'pointer',
                                fontSize: '0.72rem',
                                color: 'var(--text-mid)',
                                fontFamily: 'var(--font-body)',
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
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Category Modal ── */}
      {catModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={e => {
            if (e.target === e.currentTarget) setCatModal(null);
          }}
        >
          <div
            style={{
              background: 'var(--white)',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '480px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3
                style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)' }}
              >
                {editingCat ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                onClick={() => setCatModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  color: 'var(--text-light)',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {catError && (
                <div
                  style={{
                    padding: '0.75rem',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '4px',
                    fontSize: '0.82rem',
                    color: '#dc2626',
                  }}
                >
                  {catError}
                </div>
              )}

              <div>
                <label style={labelStyle}>Category Name *</label>
                <input
                  type="text"
                  value={catForm.name}
                  onChange={e => handleCatNameChange(e.target.value)}
                  placeholder="e.g. Makeup"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--blush-deep)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>

              <div>
                <label style={labelStyle}>Slug *</label>
                <input
                  type="text"
                  value={catForm.slug}
                  onChange={e => setCatForm(f => ({ ...f, slug: e.target.value }))}
                  placeholder="e.g. makeup"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--blush-deep)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
                <p style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.3rem' }}>
                  URL: /category/{catForm.slug || 'your-slug'}
                </p>
              </div>

              <div>
                <label style={labelStyle}>Icon (Emoji)</label>
                <input
                  type="text"
                  value={catForm.icon}
                  onChange={e => setCatForm(f => ({ ...f, icon: e.target.value }))}
                  placeholder="Pick or paste emoji"
                  style={{ ...inputStyle, fontSize: '1.2rem' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--blush-deep)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                  {COMMON_ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setCatForm(f => ({ ...f, icon }))}
                      style={{
                        width: '36px',
                        height: '36px',
                        border: `1px solid ${catForm.icon === icon ? 'var(--blush-deep)' : 'var(--border)'}`,
                        borderRadius: '4px',
                        background: catForm.icon === icon ? 'var(--blush-light)' : 'var(--off-white)',
                        cursor: 'pointer',
                        fontSize: '1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
              }}
            >
              <button onClick={() => setCatModal(null)} className="btn-outline">
                Cancel
              </button>
              <button
                onClick={handleSaveCat}
                disabled={catSaving}
                className="btn-primary"
                style={{ opacity: catSaving ? 0.7 : 1 }}
              >
                {catSaving ? 'Saving...' : editingCat ? 'Save Changes' : 'Add Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Subcategory Modal ── */}
      {subModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={e => {
            if (e.target === e.currentTarget) setSubModal(null);
          }}
        >
          <div
            style={{
              background: 'var(--white)',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '440px',
            }}
          >
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: 'var(--text-dark)',
                  }}
                >
                  {editingSub ? 'Edit Subcategory' : 'Add Subcategory'}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
                  Under: {selectedCatForSub?.name}
                </p>
              </div>
              <button
                onClick={() => setSubModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  color: 'var(--text-light)',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {subError && (
                <div
                  style={{
                    padding: '0.75rem',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '4px',
                    fontSize: '0.82rem',
                    color: '#dc2626',
                  }}
                >
                  {subError}
                </div>
              )}

              <div>
                <label style={labelStyle}>Subcategory Name *</label>
                <input
                  type="text"
                  value={subForm.name}
                  onChange={e => handleSubNameChange(e.target.value)}
                  placeholder="e.g. Eye Makeup"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--blush-deep)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>

              <div>
                <label style={labelStyle}>Slug *</label>
                <input
                  type="text"
                  value={subForm.slug}
                  onChange={e => setSubForm(f => ({ ...f, slug: e.target.value }))}
                  placeholder="e.g. eye-makeup"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--blush-deep)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>

              <div>
                <label style={labelStyle}>Group Name (optional)</label>
                <input
                  type="text"
                  value={subForm.group_name}
                  onChange={e => setSubForm(f => ({ ...f, group_name: e.target.value }))}
                  placeholder="e.g. FACE, EYES, LIPS"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--blush-deep)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
                <p style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.3rem' }}>
                  Groups subcategories under a heading in the mega menu
                </p>
              </div>

              {/* Image upload */}
              <div>
                <label style={labelStyle}>Image (optional)</label>
                <div
                  style={{
                    border: `2px dashed ${subImagePreview ? 'var(--blush-deep)' : 'var(--border)'}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                    minHeight: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                  onClick={() => document.getElementById('sub-image-upload')?.click()}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--blush-deep)')}
                  onMouseLeave={e =>
                    (e.currentTarget.style.borderColor = subImagePreview ? 'var(--blush-deep)' : 'var(--border)')
                  }
                >
                  {subImagePreview ? (
                    <img
                      src={subImagePreview}
                      alt="Preview"
                      style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                      <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>📷</div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Click to upload subcategory image</p>
                      <p style={{ fontSize: '0.68rem', color: 'var(--text-light)', marginTop: '0.15rem' }}>
                        Shows in mega menu · 80×80px recommended
                      </p>
                    </div>
                  )}
                  <input
                    id="sub-image-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setSubImageFile(file);
                      setSubImagePreview(URL.createObjectURL(file));
                    }}
                    style={{ display: 'none' }}
                  />
                </div>

                {subImagePreview && (
                  <button
                    onClick={() => {
                      setSubImageFile(null);
                      setSubImagePreview(null);
                    }}
                    style={{
                      marginTop: '0.4rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.72rem',
                      color: 'var(--text-light)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    ✕ Remove image
                  </button>
                )}
              </div>
            </div>

            <div
              style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
              }}
            >
              <button onClick={() => setSubModal(null)} className="btn-outline">
                Cancel
              </button>
              <button
                onClick={handleSaveSub}
                disabled={subSaving || subImageUploading}
                className="btn-primary"
                style={{ opacity: subSaving || subImageUploading ? 0.7 : 1 }}
              >
                {subImageUploading
                  ? 'Uploading...'
                  : subSaving
                    ? 'Saving...'
                    : editingSub
                      ? 'Save Changes'
                      : 'Add Subcategory'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Category Confirm ── */}
      {deletingCatId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: 'var(--white)',
              borderRadius: '8px',
              padding: '1.5rem',
              maxWidth: '360px',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: '#fef2f2',
                fontSize: '1.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              🗑
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--text-dark)',
                marginBottom: '0.5rem',
              }}
            >
              Delete Category?
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginBottom: '1rem' }}>
              This will also delete all its subcategories. Products in this category cannot be deleted.
            </p>
            {catDeleteError && (
              <div
                style={{
                  padding: '0.75rem',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  color: '#dc2626',
                  marginBottom: '1rem',
                }}
              >
                {catDeleteError}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setDeletingCatId(null);
                  setCatDeleteError('');
                }}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCat(deletingCatId)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Subcategory Confirm ── */}
      {deletingSubId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: 'var(--white)',
              borderRadius: '8px',
              padding: '1.5rem',
              maxWidth: '360px',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: '#fef2f2',
                fontSize: '1.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              🗑
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--text-dark)',
                marginBottom: '0.5rem',
              }}
            >
              Delete Subcategory?
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginBottom: '1rem' }}>
              Products assigned to this subcategory will have their subcategory cleared.
            </p>
            {subDeleteError && (
              <div
                style={{
                  padding: '0.75rem',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  color: '#dc2626',
                  marginBottom: '1rem',
                }}
              >
                {subDeleteError}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setDeletingSubId(null);
                  setSubDeleteError('');
                }}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSub(deletingSubId)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: '4px',
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
