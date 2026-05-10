'use client';

import { SocialIcon, SocialPlatform } from '@/components/SocialIcons';
import { useSettings } from '@/lib/use-settings';
import { calcFinalPrice, formatPKR } from '@/lib/utils';
import type { Banner, BrandItem, Category, Deal, Product } from '@/types';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

function ProductCard({ product }: { product: Product }) {
  const finalPrice = calcFinalPrice(product.price, product.discount_percent);
  const image = product.images?.find(i => i.is_primary)?.image_url ?? null;
  const hasDiscount = product.discount_percent > 0;

  return (
    <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div
        style={{
          background: 'var(--white)',
          border: '1px solid var(--border)',
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
                background: 'var(--blush-deep)',
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
          <p
            style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-light)',
              marginBottom: '0.3rem',
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
            }}
          >
            {product.name}
          </p>

          {/* Stars + review count */}
          {(product.review_count ?? 0) > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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

  useEffect(() => {
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

  if (loading)
    return (
      <div
        style={{
          width: '100%',
          height: 'clamp(300px, 50vh, 520px)',
          background: 'var(--off-white)',
          animation: 'pulse 1.5s ease infinite',
        }}
      />
    );

  if (banners.length === 0)
    return (
      <div
        style={{
          width: '100%',
          height: 'clamp(300px, 50vh, 520px)',
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
    );

  const banner = banners[current];

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(300px, 50vh, 520px)',
        overflow: 'hidden',
        background: 'var(--off-white)',
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
            padding: '0 2rem',
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
              left: '1.5rem',
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
              right: '1.5rem',
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
                width: 'calc(100vw - 2rem)',
                maxWidth: '280px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: 'var(--off-white)',
                borderRadius: '6px',
                scrollSnapAlign: 'start',
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
    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
      <p
        style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--blush-deep)',
          marginBottom: '0.6rem',
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
    <section style={{ padding: '3.5rem 0', background: 'var(--off-white)' }}>
      <div className="container">
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
                    width: 'calc(100vw - 2rem)',
                    maxWidth: '150px',
                    padding: '1rem',
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
                      width: '100px',
                      height: '100px',
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
}: {
  label: string;
  title: string;
  products: Product[];
  bg?: string;
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
          <Link href="/products" className="btn-outline">
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
  const stats = [
    { value: '5,000+', label: 'Happy Customers' },
    { value: '500+', label: 'Products Available' },
    { value: '100%', label: 'Original Products' },
  ];

  return (
    <section style={{ padding: '3rem 0', background: 'var(--blush-light)' }}>
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem',
            textAlign: 'center',
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
                  color: 'var(--blush-deep)',
                  lineHeight: 1,
                  marginBottom: '0.4rem',
                }}
              >
                {stat.value}
              </p>
              <p
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
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
  return (
    <section style={{ padding: '4rem 0', background: 'var(--white)' }}>
      <div className="container">
        <div
          style={{
            maxWidth: '680px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--blush-deep)',
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
          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--text-mid)',
              lineHeight: 1.8,
              marginBottom: '1rem',
            }}
          >
            We are a Pakistani fashion and beauty store dedicated to bringing you the finest collection of garments, makeup,
            skincare, and lifestyle products. Every product we carry is carefully selected for quality and authenticity.
          </p>
          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--text-mid)',
              lineHeight: 1.8,
              marginBottom: '2rem',
            }}
          >
            From everyday essentials to special occasion outfits, we have something for everyone in the family. Shop with
            confidence — all products are 100% original and delivered right to your door across Pakistan.
          </p>
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

  // Mobile collapsible state
  const [expanded, setExpanded] = useState({
    categories: false,
    customerService: false,
    contact: false,
  });

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <footer
      style={{
        background: 'var(--text-dark)',
        color: 'rgba(255,255,255,0.7)',
        padding: '3rem 0 1.5rem',
      }}
    >
      <div className="container">
        {/* Desktop layout */}
        <div
          className="footer-desktop"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginBottom: '2.5rem',
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.3rem',
                fontWeight: 700,
                color: 'white',
                marginBottom: '0.75rem',
              }}
            >
              {settings.store_name}
            </h3>
            <p style={{ fontSize: '0.82rem', lineHeight: 1.7 }}>
              Premium fashion, makeup &amp; lifestyle products delivered across Pakistan.
            </p>

            {/* Social icons */}
            {socialLinks.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1em' }}>
                {socialLinks.map((social, i) => (
                  <SocialIcon key={i} platform={social.platform as SocialPlatform} url={social.url} size={36} light />
                ))}
              </div>
            )}
          </div>

          <div>
            <p
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--blush)',
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
                    color: 'rgba(255,255,255,0.6)',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--blush)',
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
                    color: 'rgba(255,255,255,0.6)',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--blush)',
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
                    color: 'rgba(255,255,255,0.6)',
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

        {/* Mobile layout with collapsible sections */}
        <div className="footer-mobile" style={{ marginBottom: '2.5rem' }}>
          {/* Store info */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'white',
                marginBottom: '0.5rem',
              }}
            >
              {settings.store_name}
            </h3>
            <p style={{ fontSize: '0.75rem', lineHeight: 1.6 }}>
              Premium fashion, makeup &amp; lifestyle products delivered across Pakistan.
            </p>

            {/* Social icons */}
            {socialLinks.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75em' }}>
                {socialLinks.map((social, i) => (
                  <SocialIcon key={i} platform={social.platform as SocialPlatform} url={social.url} size={32} light />
                ))}
              </div>
            )}
          </div>

          {/* Categories collapsible */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginBottom: '1rem' }}>
            <button
              onClick={() => toggleSection('categories')}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: 'var(--blush)',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '0.75rem 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'white')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--blush)')}
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
                      fontSize: '0.78rem',
                      color: 'rgba(255,255,255,0.6)',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                      paddingLeft: '0.5rem',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Customer Service collapsible */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginBottom: '1rem' }}>
            <button
              onClick={() => toggleSection('customerService')}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: 'var(--blush)',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '0.75rem 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'white')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--blush)')}
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
                      fontSize: '0.78rem',
                      color: 'rgba(255,255,255,0.6)',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                      paddingLeft: '0.5rem',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Contact collapsible */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginBottom: '1rem' }}>
            <button
              onClick={() => toggleSection('contact')}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: 'var(--blush)',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '0.75rem 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'white')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--blush)')}
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
                      fontSize: '0.8rem',
                      color: 'rgba(255,255,255,0.6)',
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

        {/* Footer bottom */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
            fontSize: '0.75rem',
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
          .footer-mobile { display: none !important; }
        }

        @media (max-width: 768px) {
          .footer-desktop { display: none !important; }
          .footer-mobile { display: block !important; }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
    <section style={{ padding: '3rem 0', background: 'var(--white)', borderTop: '1px solid var(--border)' }}>
      <div className="container">
        <SectionHeader label="Trusted Names" title="Our Brands" />

        {/* Desktop */}
        <div
          className="brands-desktop"
          style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', alignItems: 'center' }}
        >
          {brands.map(brand => (
            <BrandCard key={brand.id} brand={brand} />
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
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'nowrap', width: 'max-content', padding: '0 1rem' }}>
            {brands.map(brand => (
              <div key={brand.id} style={{ scrollSnapAlign: 'start', flexShrink: 0 }}>
                <BrandCard brand={brand} />
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

function BrandCard({ brand }: { brand: BrandItem }) {
  return (
    <div
      style={{
        width: '140px',
        height: '80px',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        background: 'var(--white)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--blush-deep)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
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
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'stretch',
            marginBottom: '1.5rem',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch' as any,
            paddingBottom: '0.25rem',
          }}
        >
          {products.map((product, i) => {
            const image = product.images?.find((img: any) => img.is_primary)?.image_url ?? null;
            return (
              <div key={product.id} style={{ display: 'contents' }}>
                <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none', flex: '1', minWidth: '140px' }}>
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
                    <div style={{ height: '140px', background: 'var(--blush-light)', overflow: 'hidden' }}>
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
                    <div style={{ padding: '0.75rem' }}>
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

                {/* Plus sign between products */}
                {i < products.length - 1 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      width: '32px',
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'var(--blush-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        color: 'var(--blush-deep)',
                        fontWeight: 700,
                        flexShrink: 0,
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
          <Link
            href="/products"
            className="btn-primary"
            style={{ minWidth: '140px', justifyContent: 'center', textAlign: 'center' }}
          >
            Shop This Deal
          </Link>
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
      <FeaturesStrip />
      <CategoryLinks categories={categories} />

      {!loading &&
        (newArrivals.length > 0 ? (
          <ProductsGrid label="Just In" title="New Arrivals" products={newArrivals} />
        ) : (
          <EmptyState />
        ))}

      {onSale.length > 0 && <ProductsGrid label="Special Offers" title="On Sale" products={onSale} bg="var(--off-white)" />}
      {deals.length > 0 && <DealsSection deals={deals} />}
      {brands.length > 0 && <BrandsSection brands={brands} />}
      <StatsSection />
      <AboutSection />
      <Footer categories={categories} />
    </div>
  );
}
