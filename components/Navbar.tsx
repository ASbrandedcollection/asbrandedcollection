'use client';

import { useCart } from '@/lib/cart-context';
import { useSettings } from '@/lib/use-settings';
import type { Category, Subcategory } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const PLACEHOLDER_COLORS = ['#fde8e8', '#fde8f5', '#e8eafd', '#e8fdf0', '#fdf5e8', '#e8f8fd', '#f5fde8', '#fde8ec'];

function SubcategoryCard({ sub, catSlug, index }: { sub: Subcategory; catSlug: string; index: number }) {
  const bg = PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length];

  return (
    <Link
      href={`/products?category=${catSlug}&subcategory=${sub.slug}`}
      style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '8px',
          background: sub.image_url ? 'transparent' : bg,
          overflow: 'hidden',
          border: '1px solid var(--border)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
        }}
      >
        {sub.image_url ? (
          <img src={sub.image_url} alt={sub.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: '1.6rem' }}>{sub.name.charAt(0)}</span>
        )}
      </div>
      <span
        style={{
          fontSize: '0.68rem',
          fontWeight: 600,
          color: 'var(--text-dark)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          textAlign: 'center',
          lineHeight: 1.3,
          maxWidth: '80px',
        }}
      >
        {sub.name}
      </span>
    </Link>
  );
}

function TopBar() {
  const { settings } = useSettings();

  return (
    <div
      style={{
        background: 'var(--text-dark)',
        padding: '0 2.5rem',
        fontSize: '0.72rem',
        color: 'rgba(255,255,255,0.85)',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Desktop — single row */}
      <div
        className="topbar-desktop"
        style={{
          height: 'var(--topbar-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.64a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span>{settings.phone}</span>
        </div>
        <span style={{ fontWeight: 500, letterSpacing: '0.04em', textAlign: 'center', flex: 1, padding: '0 1rem' }}>
          {settings.tagline}
        </span>
        <span style={{ flexShrink: 0 }}>
          Free delivery on orders above PKR {parseInt(settings.free_delivery_threshold || '3000').toLocaleString()}
        </span>
      </div>

      {/* Mobile — stacked, show only most important info */}
      <div className="topbar-mobile" style={{ display: 'none', padding: '0.5rem 0', textAlign: 'center' }}>
        <p style={{ fontWeight: 500, letterSpacing: '0.03em', marginBottom: '0.2rem' }}>{settings.tagline}</p>
        <p style={{ opacity: 0.75 }}>
          Free delivery above PKR {parseInt(settings.free_delivery_threshold || '3000').toLocaleString()}
        </p>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .topbar-desktop { display: none !important; }
          .topbar-mobile  { display: block !important; }
        }
      `}</style>
    </div>
  );
}

function MobileMenu({ categories, onClose }: { categories: Category[]; onClose: () => void }) {
  const [activeCat, setActiveCat] = useState<Category | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (activeCat) {
    const grouped = groupSubcategories(activeCat.subcategories ?? []);

    return (
      <div
        style={{
          position: 'fixed',
          top: 'calc(var(--topbar-height) + var(--nav-height))',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99,
          backgroundColor: 'var(--white)',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.5rem',
            borderBottom: '2px solid var(--border)',
            background: 'var(--off-white)',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <button
            onClick={() => setActiveCat(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--blush-deep)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.82rem',
              fontWeight: 600,
              padding: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back
          </button>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-dark)',
            }}
          >
            {activeCat.icon} {activeCat.name}
          </span>
        </div>

        {/* View all */}
        <Link
          href={`/category/${activeCat.slug}`}
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            textDecoration: 'none',
            background: 'var(--blush-light)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--blush-deep)',
            }}
          >
            View All {activeCat.name}
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--blush-deep)" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>

        {/* Grouped subcategories */}
        {Object.entries(grouped).map(([groupName, subs]) => (
          <div key={groupName}>
            {groupName !== '__ungrouped__' && (
              <p
                style={{
                  padding: '0.85rem 1.5rem 0.5rem',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--text-light)',
                  background: 'var(--off-white)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                {groupName}
              </p>
            )}
            {/* Image grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--border)',
              }}
            >
              {subs.map((sub, i) => (
                <div key={sub.id} onClick={onClose}>
                  <SubcategoryCard sub={sub} catSlug={activeCat.slug} index={i} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 'calc(var(--topbar-height) + var(--nav-height))',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99,
        backgroundColor: 'var(--white)',
        overflowY: 'auto',
      }}
    >
      {[
        { label: 'Home', href: '/' },
        { label: 'All Products', href: '/products' },
      ].map(item => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClose}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--text-dark)',
            textDecoration: 'none',
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {item.label}
        </Link>
      ))}

      <p
        style={{
          fontSize: '0.68rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--text-light)',
          padding: '1rem 1.5rem 0.5rem',
          background: 'var(--off-white)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        Categories
      </p>

      {categories.map((cat, i) => {
        const hasSubs = (cat.subcategories?.length ?? 0) > 0;
        return hasSubs ? (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat)}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid var(--border)',
              fontFamily: 'var(--font-body)',
              animation: `fadeUp 0.3s ease ${i * 0.04}s both`,
            }}
          >
            <span
              style={{
                fontSize: '0.88rem',
                fontWeight: 500,
                color: 'var(--text-dark)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        ) : (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid var(--border)',
              textDecoration: 'none',
              animation: `fadeUp 0.3s ease ${i * 0.04}s both`,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.88rem',
                fontWeight: 500,
                color: 'var(--text-dark)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function groupSubcategories(subcategories: Subcategory[]): Record<string, Subcategory[]> {
  const grouped: Record<string, Subcategory[]> = {};
  for (const sub of subcategories) {
    const key = sub.group_name ?? '__ungrouped__';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(sub);
  }
  return grouped;
}

function MegaMenu({ cat, onClose }: { cat: Category; onClose: () => void }) {
  const grouped = groupSubcategories(cat.subcategories ?? []);
  const hasGroups = Object.keys(grouped).some(k => k !== '__ungrouped__');

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 'calc(var(--topbar-height) + var(--nav-height))',
        left: 0,
        right: 0,
        zIndex: 198,
        background: 'rgba(0,0,0,0.3)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--white)',
          borderBottom: '1px solid var(--border)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          padding: '2rem',
          maxHeight: '70vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--text-dark)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {cat.icon} {cat.name}
            </h3>
            <Link
              href={`/category/${cat.slug}`}
              onClick={onClose}
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--blush-deep)',
                textDecoration: 'none',
              }}
            >
              View All {cat.name} →
            </Link>
          </div>

          {/* Grouped subcategories with image cards */}
          {Object.entries(grouped).map(([groupName, subs]) => (
            <div key={groupName} style={{ marginBottom: '1.5rem' }}>
              {groupName !== '__ungrouped__' && (
                <p
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--text-light)',
                    marginBottom: '1rem',
                    paddingBottom: '0.4rem',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  {groupName}
                </p>
              )}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                }}
              >
                {subs.map((sub, i) => (
                  <SubcategoryCard key={sub.id} sub={sub} catSlug={cat.slug} index={i} />
                ))}
              </div>
            </div>
          ))}

          {/* Empty state */}
          {(cat.subcategories?.length ?? 0) === 0 && (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>No subcategories yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMegaCat, setActiveMegaCat] = useState<Category | null>(null);
  const [mounted, setMounted] = useState(false);
  const { itemCount } = useCart();
  const pathname = usePathname();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(res => {
        if (res.success) setCategories(res.data);
      });
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setActiveMegaCat(null);
  }, [pathname]);

  if (!mounted) {
    return <div style={{ height: 'calc(var(--topbar-height) + var(--nav-height))' }} />;
  }

  if (pathname.startsWith('/admin')) return null;

  function openCat(cat: Category) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveMegaCat(cat);
  }

  function startClose() {
    closeTimer.current = setTimeout(() => setActiveMegaCat(null), 400);
  }

  function keepOpen() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  const linkStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: 'var(--font-body)',
    fontSize: '0.82rem',
    fontWeight: 600,
    letterSpacing: '0.02em',
    color: active ? 'var(--blush-deep)' : 'var(--text-dark)',
    textDecoration: 'none',
    paddingBottom: '4px',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: active ? '2px solid var(--blush-deep)' : '2px solid transparent',
    transition: 'color 0.2s, border-color 0.2s',
    whiteSpace: 'nowrap' as const,
    background: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  });

  return (
    <>
      <TopBar />

      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: 'var(--nav-height)',
          backgroundColor: 'var(--white)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 2.5rem',
          gap: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <Link href="/" style={{ textDecoration: 'none', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <Image
            src="/logoNew.png"
            alt="Store Logo"
            height={52}
            width={120}
            style={{ objectFit: 'contain', width: 'auto', height: '48px' }}
            priority
          />
        </Link>

        {/* Desktop nav */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
            flex: 1,
          }}
          className="desktop-nav"
        >
          <Link
            href="/"
            style={linkStyle(pathname === '/')}
            onMouseEnter={e => {
              if (pathname !== '/') e.currentTarget.style.color = 'var(--blush-deep)';
              startClose();
            }}
            onMouseLeave={e => {
              if (pathname !== '/') e.currentTarget.style.color = 'var(--text-dark)';
            }}
          >
            Home
          </Link>

          {/* Category buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {categories.slice(0, 4).map(cat => {
              const active = pathname === `/category/${cat.slug}` || activeMegaCat?.id === cat.id;
              return (
                <button
                  key={cat.id}
                  onMouseEnter={() => openCat(cat)}
                  onMouseLeave={startClose}
                  style={{
                    ...linkStyle(active),
                    color: active ? 'var(--blush-deep)' : 'var(--text-dark)',
                    borderBottom: active ? '2px solid var(--blush-deep)' : '2px solid transparent',
                  }}
                  onFocus={() => openCat(cat)}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          <Link
            href="/products"
            style={linkStyle(pathname === '/products')}
            onMouseEnter={e => {
              if (pathname !== '/products') e.currentTarget.style.color = 'var(--blush-deep)';
              startClose();
            }}
            onMouseLeave={e => {
              if (pathname !== '/products') e.currentTarget.style.color = 'var(--text-dark)';
            }}
          >
            All
          </Link>
        </div>

        {/* Right icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
          <Link
            href="/products"
            title="Search"
            style={{
              color: 'var(--text-mid)',
              textDecoration: 'none',
              lineHeight: 1,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--blush-deep)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-mid)')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </Link>

          <Link
            href="/cart"
            title="Cart"
            style={{
              position: 'relative',
              color: 'var(--text-mid)',
              textDecoration: 'none',
              lineHeight: 1,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--blush-deep)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-mid)')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {itemCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: 'var(--blush-deep)',
                  color: 'var(--white)',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  width: '17px',
                  height: '17px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setMenuOpen(p => !p)}
            className="mobile-menu-btn"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: 'var(--text-dark)',
              display: 'none',
            }}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Desktop mega menu */}
      {activeMegaCat && (
        <div onMouseEnter={keepOpen} onMouseLeave={startClose}>
          <MegaMenu cat={activeMegaCat} onClose={() => setActiveMegaCat(null)} />
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && <MobileMenu categories={categories} onClose={() => setMenuOpen(false)} />}

      <style>{`
        @media (max-width: 860px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </>
  );
}
