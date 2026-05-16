'use client';

import { calcFinalPrice, formatPKR } from '@/lib/utils';
import type { Category, Product } from '@/types';
import { useEffect, useState } from 'react';

type ModalMode = 'add' | 'edit' | null;

const emptyForm = {
  name: '',
  description: '',
  category_id: '',
  subcategory_id: '',
  price: '',
  discount_percent: '0',
  stock_qty: '0',
  is_active: true,
  sku: '',
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);

  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(total / 10);

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [existingImages, setExistingImages] = useState<{ id: string; image_url: string; is_primary: boolean }[]>([]);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

  const [form, setForm] = useState(emptyForm);

  async function fetchProducts() {
    setLoading(true);
    const res = await fetch(`/api/admin/products?page=${page}&limit=10`);
    const data = await res.json();
    if (data.success) {
      setProducts(data.data.data);
      setTotal(data.data.total);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchProducts();
  }, [page]);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(data => {
        if (data.success) setCategories(data.data);
      });
  }, []);

  function openAdd() {
    setForm(emptyForm);
    setEditingProduct(null);
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setSubcategories([]);
    setError('');
    setModalMode('add');
  }

  function openEdit(product: Product) {
    setForm({
      name: product.name,
      description: product.description ?? '',
      category_id: product.category_id,
      subcategory_id: product.subcategory_id ?? '',
      price: product.price.toString(),
      discount_percent: product.discount_percent.toString(),
      stock_qty: product.stock_qty.toString(),
      is_active: product.is_active,
      sku: product.sku ?? '',
    });
    setEditingProduct(product);
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages(product.images ?? []);
    setError('');
    setModalMode('edit');
    // Load subcategories for this product's category
    if (product.category_id) fetchSubcategories(product.category_id);
  }

  async function fetchSubcategories(categoryId: string) {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }
    const res = await fetch(`/api/admin/subcategories?category_id=${categoryId}`);
    const data = await res.json();
    if (data.success) setSubcategories(data.data);
    else setSubcategories([]);
  }

  function closeModal() {
    setModalMode(null);
    setEditingProduct(null);
    setError('');
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  }

  async function uploadImage(productId: string, hasExistingImages: boolean) {
    for (let i = 0; i < imageFiles.length; i++) {
      const isPrimary = !hasExistingImages && i === 0;
      const formData = new FormData();
      formData.append('image', imageFiles[i]);
      formData.append('is_primary', isPrimary ? 'true' : 'false');
      await fetch(`/api/admin/products/${productId}/images`, {
        method: 'POST',
        body: formData,
      });
    }
  }

  async function handleSave() {
    setSaving(true);
    setError('');

    if (!form.name || !form.category_id || !form.price) {
      setError('Name, category and price are required');
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description,
      category_id: form.category_id,
      subcategory_id: form.subcategory_id || null,
      price: parseFloat(form.price),
      discount_percent: parseFloat(form.discount_percent),
      stock_qty: parseInt(form.stock_qty),
      is_active: form.is_active,
      sku: form.sku.trim() || null,
    };

    let productId = editingProduct?.id;

    if (modalMode === 'add') {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error);
        setSaving(false);
        return;
      }
      productId = data.data.id;
    } else if (modalMode === 'edit' && editingProduct) {
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error);
        setSaving(false);
        return;
      }
    }

    // Upload image if selected
    if (imageFiles.length && productId) {
      setUploadingImage(true);
      await uploadImage(productId, modalMode === 'edit' && existingImages.length > 0);
      setUploadingImage(false);
    }

    setSaving(false);
    closeModal();
    fetchProducts();
    setSuccessMsg(modalMode === 'add' ? 'Product added!' : 'Product updated!');
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  async function handleDeleteImage(imageId: string, productId: string) {
    setDeletingImageId(imageId);
    const res = await fetch(`/api/admin/products/${productId}/images?image_id=${imageId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    }
    setDeletingImageId(null);
  }

  async function handleDelete(productId: string) {
    const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      setDeletingId(null);
      fetchProducts();
      setSuccessMsg('Product deleted!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  }

  async function toggleActive(product: Product) {
    await fetch(`/api/admin/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !product.is_active }),
    });
    fetchProducts();
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
              fontStyle: 'italic',
              color: 'var(--text-dark)',
              marginBottom: '0.2rem',
            }}
          >
            Products
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
            {total} total product{total !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          + Add Product
        </button>
      </div>

      {/* Success message */}
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

      {/* Products table */}
      <div
        style={{
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '60px 1fr 120px 100px 80px 80px 100px',
            padding: '0.75rem 1rem',
            background: 'var(--off-white)',
            borderBottom: '1px solid var(--border)',
            gap: '0.75rem',
            alignItems: 'center',
          }}
        >
          {['Image', 'Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
            <p
              key={h}
              style={{
                fontSize: '0.68rem',
                fontWeight: 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--text-light)',
              }}
            >
              {h}
            </p>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '1rem' }}>No products yet</p>
            <button onClick={openAdd} className="btn-primary">
              Add First Product
            </button>
          </div>
        ) : (
          products.map((product, i) => {
            const primaryImage = product.images?.find(img => img.is_primary)?.image_url;
            const finalPrice = calcFinalPrice(product.price, product.discount_percent);

            return (
              <div
                key={product.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 120px 100px 80px 80px 100px',
                  padding: '0.75rem 1rem',
                  borderBottom: i < products.length - 1 ? '1px solid var(--border)' : 'none',
                  gap: '0.75rem',
                  alignItems: 'center',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = 'var(--off-white)')}
                onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
              >
                {/* Image */}
                <div
                  style={{
                    width: '48px',
                    height: '60px',
                    background: 'var(--blush-light)',
                    overflow: 'hidden',
                    borderRadius: '4px',
                    flexShrink: 0,
                  }}
                >
                  {primaryImage ? (
                    <img
                      src={primaryImage}
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                      }}
                    >
                      📷
                    </div>
                  )}
                </div>

                {/* Name */}
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 500,
                      color: 'var(--text-dark)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: '0.15rem',
                    }}
                  >
                    {product.name}
                  </p>
                  {product.discount_percent > 0 && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 500,
                        padding: '1px 6px',
                        borderRadius: '10px',
                        background: 'var(--blush-light)',
                        color: 'var(--blush-deep)',
                      }}
                    >
                      -{product.discount_percent}% off
                    </span>
                  )}
                </div>

                {/* Category */}
                <p
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-mid)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {product.category?.name ?? '—'}
                </p>

                {/* Price */}
                <div>
                  <p style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-dark)' }}>{formatPKR(finalPrice)}</p>
                  {product.discount_percent > 0 && (
                    <p
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-light)',
                        textDecoration: 'line-through',
                      }}
                    >
                      {formatPKR(product.price)}
                    </p>
                  )}
                </div>

                {/* Stock */}
                <p
                  style={{
                    fontSize: '0.82rem',
                    color: product.stock_qty === 0 ? '#ef4444' : product.stock_qty <= 5 ? '#f59e0b' : 'var(--text-dark)',
                    fontWeight: product.stock_qty <= 5 ? 500 : 400,
                  }}
                >
                  {product.stock_qty}
                </p>

                {/* Active toggle */}
                <button
                  onClick={() => toggleActive(product)}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '20px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.68rem',
                    fontWeight: 500,
                    background: product.is_active ? '#f0fdf4' : '#fef2f2',
                    color: product.is_active ? '#16a34a' : '#dc2626',
                    fontFamily: 'var(--font-body)',
                    transition: 'all 0.15s',
                  }}
                >
                  {product.is_active ? 'Active' : 'Hidden'}
                </button>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => openEdit(product)}
                    style={{
                      padding: '4px 8px',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontSize: '0.72rem',
                      color: 'var(--text-mid)',
                      fontFamily: 'var(--font-body)',
                      transition: 'all 0.15s',
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
                    onClick={() => setDeletingId(product.id)}
                    style={{
                      padding: '4px 8px',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontSize: '0.72rem',
                      color: 'var(--text-mid)',
                      fontFamily: 'var(--font-body)',
                      transition: 'all 0.15s',
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
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '1rem',
          }}
        >
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: '0.4rem 0.9rem',
              border: '1px solid var(--border)',
              background: 'var(--white)',
              borderRadius: '4px',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              opacity: page === 1 ? 0.4 : 1,
              fontSize: '0.8rem',
              color: 'var(--text-mid)',
              fontFamily: 'var(--font-body)',
            }}
          >
            ← Prev
          </button>
          <span style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', color: 'var(--text-mid)' }}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              padding: '0.4rem 0.9rem',
              border: '1px solid var(--border)',
              background: 'var(--white)',
              borderRadius: '4px',
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
              opacity: page === totalPages ? 0.4 : 1,
              fontSize: '0.8rem',
              color: 'var(--text-mid)',
              fontFamily: 'var(--font-body)',
            }}
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Add/Edit Modal ── */}
      {modalMode && (
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
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            style={{
              background: 'var(--white)',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Modal header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                background: 'var(--white)',
                zIndex: 1,
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.2rem',
                  fontStyle: 'italic',
                  color: 'var(--text-dark)',
                }}
              >
                {modalMode === 'add' ? 'Add New Product' : 'Edit Product'}
              </h3>
              <button
                onClick={closeModal}
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

            {/* Modal body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {error && (
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
                  {error}
                </div>
              )}

              {/* Name */}
              <div>
                <label style={labelStyle}>Product Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Floral Lawn Suit"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--blush-deep)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>

              {/* Category */}
              <div>
                <label style={labelStyle}>Category *</label>
                <select
                  value={form.category_id}
                  onChange={e => {
                    setForm(f => ({ ...f, category_id: e.target.value, subcategory_id: '' }));
                    fetchSubcategories(e.target.value);
                  }}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="">Select category...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory — only show if category selected and has subcategories */}
              {form.category_id && subcategories.length > 0 && (
                <div>
                  <label style={labelStyle}>Subcategory (optional)</label>
                  <select
                    value={form.subcategory_id}
                    onChange={e => setForm(f => ({ ...f, subcategory_id: e.target.value }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="">No subcategory</option>
                    {subcategories.map(sub => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Price + Discount */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Price (PKR) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="0"
                    min="0"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = 'var(--blush-deep)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Discount %</label>
                  <input
                    type="number"
                    value={form.discount_percent}
                    onChange={e => setForm(f => ({ ...f, discount_percent: e.target.value }))}
                    placeholder="0"
                    min="0"
                    max="100"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = 'var(--blush-deep)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label style={labelStyle}>Stock Quantity</label>
                <input
                  type="number"
                  value={form.stock_qty}
                  onChange={e => setForm(f => ({ ...f, stock_qty: e.target.value }))}
                  placeholder="0"
                  min="0"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--blush-deep)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>

              {/* SKU */}
              <div>
                <label style={labelStyle}>SKU (optional)</label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                  placeholder="e.g. AS-LPS-001"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--blush-deep)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
                <p style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.3rem' }}>
                  Unique identifier for inventory tracking
                </p>
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Product description..."
                  rows={3}
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                    lineHeight: 1.6,
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--blush-deep)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>

              {/* Image upload */}
              <div>
                <label style={labelStyle}>Product Images</label>
                {/* Existing images — only shown when editing */}
                {modalMode === 'edit' && existingImages.length > 0 && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <p
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-light)',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Current images — click × to remove
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {existingImages.map(img => (
                        <div
                          key={img.id}
                          style={{
                            position: 'relative',
                            width: '80px',
                            height: '96px',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            border: img.is_primary ? '2px solid var(--blush-deep)' : '1px solid var(--border)',
                          }}
                        >
                          <img
                            src={img.image_url}
                            alt="Product"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          {/* Primary badge */}
                          {img.is_primary && (
                            <div
                              style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'var(--blush-deep)',
                                fontSize: '0.55rem',
                                fontWeight: 700,
                                color: 'white',
                                textAlign: 'center',
                                padding: '2px',
                                letterSpacing: '0.04em',
                              }}
                            >
                              PRIMARY
                            </div>
                          )}
                          {/* Delete button */}
                          <button
                            onClick={() => editingProduct && handleDeleteImage(img.id, editingProduct.id)}
                            disabled={deletingImageId === img.id}
                            style={{
                              position: 'absolute',
                              top: '3px',
                              right: '3px',
                              width: '20px',
                              height: '20px',
                              background: 'rgba(0,0,0,0.6)',
                              border: 'none',
                              borderRadius: '50%',
                              cursor: 'pointer',
                              color: 'white',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#ef4444')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.6)')}
                          >
                            {deletingImageId === img.id ? '...' : '×'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload new image */}
                {/* Only show upload if: adding new product, OR editing with no images yet, OR editing and explicitly want to add more */}
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>
                    {modalMode === 'edit' && existingImages.length > 0
                      ? 'Upload additional images'
                      : 'Upload product images'}
                  </p>
                  <div
                    style={{
                      border: `2px dashed ${imagePreviews.length > 0 ? 'var(--blush-deep)' : 'var(--border)'}`,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s',
                      minHeight: '120px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--blush-deep)')}
                    onMouseLeave={e =>
                      (e.currentTarget.style.borderColor = imagePreviews.length > 0 ? 'var(--blush-deep)' : 'var(--border)')
                    }
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                      <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>📷</div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>Click to upload (select multiple)</p>
                      <p style={{ fontSize: '0.68rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
                        JPEG, PNG, WebP · max 5MB each
                      </p>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                  </div>

                  {imagePreviews.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                      {imagePreviews.map((src, i) => (
                        <div key={i} style={{ position: 'relative', width: '80px', height: '96px' }}>
                          <img
                            src={src}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                          />
                          {i === 0 && existingImages.length === 0 && (
                            <div
                              style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'var(--blush-deep)',
                                fontSize: '0.55rem',
                                fontWeight: 700,
                                color: 'white',
                                textAlign: 'center',
                                padding: '2px',
                              }}
                            >
                              PRIMARY
                            </div>
                          )}
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setImageFiles(prev => prev.filter((_, j) => j !== i));
                              setImagePreviews(prev => prev.filter((_, j) => j !== i));
                            }}
                            style={{
                              position: 'absolute',
                              top: '3px',
                              right: '3px',
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: 'rgba(0,0,0,0.6)',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'white',
                              fontSize: '0.65rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {imagePreviews.length > 0 && (
                    <p style={{ fontSize: '0.72rem', color: 'var(--blush-deep)', marginTop: '0.4rem' }}>
                      ✓ {imagePreviews.length} image{imagePreviews.length !== 1 ? 's' : ''} ready to upload
                    </p>
                  )}
                </div>

                {/* Set as primary hint */}
                {modalMode === 'edit' && existingImages.length > 0 && imageFiles.length > 0 && (
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.4rem', fontStyle: 'italic' }}>
                    New images will be uploaded as additional images.
                  </p>
                )}
              </div>

              {/* Active toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    border: 'none',
                    background: form.is_active ? 'var(--blush-deep)' : 'var(--border-dark)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: 'white',
                      position: 'absolute',
                      top: '3px',
                      left: form.is_active ? '23px' : '3px',
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }}
                  />
                </button>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-mid)' }}>
                  {form.is_active ? 'Visible to customers' : 'Hidden from store'}
                </span>
              </div>
            </div>

            {/* Modal footer */}
            <div
              style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                position: 'sticky',
                bottom: 0,
                background: 'var(--white)',
              }}
            >
              <button onClick={closeModal} className="btn-outline">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploadingImage}
                className="btn-primary"
                style={{ opacity: saving || uploadingImage ? 0.7 : 1 }}
              >
                {saving
                  ? 'Saving...'
                  : uploadingImage
                    ? 'Uploading...'
                    : modalMode === 'add'
                      ? 'Add Product'
                      : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm modal ── */}
      {deletingId && (
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '1.4rem',
              }}
            >
              🗑
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                fontStyle: 'italic',
                color: 'var(--text-dark)',
                marginBottom: '0.5rem',
              }}
            >
              Delete Product?
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginBottom: '1.5rem' }}>
              This will permanently delete the product and all its images. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => setDeletingId(null)} className="btn-outline">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
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
