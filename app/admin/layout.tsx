'use client';

import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: '▦' },
  { label: 'Orders', href: '/admin/orders', icon: '📦' },
  { label: 'Products', href: '/admin/products', icon: '🛍' },
  { label: 'Categories', href: '/admin/categories', icon: '🗂' },
  { label: 'Banners', href: '/admin/banners', icon: '🖼' },
  { label: 'Brands', href: '/admin/brands', icon: '🏷️' },
  { label: 'Deals', href: '/admin/deals', icon: '🎁' },
  { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
  { label: 'Reviews', href: '/admin/reviews', icon: '⭐' },
];

function createSupabase() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const supabase = createSupabase();

    // Check session on mount
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace('/admin/login');
      } else {
        setUserEmail(user.email ?? '');
        setChecking(false);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.replace('/admin/login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createSupabase();
    await supabase.auth.signOut();
    router.replace('/admin/login');
  };

  // Show nothing while checking auth
  if (checking) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8f9fa',
        }}
      >
        <p style={{ color: '#999', fontSize: '0.85rem' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '240px',
          flexShrink: 0,
          background: 'var(--text-dark)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
          transition: 'transform 0.3s ease',
        }}
        className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}
      >
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Link href="/" target="_blank" style={{ textDecoration: 'none' }}>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--blush-light)',
              }}
            >
              A&S Branded Collection
            </h1>
          </Link>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>Admin Panel</p>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {NAV_ITEMS.map(item => {
            const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1.5rem',
                  textDecoration: 'none',
                  background: active ? 'rgba(232,196,184,0.12)' : 'transparent',
                  borderLeft: active ? '3px solid var(--blush)' : '3px solid transparent',
                  transition: 'all 0.15s',
                  color: active ? 'var(--blush-light)' : 'var(--text-light)',
                  fontSize: '0.85rem',
                  fontWeight: active ? 600 : 400,
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-light)',
              marginBottom: '0.75rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {userEmail}
          </p>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.6rem',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'var(--text-light)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.75rem',
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-light)';
            }}
          >
            Sign Out
          </button>
          <Link
            href="/"
            target="_blank"
            style={{
              display: 'block',
              textAlign: 'center',
              marginTop: '0.5rem',
              fontSize: '0.7rem',
              color: 'var(--text-light)',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--blush-light)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-light)')}
          >
            ↗ View Store
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 49,
          }}
        />
      )}

      {/* Main content */}
      <div style={{ flex: 1, marginLeft: '240px', display: 'flex', flexDirection: 'column' }} className="admin-main">
        <div
          style={{
            height: '60px',
            flexShrink: 0,
            background: 'var(--white)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 1.5rem',
            gap: '1rem',
          }}
        >
          <button
            onClick={() => setSidebarOpen(p => !p)}
            className="mobile-sidebar-btn"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-mid)',
              display: 'none',
              padding: '4px',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-dark)',
            }}
          >
            {NAV_ITEMS.find(item => (item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)))
              ?.label ?? 'Admin'}
          </p>
        </div>

        <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>{children}</main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar { transform: translateX(-100%); }
          .admin-sidebar.open { transform: translateX(0); }
          .admin-main { margin-left: 0 !important; }
          .mobile-sidebar-btn { display: block !important; }
        }
      `}</style>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/admin/login') return <>{children}</>;
  return <AdminShell>{children}</AdminShell>;
}
