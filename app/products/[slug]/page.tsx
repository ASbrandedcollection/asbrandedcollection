'use client';

import ReviewsSection from '@/components/ReviewSection';
import { useCart } from '@/lib/cart-context';
import { calcFinalPrice, formatPKR } from '@/lib/utils';
import type { Product } from '@/types';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem, isInCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setProduct(res.data);
          const primary = res.data.images?.find((i: any) => i.is_primary)?.image_url;
          setSelectedImage(primary ?? res.data.images?.[0]?.image_url ?? null);
        } else {
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    const finalPrice = calcFinalPrice(product.price, product.discount_percent);
    addItem({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      image_url: selectedImage,
      unit_price: finalPrice,
      original_price: product.price,
      discount_percent: product.discount_percent,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // ── Loading ───────────────────────────────────
  if (loading)
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '2px solid var(--border)',
              borderTopColor: 'var(--blush-deep)',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1rem',
            }}
          />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Loading product...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  // ── Not found ─────────────────────────────────
  if (notFound || !product)
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'var(--blush-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--blush-deep)" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.6rem',
              fontStyle: 'italic',
              color: 'var(--text-dark)',
              marginBottom: '0.5rem',
            }}
          >
            Product Not Found
          </h2>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            This product may have been removed or the link is incorrect.
          </p>
          <Link href="/products" className="btn-primary">
            Browse All Products
          </Link>
        </div>
      </div>
    );

  const finalPrice = calcFinalPrice(product.price, product.discount_percent);
  const hasDiscount = product.discount_percent > 0;
  const inCart = isInCart(product.id);
  const outOfStock = product.stock_qty === 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      {/* Breadcrumb */}
      <div
        style={{
          background: 'var(--white)',
          borderBottom: '1px solid var(--border)',
          padding: '0.75rem 0',
        }}
      >
        <div className="container" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            product.category && { label: product.category.name, href: `/products?category=${product.category.slug}` },
            { label: product.name, href: null },
          ]
            .filter(Boolean)
            .map((crumb: any, i, arr) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-light)',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--blush-deep)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-light)')}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-dark)',
                      fontWeight: 500,
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {crumb.label}
                  </span>
                )}
                {i < arr.length - 1 && <span style={{ fontSize: '0.7rem', color: 'var(--border-dark)' }}>›</span>}
              </span>
            ))}
        </div>
      </div>

      {/* Product detail */}
      <div className="container" style={{ padding: '2.5rem 2rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3rem',
            alignItems: 'start',
          }}
          className="product-grid"
        >
          {/* ── Images ── */}
          <div>
            {/* Main image */}
            <div
              className="product-detail-main-image"
              style={{
                width: '100%',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.75rem',
              }}
            >
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '3rem',
                  }}
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--blush-deep)" strokeWidth="1">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}

              {hasDiscount && (
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: 'var(--blush-deep)',
                    color: 'var(--white)',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    padding: '4px 10px',
                    letterSpacing: '0.05em',
                  }}
                >
                  -{product.discount_percent}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {product.images && product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {product.images.map(img => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.image_url)}
                    style={{
                      width: '72px',
                      height: '90px',
                      border: '2px solid',
                      borderColor: selectedImage === img.image_url ? 'var(--blush-deep)' : 'var(--border)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      background: 'var(--blush-light)',
                      padding: 0,
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div style={{ animation: 'fadeUp 0.4s ease' }}>
            {/* Category */}
            {product.category && (
              <Link
                href={`/products?category=${product.category.slug}`}
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--blush-deep)',
                  textDecoration: 'none',
                  display: 'inline-block',
                  marginBottom: '0.75rem',
                }}
              >
                {product.category.name}
              </Link>
            )}

            {/* Name */}
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                fontWeight: 400,
                fontStyle: 'italic',
                color: 'var(--text-dark)',
                lineHeight: 1.2,
                marginBottom: '1.25rem',
              }}
            >
              {product.name}
            </h1>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.8rem',
                  fontWeight: 400,
                  color: hasDiscount ? 'var(--blush-deep)' : 'var(--text-dark)',
                }}
              >
                {formatPKR(finalPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span
                    style={{
                      fontSize: '1.1rem',
                      color: 'var(--text-light)',
                      textDecoration: 'line-through',
                    }}
                  >
                    {formatPKR(product.price)}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      background: 'var(--blush-light)',
                      color: 'var(--blush-deep)',
                      padding: '3px 8px',
                    }}
                  >
                    Save {formatPKR(product.price - finalPrice)}
                  </span>
                </>
              )}
            </div>

            <div style={{ width: '100%', height: '1px', background: 'var(--border)', marginBottom: '1.5rem' }} />

            {/* Description */}
            {product.description && (
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-mid)',
                  lineHeight: 1.8,
                  marginBottom: '1.5rem',
                }}
              >
                {product.description}
              </p>
            )}

            {/* Stock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: outOfStock ? '#e57373' : '#81c784',
                }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-mid)' }}>
                {outOfStock ? 'Out of Stock' : product.stock_qty <= 5 ? `Only ${product.stock_qty} left` : 'In Stock'}
              </span>
            </div>

            {/* Quantity */}
            {!outOfStock && (
              <div style={{ marginBottom: '1.25rem' }}>
                <p
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--text-mid)',
                    marginBottom: '0.6rem',
                  }}
                >
                  Quantity
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '1px solid var(--border)',
                      background: 'var(--white)',
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      color: 'var(--text-mid)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    −
                  </button>
                  <div
                    style={{
                      width: '52px',
                      height: '40px',
                      border: '1px solid var(--border)',
                      borderLeft: 'none',
                      borderRight: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      color: 'var(--text-dark)',
                      background: 'var(--white)',
                    }}
                  >
                    {quantity}
                  </div>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock_qty, q + 1))}
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '1px solid var(--border)',
                      background: 'var(--white)',
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      color: 'var(--text-mid)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Add to cart / Go to cart */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {outOfStock ? (
                <button
                  disabled
                  style={{
                    flex: 1,
                    padding: '0.9rem 2rem',
                    background: 'var(--border)',
                    color: 'var(--text-light)',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-body)',
                    cursor: 'not-allowed',
                  }}
                >
                  Out of Stock
                </button>
              ) : inCart ? (
                <>
                  <Link href="/cart" style={{ flex: 1 }} className="btn-primary">
                    View Cart
                  </Link>
                  <button onClick={handleAddToCart} className="btn-outline" style={{ flex: 1 }}>
                    Add More
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    background: added ? '#81c784' : undefined,
                    transition: 'background 0.3s',
                  }}
                >
                  {added ? '✓ Added to Cart' : 'Add to Cart'}
                </button>
              )}
            </div>

            <div style={{ width: '100%', height: '1px', background: 'var(--border)', margin: '1.5rem 0' }} />

            {/* Meta info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'Category', value: product.category?.name },
                { label: 'Availability', value: outOfStock ? 'Out of Stock' : 'In Stock' },
                { label: 'Payment', value: 'Cash on Delivery' },
              ].map(
                ({ label, value }) =>
                  value && (
                    <div key={label} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-light)', minWidth: '90px' }}>{label}:</span>
                      <span style={{ color: 'var(--text-mid)' }}>{value}</span>
                    </div>
                  ),
              )}
            </div>
          </div>
        </div>

        <ReviewsSection productSlug={slug as string} />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .product-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
