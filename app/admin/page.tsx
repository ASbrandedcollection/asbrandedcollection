'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  totalCategories: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [ordersRes, productsRes, categoriesRes] = await Promise.all([
          fetch('/api/admin/orders?limit=5'),
          fetch('/api/admin/products?limit=1'),
          fetch('/api/admin/categories'),
        ]);

        const [ordersData, productsData, categoriesData] = await Promise.all([
          ordersRes.json(),
          productsRes.json(),
          categoriesRes.json(),
        ]);

        if (ordersData.success) {
          const orders = ordersData.data.data;
          setRecentOrders(orders);
          setStats(prev => ({
            ...prev,
            totalOrders: ordersData.data.total,
            pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
            totalRevenue: orders.reduce((sum: number, o: any) => sum + o.total_amount, 0),
          }));
        }

        if (productsData.success) {
          setStats(prev => ({ ...prev, totalProducts: productsData.data.total }));
        }

        if (categoriesData.success) {
          setStats(prev => ({ ...prev, totalCategories: categoriesData.data.length }));
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCards = [
    { label: 'Total Orders', value: stats.totalOrders, icon: '📦', href: '/admin/orders', color: '#e8f4fd' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: '⏳', href: '/admin/orders', color: '#fef9e7' },
    { label: 'Total Products', value: stats.totalProducts, icon: '🛍', href: '/admin/products', color: '#f0fdf4' },
    { label: 'Categories', value: stats.totalCategories, icon: '🗂', href: '/admin/categories', color: '#fdf4ff' },
  ];

  const STATUS_COLORS: Record<string, string> = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    ready_to_ship: '#a855f7',
    shipped: '#8b5cf6',
    delivered: '#10b981',
    cancelled: '#ef4444',
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.6rem',
            fontStyle: 'italic',
            color: 'var(--text-dark)',
            marginBottom: '0.25rem',
          }}
        >
          Welcome back 👋
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Here's what's happening in your store today.</p>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {statCards.map(card => (
          <Link key={card.label} href={card.href} style={{ textDecoration: 'none' }}>
            <div
              style={{
                background: 'var(--white)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '1.25rem',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: card.color,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  marginBottom: '0.75rem',
                }}
              >
                {card.icon}
              </div>
              <p
                style={{
                  fontSize: '1.6rem',
                  fontWeight: 600,
                  color: 'var(--text-dark)',
                  lineHeight: 1,
                  marginBottom: '0.25rem',
                }}
              >
                {loading ? '—' : card.value}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '2rem',
        }}
        className="dashboard-grid"
      >
        {/* Recent orders */}
        <div
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
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                fontStyle: 'italic',
                color: 'var(--text-dark)',
              }}
            >
              Recent Orders
            </h3>
            <Link
              href="/admin/orders"
              style={{
                fontSize: '0.72rem',
                color: 'var(--blush-deep)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              View all →
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Loading...</p>
            </div>
          ) : recentOrders.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>No orders yet</p>
            </div>
          ) : (
            <div>
              {recentOrders.map((order, i) => (
                <div
                  key={order.id}
                  style={{
                    padding: '0.85rem 1.25rem',
                    borderBottom: i < recentOrders.length - 1 ? '1px solid var(--border)' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        color: 'var(--text-dark)',
                        marginBottom: '0.15rem',
                      }}
                    >
                      {order.first_name} {order.last_name}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>
                      {new Date(order.created_at).toLocaleDateString('en-PK')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <span
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        color: 'var(--text-dark)',
                      }}
                    >
                      PKR {order.total_amount.toLocaleString()}
                    </span>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 500,
                        padding: '2px 8px',
                        borderRadius: '20px',
                        background: STATUS_COLORS[order.status] + '20',
                        color: STATUS_COLORS[order.status],
                        textTransform: 'capitalize',
                      }}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div
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
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                fontStyle: 'italic',
                color: 'var(--text-dark)',
              }}
            >
              Quick Actions
            </h3>
          </div>
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { label: 'Add New Product', href: '/admin/products', icon: '➕', desc: 'Add product to your store' },
              { label: 'Manage Orders', href: '/admin/orders', icon: '📋', desc: 'View and update orders' },
              { label: 'Add Category', href: '/admin/categories', icon: '🗂', desc: 'Add new product category' },
              { label: 'Upload Banner', href: '/admin/banners', icon: '🖼', desc: 'Manage homepage banners' },
            ].map(action => (
              <Link key={action.href} href={action.href} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    transition: 'all 0.15s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--blush-deep)';
                    (e.currentTarget as HTMLDivElement).style.background = 'var(--blush-light)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{action.icon}</span>
                  <div>
                    <p style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-dark)' }}>{action.label}</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>{action.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
