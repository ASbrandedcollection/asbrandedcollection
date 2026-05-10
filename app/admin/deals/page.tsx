'use client';

import { useEffect, useState } from 'react';

interface ProductOption {
  id: string;
  name: string;
  price: number;
  images: { image_url: string; is_primary: boolean }[];
}

interface DealProduct {
  product: ProductOption;
}

interface Deal {
  id: string;
  title: string;
  deal_price: number;
  is_active: boolean;
  sort_order: number;
  deal_products: DealProduct[];
}

const emptyForm = () => ({
  title: '',
  deal_price: '',
  sort_order: 0,
  is_active: true,
  product_ids: [] as string[],
});

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [allProducts, setAllProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState('');
  const [productSearch, setProductSearch] = useState('');

  async function load() {
    const [dealsRes, prodsRes] = await Promise.all([
      fetch('/api/admin/deals').then(r => r.json()),
      fetch('/api/admin/products?limit=200').then(r => r.json()),
    ]);
    if (dealsRes.success) setDeals(dealsRes.data);
    if (prodsRes.success) setAllProducts(prodsRes.data.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setError('');
    setProductSearch('');
    setShowForm(true);
  }

  function openEdit(deal: Deal) {
    setEditing(deal);
    setForm({
      title: deal.title,
      deal_price: String(deal.deal_price),
      sort_order: deal.sort_order,
      is_active: deal.is_active,
      product_ids: deal.deal_products.map(dp => dp.product.id),
    });
    setError('');
    setProductSearch('');
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setError('Deal title is required.');
      return;
    }
    if (!form.deal_price || isNaN(Number(form.deal_price))) {
      setError('A valid deal price is required.');
      return;
    }
    if (form.product_ids.length < 2) {
      setError('Please select at least 2 products for the bundle.');
      return;
    }

    setSaving(true);
    setError('');
    const body = {
      title: form.title.trim(),
      deal_price: Number(form.deal_price),
      sort_order: form.sort_order,
      is_active: form.is_active,
      product_ids: form.product_ids,
    };

    const res = editing
      ? await fetch(`/api/admin/deals/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }).then(r => r.json())
      : await fetch('/api/admin/deals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }).then(r => r.json());

    setSaving(false);
    if (!res.success) {
      setError(res.error ?? 'Something went wrong.');
      return;
    }
    setShowForm(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this deal?')) return;
    await fetch(`/api/admin/deals/${id}`, { method: 'DELETE' });
    load();
  }

  async function toggleActive(deal: Deal) {
    await fetch(`/api/admin/deals/${deal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !deal.is_active }),
    });
    load();
  }

  function toggleProduct(id: string) {
    setForm(f => ({
      ...f,
      product_ids: f.product_ids.includes(id) ? f.product_ids.filter(p => p !== id) : [...f.product_ids, id],
    }));
  }

  const filteredProducts = allProducts.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));

  const selectedProducts = allProducts.filter(p => form.product_ids.includes(p.id));
  const originalTotal = selectedProducts.reduce((sum, p) => sum + p.price, 0);
  const dealPrice = Number(form.deal_price) || 0;
  const savings = originalTotal - dealPrice;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem',
              fontStyle: 'italic',
              color: 'var(--text-dark)',
              marginBottom: '0.2rem',
            }}
          >
            Bundle Deals
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
            Create product bundles with special pricing shown on the homepage.
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            background: 'var(--blush-deep)',
            color: 'white',
            border: 'none',
            padding: '0.6rem 1.2rem',
            borderRadius: '6px',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Add Deal
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '1rem',
            overflowY: 'auto',
          }}
          onClick={e => {
            if (e.target === e.currentTarget) setShowForm(false);
          }}
        >
          <div
            style={{
              background: 'var(--white)',
              borderRadius: '10px',
              width: '100%',
              maxWidth: '600px',
              padding: '1.75rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              margin: 'auto',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                fontStyle: 'italic',
                color: 'var(--text-dark)',
                marginBottom: '1.25rem',
              }}
            >
              {editing ? 'Edit Deal' : 'Create Bundle Deal'}
            </h3>

            {error && (
              <p
                style={{
                  fontSize: '0.8rem',
                  color: '#ef4444',
                  marginBottom: '1rem',
                  padding: '0.6rem 0.75rem',
                  background: '#fef2f2',
                  borderRadius: '6px',
                }}
              >
                {error}
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={labelStyle}>
                Deal Title *
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Lip Care Bundle"
                  style={inputStyle}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <label style={labelStyle}>
                  Bundle Price (PKR) *
                  <input
                    type="number"
                    value={form.deal_price}
                    onChange={e => setForm(f => ({ ...f, deal_price: e.target.value }))}
                    placeholder="e.g. 2200"
                    style={inputStyle}
                  />
                </label>
                <label style={labelStyle}>
                  Sort Order
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                    style={inputStyle}
                  />
                </label>
              </div>

              {/* Live pricing preview */}
              {selectedProducts.length >= 2 && dealPrice > 0 && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'var(--blush-light)',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: 'var(--text-dark)',
                  }}
                >
                  Original total: <strong>PKR {originalTotal.toLocaleString()}</strong>
                  {' → '}
                  Bundle price: <strong style={{ color: 'var(--blush-deep)' }}>PKR {dealPrice.toLocaleString()}</strong>
                  {savings > 0 && (
                    <span style={{ color: '#16a34a', marginLeft: '0.5rem' }}>· Save PKR {savings.toLocaleString()}</span>
                  )}
                  {savings < 0 && (
                    <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}>· Bundle price is higher than original!</span>
                  )}
                </div>
              )}

              {/* Product selector */}
              <div>
                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                  Select Products * <span style={{ fontWeight: 400, color: 'var(--text-light)' }}>(min. 2)</span>
                </p>

                {/* Selected chips */}
                {selectedProducts.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.6rem' }}>
                    {selectedProducts.map(p => (
                      <span
                        key={p.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.72rem',
                          fontWeight: 500,
                          padding: '3px 8px',
                          background: 'var(--blush-light)',
                          borderRadius: '20px',
                          color: 'var(--blush-deep)',
                          border: '1px solid var(--blush)',
                        }}
                      >
                        {p.name}
                        <button
                          onClick={() => toggleProduct(p.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--blush-deep)',
                            lineHeight: 1,
                            padding: 0,
                            fontSize: '0.9rem',
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <input
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  placeholder="Search products to add…"
                  style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', marginBottom: '0.5rem' }}
                />

                <div
                  style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '6px' }}
                >
                  {filteredProducts.length === 0 ? (
                    <p style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-light)', textAlign: 'center' }}>
                      No products found
                    </p>
                  ) : (
                    filteredProducts.map((p, i) => {
                      const selected = form.product_ids.includes(p.id);
                      const image = p.images?.find(img => img.is_primary)?.image_url;
                      return (
                        <div
                          key={p.id}
                          onClick={() => toggleProduct(p.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.6rem 0.85rem',
                            cursor: 'pointer',
                            borderBottom: i < filteredProducts.length - 1 ? '1px solid var(--border)' : 'none',
                            background: selected ? 'var(--blush-light)' : 'transparent',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => {
                            if (!selected) (e.currentTarget as HTMLDivElement).style.background = 'var(--off-white)';
                          }}
                          onMouseLeave={e => {
                            if (!selected) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                          }}
                        >
                          <div
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '3px',
                              flexShrink: 0,
                              border: selected ? 'none' : '1.5px solid var(--border)',
                              background: selected ? 'var(--blush-deep)' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {selected && <span style={{ color: 'white', fontSize: '0.65rem', fontWeight: 700 }}>✓</span>}
                          </div>
                          {image && (
                            <img
                              src={image}
                              alt={p.name}
                              style={{
                                width: '32px',
                                height: '32px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                              style={{
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                color: 'var(--text-dark)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {p.name}
                            </p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>PKR {p.price?.toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  color: 'var(--text-dark)',
                }}
              >
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                />
                Active (visible on homepage)
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={cancelBtnStyle}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} style={saveBtnStyle}>
                {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Deal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deals list */}
      {loading ? (
        <div
          style={{
            background: 'var(--white)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '3rem',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Loading…</p>
        </div>
      ) : deals.length === 0 ? (
        <div
          style={{
            background: 'var(--white)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '3rem',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>No deals yet</p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
            Create your first bundle deal to display the deals section on the homepage.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {deals.map(deal => {
            const products = deal.deal_products.map(dp => dp.product);
            const originalTotal = products.reduce((sum, p) => sum + p.price, 0);
            const savings = originalTotal - deal.deal_price;

            return (
              <div
                key={deal.id}
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.2rem' }}>
                      {deal.title}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--blush-deep)', fontWeight: 600 }}>
                        PKR {deal.deal_price.toLocaleString()}
                      </span>
                      {originalTotal > 0 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                          PKR {originalTotal.toLocaleString()}
                        </span>
                      )}
                      {savings > 0 && (
                        <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 500 }}>
                          · Save PKR {savings.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button
                      onClick={() => toggleActive(deal)}
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        padding: '3px 10px',
                        borderRadius: '20px',
                        border: 'none',
                        cursor: 'pointer',
                        background: deal.is_active ? '#dcfce7' : '#f3f4f6',
                        color: deal.is_active ? '#16a34a' : '#6b7280',
                      }}
                    >
                      {deal.is_active ? 'Active' : 'Inactive'}
                    </button>
                    <button onClick={() => openEdit(deal)} style={editBtnStyle}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(deal.id)} style={deleteBtnStyle}>
                      Delete
                    </button>
                  </div>
                </div>

                {/* Products preview */}
                <div
                  style={{
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  }}
                >
                  {products.map((p, i) => {
                    const image = p.images?.find(img => img.is_primary)?.image_url;
                    return (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.4rem 0.75rem',
                            background: 'var(--off-white)',
                            borderRadius: '6px',
                            border: '1px solid var(--border)',
                          }}
                        >
                          {image && (
                            <img
                              src={image}
                              alt={p.name}
                              style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '3px' }}
                            />
                          )}
                          <div>
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dark)' }}>{p.name}</p>
                            <p style={{ fontSize: '0.68rem', color: 'var(--text-light)' }}>
                              PKR {p.price?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {i < products.length - 1 && (
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: 700 }}>+</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
  fontSize: '0.82rem',
  fontWeight: 600,
  color: 'var(--text-dark)',
};
const inputStyle: React.CSSProperties = {
  padding: '0.6rem 0.75rem',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  fontSize: '0.85rem',
  fontFamily: 'var(--font-body)',
  color: 'var(--text-dark)',
  outline: 'none',
  background: 'var(--white)',
};
const saveBtnStyle: React.CSSProperties = {
  background: 'var(--blush-deep)',
  color: 'white',
  border: 'none',
  padding: '0.6rem 1.25rem',
  borderRadius: '6px',
  fontSize: '0.82rem',
  fontWeight: 600,
  cursor: 'pointer',
};
const cancelBtnStyle: React.CSSProperties = {
  background: 'transparent',
  color: 'var(--text-mid)',
  border: '1px solid var(--border)',
  padding: '0.6rem 1.25rem',
  borderRadius: '6px',
  fontSize: '0.82rem',
  fontWeight: 500,
  cursor: 'pointer',
};
const editBtnStyle: React.CSSProperties = {
  fontSize: '0.72rem',
  padding: '4px 10px',
  borderRadius: '4px',
  border: '1px solid var(--border)',
  background: 'transparent',
  cursor: 'pointer',
  color: 'var(--text-mid)',
  fontWeight: 500,
};
const deleteBtnStyle: React.CSSProperties = {
  fontSize: '0.72rem',
  padding: '4px 10px',
  borderRadius: '4px',
  border: '1px solid #fecaca',
  background: '#fef2f2',
  cursor: 'pointer',
  color: '#ef4444',
  fontWeight: 500,
};
