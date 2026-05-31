'use client';

import { SocialIcon, SocialPlatform } from '@/components/SocialIcons';
import { useCart } from '@/lib/cart-context';
import { useSettings } from '@/lib/use-settings';
import { calcFinalPrice, formatPKR } from '@/lib/utils';
import type { Banner, BrandItem, Category, Deal, Product } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

function ProductCard({ product }: { product: Product }) {
  const finalPrice = calcFinalPrice(product.price, product.discount_percent);
  const image = product.images?.find(i => i.is_primary)?.image_url ?? null;
  const hasDiscount = product.discount_percent > 0;
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      image_url: image ?? '',
      unit_price: finalPrice,
      original_price: product.price,
      discount_percent: product.discount_percent,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div
        style={{
          background: 'var(--white)',
          // border: '1px solid var(--border)',
          borderRadius: '6px',
          overflow: 'hidden',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
        }}
      >
        {/* Image */}
        <div
          style={{
            width: '100%',
            background: 'var(--blush-light)',
            position: 'relative',
            overflow: 'hidden',
          }}
          className="product-card-image"
        >
          {image ? (
            <img src={image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--border-dark)" strokeWidth="1.2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>No image</span>
            </div>
          )}
          {hasDiscount && (
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: '#10b981',
                color: 'var(--white)',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '3px',
              }}
            >
              -{product.discount_percent}%
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '0.85rem' }}>
          {/* Add to Cart button — now at the top */}
          <button
            onClick={handleAddToCart}
            style={{
              width: '100%',
              padding: '0.6rem 0',
              background: added ? 'var(--text-dark)' : '#f94144',
              border: 'none',
              borderColor: added ? 'var(--text-dark)' : 'var(--accent)',
              color: 'var(--white)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '0.5rem',
              borderRadius: '100px',
            }}
          >
            {added ? '✓ Added' : 'Add to Cart'}
          </button>

          <p
            style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-light)',
              marginBottom: '0.3rem',
              textAlign: 'center',
            }}
          >
            {product.category?.name}
          </p>
          <p
            style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--text-dark)',
              marginBottom: '0.5rem',
              lineHeight: 1.3,
              textAlign: 'center',
            }}
          >
            {product.name.slice(0, 20).concat('...')}
          </p>

          {/* Stars + review count */}
          {(product.review_count ?? 0) > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                marginBottom: '0.25rem',
                justifyContent: 'center',
              }}
            >
              <div style={{ display: 'flex', gap: '1px' }}>
                {[1, 2, 3, 4, 5].map(star => {
                  const fill = Math.min(1, Math.max(0, (product.rating_avg ?? 0) - (star - 1)));
                  return (
                    <svg key={star} width="10" height="10" viewBox="0 0 24 24">
                      <defs>
                        <linearGradient id={`star-${product.id}-${star}`}>
                          <stop offset={`${fill * 100}%`} stopColor="var(--blush-deep)" />
                          <stop offset={`${fill * 100}%`} stopColor="#e5e7eb" />
                        </linearGradient>
                      </defs>
                      <polygon
                        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                        fill={`url(#star-${product.id}-${star})`}
                        stroke="none"
                      />
                    </svg>
                  );
                })}
              </div>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-light)' }}>({product.review_count})</span>
            </div>
          )}

          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '.5rem', justifyContent: 'center' }}
          >
            <span
              style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: hasDiscount ? 'var(--blush-deep)' : 'var(--text-dark)',
              }}
            >
              {formatPKR(finalPrice)}
            </span>
            {hasDiscount && (
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-light)',
                  textDecoration: 'line-through',
                }}
              >
                {formatPKR(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function BannerSlider() {
  const [current, setCurrent] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/banners')
      .then(r => r.json())
      .then(res => {
        if (res.success) setBanners(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const next = useCallback(() => setCurrent(c => (c + 1) % Math.max(banners.length, 1)), [banners.length]);
  const prev = () => setCurrent(c => (c - 1 + Math.max(banners.length, 1)) % Math.max(banners.length, 1));

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, banners.length]);

  if (!mounted) return null;

  if (loading)
    return (
      <div className="banner-container">
        <div
          className="banner-height"
          style={{
            width: '100%',
            background: 'var(--off-white)',
            animation: 'pulse 1.5s ease infinite',
          }}
        />
      </div>
    );

  if (banners.length === 0)
    return (
      <div className="banner-container">
        <div
          className="banner-height"
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #f5ede4 0%, #fdf0eb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: 'rgba(201,125,106,0.08)',
              right: '-100px',
              top: '-100px',
            }}
          />
          <div style={{ textAlign: 'center', padding: '0 2rem', position: 'relative', zIndex: 1 }}>
            <p
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--blush-deep)',
                marginBottom: '1rem',
              }}
            >
              New Collection
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 5vw, 3.2rem)',
                fontWeight: 700,
                color: 'var(--text-dark)',
                lineHeight: 1.2,
                marginBottom: '1rem',
              }}
            >
              Shop the Latest
              <br />
              Fashion & Beauty
            </h1>
            <p
              style={{
                fontSize: '1rem',
                color: 'var(--text-mid)',
                marginBottom: '2rem',
              }}
            >
              Discover curated collections delivered across Pakistan
            </p>
            <Link href="/products" className="btn-primary">
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    );

  const banner = banners[current];

  return (
    <div className="banner-container">
      <div className="banner-wrapper">
        <div
          className="banner-height"
          style={{
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
            background: 'var(--off-white)',
            borderRadius: '12px',
          }}
        >
          <img
            src={banner.image_url}
            alt={banner.title ?? 'Banner'}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.5s ease' }}
          />

          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)' }} />

          {banner.title && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 clamp(1.5rem, 6vw, 4rem)',
              }}
            >
              <div style={{ textAlign: 'center', animation: 'fadeUp 0.5s ease' }}>
                <h1
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                    fontWeight: 700,
                    color: 'white',
                    lineHeight: 1.2,
                    marginBottom: '1.25rem',
                    textShadow: '0 2px 12px rgba(0,0,0,0.3)',
                  }}
                >
                  {banner.title}
                </h1>
                {banner.link_url && (
                  <Link
                    href={banner.link_url}
                    className="btn-primary"
                    style={{ background: 'white', color: 'var(--text-dark)', borderColor: 'white' }}
                  >
                    Shop Now
                  </Link>
                )}
              </div>
            </div>
          )}

          {banners.length > 1 && (
            <>
              <button
                onClick={prev}
                style={{
                  position: 'absolute',
                  left: 'clamp(0.75rem, 3vw, 1.5rem)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.85)',
                  border: 'none',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  color: 'var(--text-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                ←
              </button>
              <button
                onClick={next}
                style={{
                  position: 'absolute',
                  right: 'clamp(0.75rem, 3vw, 1.5rem)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.85)',
                  border: 'none',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  color: 'var(--text-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                →
              </button>
              <div
                style={{
                  position: 'absolute',
                  bottom: '1.25rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: '0.5rem',
                }}
              >
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    style={{
                      width: i === current ? '24px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      background: i === current ? 'white' : 'rgba(255,255,255,0.5)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .banner-wrapper {
          padding: 0;
        }
        .banner-height {
          height: clamp(300px, 50vh, 520px);
        }
        @media (max-width: 768px) {
          .banner-wrapper {
            padding: 0 1rem;
            margin-top: 0.5rem !important;
          }
          .banner-height {
            height: 220px !important;
          }
        }
      `}</style>
    </div>
  );
}

function FeaturesStrip() {
  const features = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      ),
      title: 'Free Delivery',
      desc: 'On orders above PKR 3,000',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      title: '100% Original',
      desc: 'Authentic products guaranteed',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.64a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
      title: '24/7 Support',
      desc: 'Always here to help you',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
      ),
      title: 'Easy Returns',
      desc: 'Hassle-free 7 day returns',
    },
  ];

  return (
    <div
      style={{
        background: 'var(--white)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Desktop grid */}
      <div className="features-desktop">
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0',
            }}
          >
            {features.map((feature, i) => (
              <div
                key={i}
                style={{
                  padding: '1.5rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  borderRight: i < features.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    background: 'var(--blush-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--blush-deep)',
                    flexShrink: 0,
                  }}
                >
                  {feature.icon}
                </div>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.15rem' }}>
                    {feature.title}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile horizontal scroll */}
      <div
        className="features-mobile"
        style={{
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch' as any,
          scrollSnapType: 'x mandatory',
          paddingLeft: '1rem',
          paddingRight: '1rem',
          paddingTop: '1rem',
          paddingBottom: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'nowrap', width: 'max-content' }}>
          {features.map((feature, i) => (
            <div
              key={i}
              style={{
                flexShrink: 0,
                // width: 'calc(100vw - 2rem)',
                maxWidth: '280px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column', // ← changed
                alignItems: 'center', // ← changed
                gap: '0.6rem', // ← slightly tighter than 1rem for column layout
                background: 'var(--off-white)',
                borderRadius: '6px',
                scrollSnapAlign: 'start',
                textAlign: 'center', // ← added
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  background: 'var(--blush-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--blush-deep)',
                  flexShrink: 0,
                }}
              >
                {feature.icon}
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.15rem' }}>
                  {feature.title}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .features-desktop { display: block !important; }
          .features-mobile { display: none !important; }
        }
 
        @media (max-width: 768px) {
          .features-desktop { display: none !important; }
          .features-mobile { display: flex !important; }
          .features-mobile::-webkit-scrollbar { display: none; }
          .features-mobile { -ms-overflow-style: none; scrollbar-width: none; }
        }
      `}</style>
    </div>
  );
}

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }} className="section-brand-header">
      <p
        style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--off-white)',
          marginBottom: '0.6rem',
          backgroundColor: '#861657',
          width: 'max-content',
          textAlign: 'center',
          display: 'inline-block',
          padding: '.5rem 1rem',
        }}
      >
        {label}
      </p>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
          fontWeight: 700,
          color: 'var(--text-dark)',
        }}
      >
        {title}
      </h2>
      <div className="divider" style={{ margin: '0.85rem auto 0' }} />

      <style>{`
        @media (max-width: 768px) {
          .section-brand-header {
            margin-bottom: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}

// CategoryLinks component
function CategoryLinks({ categories }: { categories: Category[] }) {
  const [showAll, setShowAll] = useState(false);

  // Don't render anything until categories are loaded from API
  if (categories.length === 0) return null;

  const visibleCategories = showAll ? categories : categories.slice(0, 4);

  const categoryItems = [
    ...visibleCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      href: `/category/${cat.slug}`,
      image_url: cat.image_url ?? null,
      isButton: false,
    })),
    {
      id: 'all',
      name: showAll ? 'Show Less' : 'All',
      href: '#',
      image_url: null,
      isButton: true,
    },
  ];

  return (
    <section style={{ padding: '3.5rem 0', background: 'var(--off-white)' }} className="shop-category">
      <div className="container container-mobile">
        <SectionHeader label="Browse by Category" title="Shop Our Collections" />

        {/* Desktop grid */}
        <div
          className="categories-desktop"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '1rem',
          }}
        >
          {categoryItems.map((item, i) => {
            const inner = (
              <div
                style={{
                  borderRadius: '6px',
                  padding: '1.5rem 1rem',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  animation: `fadeUp 0.4s ease ${i * 0.06}s both`,
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--blush-deep)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'var(--blush-light)',
                    overflow: 'hidden',
                    border: '2px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.75rem',
                  }}
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '2rem' }}>🛍️</span>
                  )}
                </div>
                <p
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: item.isButton ? 'var(--blush-deep)' : 'var(--text-dark)',
                  }}
                >
                  {item.name}
                </p>
              </div>
            );

            return item.isButton ? (
              <button
                key={item.id}
                onClick={() => setShowAll(prev => !prev)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', width: '100%' }}
              >
                {inner}
              </button>
            ) : (
              <Link key={item.id} href={item.href} style={{ textDecoration: 'none' }}>
                {inner}
              </Link>
            );
          })}
        </div>

        {/* Mobile horizontal scroll */}
        <div
          className="categories-mobile"
          style={{
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch' as any,
            scrollSnapType: 'x mandatory',
            paddingLeft: '1rem',
            paddingRight: '1rem',
            paddingBottom: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'nowrap', width: 'max-content' }}>
            {categoryItems.map((item, i) => {
              const inner = (
                <div
                  style={{
                    flexShrink: 0,
                    width: '90px',
                    maxWidth: '90px',
                    padding: '0.5rem 0.25rem',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    animation: `fadeUp 0.4s ease ${i * 0.06}s both`,
                    cursor: 'pointer',
                    scrollSnapAlign: 'start',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--blush-deep)';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      width: '90px',
                      height: '90px',
                      borderRadius: '50%',
                      background: 'var(--blush-light)',
                      overflow: 'hidden',
                      border: '2px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: '1.5rem' }}>🛍️</span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: item.isButton ? 'var(--blush-deep)' : 'var(--text-dark)',
                      margin: 0,
                    }}
                  >
                    {item.name}
                  </p>
                </div>
              );

              return item.isButton ? (
                <button
                  key={item.id}
                  onClick={() => setShowAll(prev => !prev)}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                >
                  {inner}
                </button>
              ) : (
                <Link key={item.id} href={item.href} style={{ textDecoration: 'none' }}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .categories-desktop { display: grid !important; }
          .categories-mobile { display: none !important; }
        }

        @media (max-width: 768px) {
          .categories-desktop { display: none !important; }
          .categories-mobile { display: flex !important; }
          .categories-mobile::-webkit-scrollbar { display: none; }
          .categories-mobile { -ms-overflow-style: none; scrollbar-width: none; }
          .shop-category {padding: 1.2rem 0px !important;}
          .container-mobile {padding: 0 1rem !important}
        }
      `}</style>
    </section>
  );
}

function ProductsGrid({
  label,
  title,
  products,
  bg = 'var(--white)',
  viewAllHref = '/products',
}: {
  label: string;
  title: string;
  products: Product[];
  bg?: string;
  viewAllHref?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section style={{ padding: '3.5rem 0', background: bg }}>
      <div className="container">
        <SectionHeader label={label} title={title} />
        <div
          className="home-products-row"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {products.map((product, i) => (
            <div key={product.id} style={{ animation: `fadeUp 0.4s ease ${i * 0.07}s both` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Link href={viewAllHref} className="btn-outline">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}

function PromoBanner() {
  return (
    <section
      style={{
        background: 'linear-gradient(135deg, var(--text-dark) 0%, #2d2d2d 100%)',
        padding: '3.5rem 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(201,125,106,0.1)',
          right: '-80px',
          top: '-80px',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(201,125,106,0.08)',
          left: '5%',
          bottom: '-60px',
          pointerEvents: 'none',
        }}
      />

      <div
        className="container"
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '2rem',
        }}
      >
        <div>
          <p
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--blush-deep)',
              marginBottom: '0.75rem',
            }}
          >
            Special Offer
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.2,
              marginBottom: '0.75rem',
            }}
          >
            Get Free Delivery on
            <br />
            Your First Order
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', maxWidth: '400px' }}>
            Shop from our wide range of fashion, makeup, and lifestyle products. Delivered right to your doorstep across
            Pakistan.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
          <Link
            href="/products"
            className="btn-primary"
            style={{
              background: 'var(--blush-deep)',
              borderColor: 'var(--blush-deep)',
              minWidth: '180px',
              justifyContent: 'center',
            }}
          >
            Shop Now
          </Link>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>Cash on Delivery · No advance payment</p>
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const [products, setProducts] = useState<number | null>(null);
  const [customers, setCustomers] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setProducts(d.products);
          setCustomers(d.happy_customers);
        }
      })
      .catch(() => {});
  }, []);

  const fmt = (n: number | null, fallback: string) =>
    n === null ? fallback : n >= 1000 ? `${(n / 1000).toFixed(1)}k+` : `${n}+`;

  const stats = [
    { value: fmt(customers, '5,000+'), label: 'Happy Customers' },
    { value: fmt(products, '500+'), label: 'Products Available' },
    { value: '100%', label: 'Original Products' },
  ];

  return (
    <section style={{ padding: '3rem 0', background: 'var(--blush-light)' }}>
      <div className="container">
        <div
          style={{
            display: 'flex',
            // gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '2rem',
            textAlign: 'center',
            justifyContent: 'center',
          }}
          className="stats-grid"
        >
          {stats.map((stat, i) => (
            <div key={i}>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                  fontWeight: 700,
                  color: '#e63946',
                  lineHeight: 1,
                  marginBottom: '0.4rem',
                }}
              >
                {stat.value}
              </p>
              <p
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: 'var(--text-mid)',
                  letterSpacing: '0.03em',
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section style={{ padding: '4rem 0', background: 'var(--white)' }}>
      <div className="container">
        <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
          <p
            style={{
              fontSize: '1.2rem',
              fontWeight: 900,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#e63946',
              marginBottom: '0.75rem',
            }}
          >
            About Us
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
              fontWeight: 700,
              color: 'var(--text-dark)',
              marginBottom: '1.25rem',
            }}
          >
            Your Trusted Fashion &amp; Beauty Destination
          </h2>
          <div className="divider" style={{ margin: '0 auto 1.5rem' }} />

          {/* Both paragraphs collapse together */}
          <div
            className="about-body"
            style={{
              overflow: 'hidden',
              maxHeight: expanded ? '400px' : '0',
              opacity: expanded ? 1 : 0,
              transition: 'max-height 0.4s ease, opacity 0.35s ease',
            }}
          >
            <p style={{ fontSize: '0.95rem', color: 'var(--text-mid)', lineHeight: 1.8, marginBottom: '1rem' }}>
              We are a Pakistani fashion and beauty store dedicated to bringing you the finest collection of garments,
              makeup, skincare, and lifestyle products. Every product we carry is carefully selected for quality and
              authenticity.
            </p>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-mid)', lineHeight: 1.8, marginBottom: '2rem' }}>
              From everyday essentials to special occasion outfits, we have something for everyone in the family. Shop with
              confidence — all products are 100% original and delivered right to your door across Pakistan.
            </p>
          </div>

          {/* Toggle button — mobile only */}
          <button
            onClick={() => setExpanded(prev => !prev)}
            className="about-toggle-btn"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--blush-deep)',
              fontSize: '1.3rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'none',
              alignItems: 'center',
              gap: '0.3rem',
              margin: '0 auto 1.75rem',
              padding: 0,
            }}
          >
            {expanded ? 'Read less -' : 'Read more +'}
          </button>

          <style>{`
            @media (max-width: 768px) {
              .about-toggle-btn {
                display: flex !important;
              }
            }
            @media (min-width: 769px) {
              .about-body {
                max-height: 400px !important;
                opacity: 1 !important;
              }
            }
          `}</style>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/products" className="btn-primary">
              Browse Products
            </Link>
            <Link href="/category/makeup" className="btn-outline">
              View Makeup
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({ categories }: { categories: Category[] }) {
  const { settings } = useSettings();
  const socialLinks = settings.social_media?.filter(s => s.enabled && s.url) ?? [];

  const [expanded, setExpanded] = useState({
    categories: false,
    customerService: false,
    contact: false,
  });

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Light warm footer — all tokens use dark text
  const BG = '#f0e6e0'; // warm rose-beige, a step darker than #fdf6f0
  const TEXT_MAIN = '#2a1a16'; // very dark brown — store name, body
  const TEXT_MID = '#6b4a42'; // medium warm brown — paragraph text
  const TEXT_LINK = '#5a3a32'; // links default
  const TEXT_LABEL = '#a07060'; // muted warm for ALL-CAPS section labels
  const BORDER_CLR = 'rgba(42,26,22,0.12)';

  return (
    <footer style={{ background: '#861657', color: TEXT_MID, padding: '3rem 0 1.5rem' }}>
      <div className="container">
        {/* ── Desktop ── */}
        <div
          className="footer-desktop"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Brand */}
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.3rem',
                fontWeight: 700,
                color: 'var(--off-white)',
                marginBottom: '0.75rem',
              }}
            >
              {settings.store_name}
            </h3>
            <p style={{ fontSize: '0.82rem', lineHeight: 1.7, color: 'var(--off-white)' }}>
              Premium fashion, makeup &amp; lifestyle products delivered across Pakistan.
            </p>
            {socialLinks.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1em' }}>
                {socialLinks.map((social, i) => (
                  <SocialIcon key={i} platform={social.platform as SocialPlatform} url={social.url} size={36} />
                ))}
              </div>
            )}
          </div>

          {/* Categories */}
          <div>
            <p
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--off-white)',
                marginBottom: '1rem',
              }}
            >
              Categories
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--off-white)',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  // onMouseEnter={e => (e.currentTarget.style.color = TEXT_MAIN)}
                  // onMouseLeave={e => (e.currentTarget.style.color = TEXT_LINK)}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <p
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--off-white)',
                marginBottom: '1rem',
              }}
            >
              Customer Service
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'Track Order', href: '/track-order' },
                { label: 'Return & Exchange Policy', href: '/return-policy' },
              ].map(item => (
                <Link
                  key={item.label}
                  href={item.href}
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--off-white)',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  // onMouseEnter={e => (e.currentTarget.style.color = TEXT_MAIN)}
                  // onMouseLeave={e => (e.currentTarget.style.color = TEXT_LINK)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--off-white)',
                marginBottom: '1rem',
              }}
            >
              Contact
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { icon: '📞', text: settings.phone },
                { icon: '📧', text: settings.email },
                { icon: '📍', text: settings.address },
              ].map(({ icon, text }) => (
                <span
                  key={text}
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--off-white)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {icon} {text}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Mobile ── */}
        <div className="footer-mobile" style={{ marginBottom: '2.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--off-white)',
                marginBottom: '0.5rem',
              }}
            >
              {settings.store_name}
            </h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: 'var(--off-white)' }}>
              Premium fashion, makeup &amp; lifestyle products delivered across Pakistan.
            </p>
            {socialLinks.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75em' }}>
                {socialLinks.map((social, i) => (
                  <SocialIcon key={i} platform={social.platform as SocialPlatform} url={social.url} size={32} />
                ))}
              </div>
            )}
          </div>

          {/* Categories collapsible */}
          <div style={{ borderTop: `1px solid ${BORDER_CLR}`, paddingTop: '1rem', marginBottom: '1rem' }}>
            <button
              onClick={() => toggleSection('categories')}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: 'var(--off-white)',
                fontSize: '1rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '0.75rem 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              // onMouseEnter={e => (e.currentTarget.style.color = TEXT_MAIN)}
              // onMouseLeave={e => (e.currentTarget.style.color = TEXT_LABEL)}
            >
              Categories
              <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{expanded.categories ? '−' : '+'}</span>
            </button>
            {expanded.categories && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  paddingTop: '0.75rem',
                  animation: 'slideDown 0.3s ease',
                }}
              >
                {categories.map(cat => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--off-white)',
                      textDecoration: 'none',
                      paddingLeft: '0.5rem',
                      transition: 'color 0.2s',
                    }}
                    // onMouseEnter={e => (e.currentTarget.style.color = TEXT_MAIN)}
                    // onMouseLeave={e => (e.currentTarget.style.color = TEXT_LINK)}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Customer Service collapsible */}
          <div style={{ borderTop: `1px solid ${BORDER_CLR}`, paddingTop: '1rem', marginBottom: '1rem' }}>
            <button
              onClick={() => toggleSection('customerService')}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: 'var(--off-white)',
                fontSize: '1rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '0.75rem 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              // onMouseEnter={e => (e.currentTarget.style.color = TEXT_MAIN)}
              // onMouseLeave={e => (e.currentTarget.style.color = TEXT_LABEL)}
            >
              Customer Service
              <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{expanded.customerService ? '−' : '+'}</span>
            </button>
            {expanded.customerService && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  paddingTop: '0.75rem',
                  animation: 'slideDown 0.3s ease',
                }}
              >
                {[
                  { label: 'Track Order', href: '/track-order' },
                  { label: 'Return & Exchange Policy', href: '/return-policy' },
                ].map(item => (
                  <Link
                    key={item.label}
                    href={item.href}
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--off-white)',
                      textDecoration: 'none',
                      paddingLeft: '0.5rem',
                      transition: 'color 0.2s',
                    }}
                    // onMouseEnter={e => (e.currentTarget.style.color = TEXT_MAIN)}
                    // onMouseLeave={e => (e.currentTarget.style.color = TEXT_LINK)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Contact collapsible */}
          <div style={{ borderTop: `1px solid ${BORDER_CLR}`, paddingTop: '1rem', marginBottom: '1rem' }}>
            <button
              onClick={() => toggleSection('contact')}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: 'var(--off-white)',
                fontSize: '1rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '0.75rem 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              // onMouseEnter={e => (e.currentTarget.style.color = TEXT_MAIN)}
              // onMouseLeave={e => (e.currentTarget.style.color = TEXT_LABEL)}
            >
              Contact
              <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{expanded.contact ? '−' : '+'}</span>
            </button>
            {expanded.contact && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  paddingTop: '0.75rem',
                  animation: 'slideDown 0.3s ease',
                }}
              >
                {[
                  { icon: '📞', text: settings.phone },
                  { icon: '📧', text: settings.email },
                  { icon: '📍', text: settings.address },
                ].map(({ icon, text }) => (
                  <span
                    key={text}
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--off-white)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      paddingLeft: '0.5rem',
                    }}
                  >
                    {icon} {text}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div
          style={{
            borderTop: `1px solid ${BORDER_CLR}`,
            paddingTop: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
            fontSize: '0.8rem',
            color: 'var(--off-white)',
          }}
        >
          <p>
            © {new Date().getFullYear()} {settings.store_name}. All rights reserved.
          </p>
          <p>Cash on Delivery · Delivered Across Pakistan</p>
        </div>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .footer-desktop { display: grid !important; }
          .footer-mobile  { display: none  !important; }
        }
 
        @media (max-width: 768px) {
          .footer-desktop { display: none  !important; }
          .footer-mobile  { display: block !important; }
        }
 
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </footer>
  );
}

function EmptyState() {
  return (
    <section style={{ padding: '4rem 0', background: 'var(--off-white)' }}>
      <div className="container" style={{ textAlign: 'center' }}>
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
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--text-dark)',
            marginBottom: '0.75rem',
          }}
        >
          Products Coming Soon
        </h3>
        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          We're stocking up. Check back shortly!
        </p>
        <Link href="/products" className="btn-primary">
          Browse All
        </Link>
      </div>
    </section>
  );
}

function BrandsSection({ brands }: { brands: BrandItem[] }) {
  if (brands.length === 0) return null;
  return (
    <section style={{ padding: '2rem 0', background: 'var(--white)', borderTop: '1px solid var(--border)' }}>
      <div className="container" style={{ padding: '0' }}>
        <SectionHeader label="Trusted Names" title="Our Brands" />

        {/* Desktop */}
        <div
          className="brands-desktop"
          style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', alignItems: 'center' }}
        >
          {brands.map(brand => (
            <Link key={brand.id} href={`/products?category=brands&subcategory=${brand.slug}`}>
              <BrandCard key={brand.id} brand={brand} mobile={false} />
            </Link>
          ))}
        </div>

        {/* Mobile horizontal scroll */}
        <div
          className="brands-mobile"
          style={{
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch' as any,
            scrollSnapType: 'x mandatory',
            paddingBottom: '0.5rem',
          }}
        >
          <div
            style={{
              display: 'grid',
              // gridTemplateColumns: 'repeat(3, 110px)',
              gridTemplateRows: 'repeat(3, 90px)',
              gap: '4px',
              gridAutoColumns: '90px',
              gridAutoFlow: 'column',
              width: 'max-content',
              // padding: '0 1rem',
            }}
          >
            {brands.map(brand => (
              <div key={brand.id} style={{ scrollSnapAlign: 'start' }}>
                <Link href={`/products?category=brands&subcategory=${brand.slug}`}>
                  <BrandCard brand={brand} mobile />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .brands-desktop { display: flex !important; }
          .brands-mobile { display: none !important; }
        }
        @media (max-width: 768px) {
          .brands-desktop { display: none !important; }
          .brands-mobile { display: flex !important; }
          .brands-mobile::-webkit-scrollbar { display: none; }
          .brands-mobile { -ms-overflow-style: none; scrollbar-width: none; }
        }
      `}</style>
    </section>
  );
}

function BrandCard({ brand, mobile }: { brand: BrandItem; mobile: boolean }) {
  return (
    <div
      style={{
        width: mobile ? '100%' : '150px', // ← fills the grid cell on mobile
        height: mobile ? '100%' : '90px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.5rem',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        background: 'var(--white)',
        textAlign: 'center',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      {brand.image_url ? (
        <img src={brand.image_url} alt={brand.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
      ) : (
        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dark)', textAlign: 'center' }}>{brand.name}</p>
      )}
    </div>
  );
}

function DealsSection({ deals }: { deals: Deal[] }) {
  if (deals.length === 0) return null;
  return (
    <section style={{ padding: '3.5rem 0', background: 'var(--off-white)' }}>
      <div className="container">
        <SectionHeader label="Limited Time" title="Bundle Deals" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {deals.map(deal => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </div>
    </section>
  );
}

function DealCard({ deal }: { deal: Deal }) {
  const { addItem } = useCart(); // whatever your cart hook is
  const router = useRouter();

  const handleShopDeal = () => {
    const products = deal.deal_products.map(dp => dp.product);
    products.forEach(product => {
      const image = product.images?.find(img => img.is_primary)?.image_url ?? null;
      addItem({
        product_id: product.id,
        name: product.name,
        slug: product.slug,
        image_url: image,
        unit_price: deal.deal_price / products.length, // split deal price equally
        original_price: product.price,
        discount_percent: product.discount_percent,
        quantity: 1,
      });
    });
    router.push('/cart');
  };

  const products = deal.deal_products?.map(dp => dp.product).filter(Boolean) ?? [];
  const originalTotal = products.reduce((sum, p) => sum + (p.price ?? 0), 0);
  const savings = originalTotal - deal.deal_price;

  return (
    <div
      style={{
        background: 'var(--white)',
        border: '2px solid var(--blush)',
        borderRadius: '10px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Deal badge */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'var(--blush-deep)',
          color: 'white',
          fontSize: '0.72rem',
          fontWeight: 700,
          padding: '4px 10px',
          borderRadius: '20px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          zIndex: 1,
        }}
      >
        Bundle Deal
      </div>

      <div style={{ padding: '1.5rem' }}>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.2rem',
            fontWeight: 700,
            color: 'var(--text-dark)',
            marginBottom: '1.25rem',
          }}
        >
          {deal.title}
        </h3>

        {/* Products side by side */}
        {/* Products side by side */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'stretch',
            marginBottom: '1.5rem',
          }}
        >
          {products.map((product, i) => {
            const image = product.images?.find((img: any) => img.is_primary)?.image_url ?? null;
            return (
              <div key={product.id} style={{ display: 'contents' }}>
                <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none', flex: '1', minWidth: 0 }}>
                  <div
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      height: '100%',
                      transition: 'box-shadow 0.2s',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.boxShadow = 'none')}
                  >
                    <div style={{ aspectRatio: '1', background: 'var(--blush-light)', overflow: 'hidden' }}>
                      {image ? (
                        <img src={image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <span style={{ fontSize: '2rem' }}>🛍️</span>
                        </div>
                      )}
                    </div>
                    {/* Name + price hidden on mobile, shown on desktop */}
                    <div className="deal-product-info" style={{ padding: '0.75rem' }}>
                      <p
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: 'var(--text-dark)',
                          marginBottom: '0.3rem',
                          lineHeight: 1.3,
                        }}
                      >
                        {product.name}
                      </p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                        PKR {product.price?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>

                {i < products.length - 1 && (
                  <div
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: '28px' }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'var(--blush-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        color: 'var(--blush-deep)',
                        fontWeight: 700,
                      }}
                    >
                      +
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pricing row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            padding: '1rem',
            background: 'var(--blush-light)',
            borderRadius: '8px',
          }}
        >
          <div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-mid)', marginBottom: '0.2rem' }}>
              Original: <span style={{ textDecoration: 'line-through' }}>PKR {originalTotal.toLocaleString()}</span>
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: 'var(--blush-deep)',
                }}
              >
                PKR {deal.deal_price.toLocaleString()}
              </span>
              {savings > 0 && (
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981' }}>
                  Save PKR {savings.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleShopDeal}
            className="btn-primary"
            style={{
              minWidth: '140px',
              justifyContent: 'center',
              textAlign: 'center',
              animation: 'buyNowBounce 1.8s ease-in-out infinite',
              boxShadow: '0 4px 15px rgba(194, 24, 91, 0.35)',
              background: 'linear-gradient(135deg, var(--blush-deep) 0%, #c2185b 100%)',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.animationPlayState = 'paused';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.animationPlayState = 'running';
              (e.currentTarget as HTMLButtonElement).style.transform = '';
            }}
          >
            Shop This Deal
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [onSale, setOnSale] = useState<Product[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [catRes, prodRes, saleRes, dealsRes, brandsRes] = await Promise.all([
          fetch('/api/categories').then(r => r.json()),
          fetch('/api/products?limit=20&sort=newest').then(r => r.json()),
          fetch('/api/products?limit=4&discount=true').then(r => r.json()),
          fetch('/api/deals').then(r => r.json()),
          fetch('/api/subcategories?category=brands').then(r => r.json()),
        ]);

        if (catRes.success) setCategories(catRes.data);
        if (prodRes.success) setNewArrivals(prodRes.data.data);
        if (saleRes.success) setOnSale(saleRes.data.data);
        if (dealsRes.success) setDeals(dealsRes.data);
        if (brandsRes.success) setBrands(brandsRes.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <BannerSlider />
      <CategoryLinks categories={categories} />

      {!loading &&
        (newArrivals.length > 0 ? (
          <ProductsGrid label="Just In" title="New Arrivals" products={newArrivals} />
        ) : (
          <EmptyState />
        ))}

      {onSale.length > 0 && (
        <ProductsGrid
          label="Special Offers"
          title="On Sale"
          products={onSale}
          bg="var(--off-white)"
          viewAllHref="/products?discount=true"
        />
      )}
      {deals.length > 0 && <DealsSection deals={deals} />}
      {brands.length > 0 && <BrandsSection brands={brands} />}
      <StatsSection />
      <FeaturesStrip />
      <AboutSection />
      <Footer categories={categories} />
    </div>
  );
}
