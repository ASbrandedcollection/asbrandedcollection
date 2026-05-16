'use client';

import { calcFinalPrice, formatPKR } from '@/lib/utils';
import type { Category, Product, ProductVariant } from '@/types';
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

function VariantsEditor({
  productId,
  existingImages,
}: {
  productId: string;
  existingImages: { id: string; image_url: string; is_primary: boolean }[];
}) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);

  // The "type name" is shared across all variants of a product (e.g. "Shade").
  // We infer it from existing variants, or let admin set it when adding the first one.
  const [typeName, setTypeName] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newImageId, setNewImageId] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/products/${productId}/variants`)
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setVariants(res.data);
          if (res.data.length > 0) setTypeName(res.data[0].type_name);
        }
      })
      .finally(() => setLoading(false));
  }, [productId]);

  async function handleAdd() {
    if (!typeName.trim() || !newLabel.trim()) {
      setErr('Type name and label are required');
      return;
    }
    setAdding(true);
    setErr('');
    const res = await fetch(`/api/admin/products/${productId}/variants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type_name: typeName.trim(),
        label: newLabel.trim(),
        image_id: newImageId || null,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setVariants(prev => [...prev, data.data]);
      setNewLabel('');
      setNewImageId('');
    } else {
      setErr(data.error);
    }
    setAdding(false);
  }

  async function handleDelete(variantId: string) {
    setDeletingId(variantId);
    await fetch(`/api/admin/products/${productId}/variants/${variantId}`, { method: 'DELETE' });
    setVariants(prev => prev.filter(v => v.id !== variantId));
    setDeletingId(null);
  }

  async function handleImageChange(variantId: string, imageId: string) {
    const res = await fetch(`/api/admin/products/${productId}/variants/${variantId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_id: imageId || null }),
    });
    const data = await res.json();
    if (data.success) {
      setVariants(prev => prev.map(v => (v.id === variantId ? data.data : v)));
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: '0.55rem 0.65rem',
    border: '1px solid var(--border)',
    background: 'var(--off-white)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.82rem',
    color: 'var(--text-dark)',
    outline: 'none',
    borderRadius: '4px',
    width: '100%',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.68rem',
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-mid)',
    display: 'block',
    marginBottom: '0.3rem',
  };

  if (loading) {
    return <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', padding: '0.5rem 0' }}>Loading variants...</p>;
  }

  return (
    <div>
      {/* Type name — locked once variants exist */}
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={labelStyle}>Variant Type (e.g. Shade, Color, Size)</label>
        <input
          type="text"
          value={typeName}
          onChange={e => setTypeName(e.target.value)}
          placeholder="e.g. Shade"
          disabled={variants.length > 0}
          style={{
            ...inputStyle,
            opacity: variants.length > 0 ? 0.6 : 1,
            cursor: variants.length > 0 ? 'not-allowed' : 'text',
          }}
        />
        {variants.length > 0 && (
          <p style={{ fontSize: '0.68rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
            Delete all variants to change the type name.
          </p>
        )}
      </div>

      {/* Existing variants list */}
      {variants.length > 0 && (
        <div style={{ marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {variants.map(v => {
            const linkedImg = existingImages.find(img => img.id === v.image_id);
            return (
              <div
                key={v.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr auto',
                  gap: '0.5rem',
                  alignItems: 'center',
                  padding: '0.5rem 0.6rem',
                  background: 'var(--off-white)',
                  borderRadius: '4px',
                  border: '1px solid var(--border)',
                }}
              >
                {/* Label */}
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dark)', fontWeight: 500 }}>{v.label}</span>

                {/* Image picker */}
                <select
                  value={v.image_id ?? ''}
                  onChange={e => handleImageChange(v.id, e.target.value)}
                  style={{ ...inputStyle, width: 'auto', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  <option value="">No image</option>
                  {existingImages.map((img, i) => (
                    <option key={img.id} value={img.id}>
                      {img.is_primary ? '★ Primary' : `Image ${i + 1}`}
                    </option>
                  ))}
                </select>

                {/* Linked image thumb */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {linkedImg && (
                    <img
                      src={linkedImg.image_url}
                      alt=""
                      style={{
                        width: '32px',
                        height: '40px',
                        objectFit: 'cover',
                        borderRadius: '3px',
                        border: '1px solid var(--border)',
                      }}
                    />
                  )}
                  <button
                    onClick={() => handleDelete(v.id)}
                    disabled={deletingId === v.id}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: 'none',
                      background: '#fee2e2',
                      color: '#dc2626',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {deletingId === v.id ? '…' : '×'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add new variant row */}
      {err && <p style={{ fontSize: '0.75rem', color: '#dc2626', marginBottom: '0.4rem' }}>{err}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.5rem', alignItems: 'end' }}>
        <div>
          <label style={labelStyle}>Label</label>
          <input
            type="text"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder="e.g. SH-01"
            style={inputStyle}
            onKeyDown={e => {
              if (e.key === 'Enter') handleAdd();
            }}
          />
        </div>
        <div>
          <label style={labelStyle}>Link to Image</label>
          <select
            value={newImageId}
            onChange={e => setNewImageId(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="">No image</option>
            {existingImages.map((img, i) => (
              <option key={img.id} value={img.id}>
                {img.is_primary ? '★ Primary' : `Image ${i + 1}`}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAdd}
          disabled={adding}
          style={{
            padding: '0.55rem 1rem',
            background: 'var(--blush-deep)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: adding ? 'not-allowed' : 'pointer',
            fontSize: '0.78rem',
            fontWeight: 500,
            fontFamily: 'var(--font-body)',
            whiteSpace: 'nowrap',
            opacity: adding ? 0.7 : 1,
          }}
        >
          {adding ? '…' : '+ Add'}
        </button>
      </div>

      {existingImages.length === 0 && (
        <p style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.4rem', fontStyle: 'italic' }}>
          Upload product images first, then link each variant to an image.
        </p>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
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

  // Track the saved product id so VariantsEditor can load even for a brand-new product
  const [savedProductId, setSavedProductId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'details' | 'variants'>('details');

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
    setSavedProductId(null);
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setSubcategories([]);
    setError('');
    setActiveTab('details');
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
    setSavedProductId(product.id);
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages(product.images ?? []);
    setError('');
    setActiveTab('details');
    setModalMode('edit');
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
    setSavedProductId(null);
    setError('');
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  }

  async function uploadImage(productId: string, hasExistingImages: boolean) {
    const uploaded: { id: string; image_url: string; is_primary: boolean }[] = [];
    for (let i = 0; i < imageFiles.length; i++) {
      const isPrimary = !hasExistingImages && i === 0;
      const formData = new FormData();
      formData.append('image', imageFiles[i]);
      formData.append('is_primary', isPrimary ? 'true' : 'false');
      const res = await fetch(`/api/admin/products/${productId}/images`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) uploaded.push(data.data);
    }
    // Update existingImages so VariantsEditor can immediately see new images
    setExistingImages(prev => [...prev, ...uploaded]);
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

    let productId = editingProduct?.id ?? savedProductId;

    if (modalMode === 'add' && !savedProductId) {
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
      setSavedProductId(productId!);
    } else if (productId) {
      const res = await fetch(`/api/admin/products/${productId}`, {
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

    if (imageFiles.length && productId) {
      setUploadingImage(true);
      await uploadImage(productId, modalMode === 'edit' && existingImages.length > 0);
      setUploadingImage(false);
      setImageFiles([]);
      setImagePreviews([]);
    }

    setSaving(false);
    fetchProducts();
    setSuccessMsg(modalMode === 'add' && !savedProductId ? 'Product added!' : 'Product updated!');
    setTimeout(() => setSuccessMsg(''), 3000);

    // If adding: switch to Variants tab so admin can immediately add shades/colors
    if (modalMode === 'add') {
      setActiveTab('variants');
    }
  }

  async function handleDeleteImage(imageId: string, productId: string) {
    setDeletingImageId(imageId);
    const res = await fetch(`/api/admin/products/${productId}/images?image_id=${imageId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) setExistingImages(prev => prev.filter(img => img.id !== imageId));
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

  const inputStyle: React.CSSProperties = {
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

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.7rem',
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-mid)',
    marginBottom: '0.4rem',
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.5rem 1.1rem',
    border: 'none',
    borderBottom: active ? '2px solid var(--blush-deep)' : '2px solid transparent',
    background: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontSize: '0.8rem',
    fontWeight: active ? 600 : 400,
    color: active ? 'var(--blush-deep)' : 'var(--text-light)',
    transition: 'all 0.15s',
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
        style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}
      >
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
                <div>
                  <p style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-dark)' }}>{formatPKR(finalPrice)}</p>
                  {product.discount_percent > 0 && (
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                      {formatPKR(product.price)}
                    </p>
                  )}
                </div>
                <p
                  style={{
                    fontSize: '0.82rem',
                    color: product.stock_qty === 0 ? '#ef4444' : product.stock_qty <= 5 ? '#f59e0b' : 'var(--text-dark)',
                    fontWeight: product.stock_qty <= 5 ? 500 : 400,
                  }}
                >
                  {product.stock_qty}
                </p>
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
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
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
              maxWidth: '580px',
              maxHeight: '92vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal header */}
            <div
              style={{
                padding: '1.1rem 1.5rem',
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

            {/* Tabs — only show Variants tab once product is saved */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid var(--border)',
                padding: '0 1.5rem',
                background: 'var(--white)',
                position: 'sticky',
                top: '52px',
                zIndex: 1,
              }}
            >
              <button style={tabStyle(activeTab === 'details')} onClick={() => setActiveTab('details')}>
                Details
              </button>
              <button
                style={{
                  ...tabStyle(activeTab === 'variants'),
                  opacity: savedProductId ? 1 : 0.4,
                  cursor: savedProductId ? 'pointer' : 'not-allowed',
                }}
                onClick={() => {
                  if (savedProductId) setActiveTab('variants');
                }}
                title={!savedProductId ? 'Save the product first to add variants' : ''}
              >
                Variants {!savedProductId && <span style={{ fontSize: '0.62rem', marginLeft: '0.2rem' }}>(save first)</span>}
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
              {error && (
                <div
                  style={{
                    padding: '0.75rem',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '4px',
                    fontSize: '0.82rem',
                    color: '#dc2626',
                    marginBottom: '1rem',
                  }}
                >
                  {error}
                </div>
              )}

              {/* ── DETAILS TAB ── */}
              {activeTab === 'details' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                      style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                      onFocus={e => (e.target.style.borderColor = 'var(--blush-deep)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                    />
                  </div>

                  {/* Image upload */}
                  <div>
                    <label style={labelStyle}>Product Images</label>
                    {modalMode === 'edit' && existingImages.length > 0 && (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>
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
                          minHeight: '100px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--blush-deep)')}
                        onMouseLeave={e =>
                          (e.currentTarget.style.borderColor =
                            imagePreviews.length > 0 ? 'var(--blush-deep)' : 'var(--border)')
                        }
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                          <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>📷</div>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
                            Click to upload (select multiple)
                          </p>
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
              )}

              {/* ── VARIANTS TAB ── */}
              {activeTab === 'variants' && savedProductId && (
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-mid)', marginBottom: '1rem', lineHeight: 1.6 }}>
                    Add selectable variants for this product (e.g. Shades for lipstick, Colors for hair dye). Each variant
                    can be linked to one of the product's images — clicking it on the product page will switch to that image.
                  </p>
                  <VariantsEditor productId={savedProductId} existingImages={existingImages} />
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div
              style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                bottom: 0,
                background: 'var(--white)',
              }}
            >
              {/* Left: done button on variants tab once product saved */}
              {activeTab === 'variants' ? (
                <button onClick={closeModal} className="btn-primary">
                  Done
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '0.75rem', marginLeft: 'auto' }}>
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
                        : modalMode === 'add' && !savedProductId
                          ? 'Save & Continue'
                          : 'Save Changes'}
                  </button>
                </div>
              )}
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
              This will permanently delete the product, all its images, and all its variants. This cannot be undone.
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
