'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { formatPKR } from '@/lib/utils';

type OrderItem = {
  product_name: string;
  product_image_url: string | null;
  unit_price: number;
  quantity: number;
};

type Order = {
  order_number: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  notes: string | null;
  total_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  order_items: OrderItem[];
};

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order_number');
  const orderId = searchParams.get('order_id');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    fetch(`/api/orders/${orderId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setOrder(data.data);
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  function handleCopy() {
    if (!orderNumber) return;
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!orderNumber) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.6rem',
              color: 'var(--text-dark)',
              marginBottom: '1rem',
            }}
          >
            No order found
          </h2>
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const shipping = order ? (order.total_amount >= 3000 ? 0 : 200) : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '680px', margin: '0 auto', animation: 'fadeUp 0.5s ease' }}>
        {/* ── Success header card ── */}
        <div
          style={{
            background: 'var(--white)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            marginBottom: '1rem',
          }}
        >
          {/* Checkmark */}
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#f0fdf4',
              border: '2px solid #86efac',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16a34a"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              color: 'var(--text-dark)',
              marginBottom: '0.25rem',
            }}
          >
            Order Placed!
          </h1>
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--blush-deep)', marginBottom: '0.75rem' }}>
            Order #{orderNumber}
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Thank you for your order. We've received it and will call you shortly to confirm your delivery.
          </p>

          {/* Copy order number */}
          <div
            style={{
              background: 'var(--off-white)',
              border: '2px solid var(--blush-deep)',
              borderRadius: '8px',
              padding: '1rem 1.25rem',
              marginBottom: '0.75rem',
            }}
          >
            <p
              style={{
                fontSize: '0.68rem',
                color: 'var(--text-light)',
                marginBottom: '0.5rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              🔖 Save Your Order Number — Needed for Tracking
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <p
                style={{
                  fontSize: '0.78rem',
                  fontFamily: 'monospace',
                  color: 'var(--text-dark)',
                  fontWeight: 600,
                  wordBreak: 'break-all',
                  flex: 1,
                  textAlign: 'left',
                }}
              >
                {orderNumber}
              </p>
              <button
                onClick={handleCopy}
                style={{
                  padding: '0.5rem 1rem',
                  background: copied ? '#16a34a' : 'var(--text-dark)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                  flexShrink: 0,
                  transition: 'background 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                {copied ? '✓ Copied!' : 'Copy ID'}
              </button>
            </div>
          </div>

          {/* Screenshot reminder */}
          <div
            style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '6px',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'flex-start',
              textAlign: 'left',
            }}
          >
            <span style={{ flexShrink: 0 }}>📱</span>
            <p style={{ fontSize: '0.78rem', color: '#92400e', lineHeight: 1.5 }}>
              <strong>Take a screenshot</strong> of this page or tap <strong>Copy ID</strong> above. You'll need this Order
              Number to track your order status later.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={`/track-order?order_number=${orderNumber}`} className="btn-primary">
              Track My Order
            </Link>
            <Link href="/products" className="btn-outline">
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* ── Customer info + order items ── */}
        {loading ? (
          <div
            style={{
              background: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--text-light)',
              fontSize: '0.85rem',
              marginBottom: '1rem',
            }}
          >
            Loading order details...
          </div>
        ) : order ? (
          <>
            {/* Delivery info */}
            <div
              style={{
                background: 'var(--white)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '1.5rem 2rem',
                marginBottom: '1rem',
              }}
            >
              <p
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--text-light)',
                  marginBottom: '1rem',
                }}
              >
                Delivery Information
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="info-grid">
                {[
                  { label: 'Name', value: `${order.first_name} ${order.last_name}` },
                  { label: 'Phone', value: order.phone },
                  { label: 'Address', value: order.address },
                  { label: 'City', value: `${order.city}${order.postal_code ? ` — ${order.postal_code}` : ''}` },
                  ...(order.notes ? [{ label: 'Notes', value: order.notes }] : []),
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p
                      style={{
                        fontSize: '0.68rem',
                        color: 'var(--text-light)',
                        letterSpacing: '0.07em',
                        textTransform: 'uppercase',
                        marginBottom: '0.2rem',
                      }}
                    >
                      {label}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: 500, lineHeight: 1.4 }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order items */}
            <div
              style={{
                background: 'var(--white)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '1.5rem 2rem',
                marginBottom: '1rem',
              }}
            >
              <p
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--text-light)',
                  marginBottom: '1rem',
                }}
              >
                Items Ordered
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {order.order_items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '52px',
                        height: '64px',
                        flexShrink: 0,
                        background: 'var(--blush-light)',
                        overflow: 'hidden',
                        borderRadius: '2px',
                      }}
                    >
                      {item.product_image_url ? (
                        <img
                          src={item.product_image_url}
                          alt={item.product_name}
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
                          📦
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: 500, marginBottom: '0.15rem' }}
                      >
                        {item.product_name}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Qty: {item.quantity}</p>
                    </div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-dark)', flexShrink: 0 }}>
                      {formatPKR(item.unit_price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ height: '1px', background: 'var(--border)', margin: '1rem 0' }} />

              {/* Totals */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-mid)' }}>Subtotal</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-dark)' }}>{formatPKR(order.total_amount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-mid)' }}>Shipping</span>
                  <span style={{ fontSize: '0.82rem', color: shipping === 0 ? '#16a34a' : 'var(--text-dark)' }}>
                    {shipping === 0 ? 'Free' : formatPKR(shipping)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1rem',
                      fontStyle: 'italic',
                      color: 'var(--text-dark)',
                    }}
                  >
                    Total
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.1rem',
                      color: 'var(--text-dark)',
                      fontWeight: 500,
                    }}
                  >
                    {formatPKR(order.total_amount + shipping)}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : null}

        {/* ── What happens next ── */}
        <div
          style={{
            background: 'var(--white)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '1.5rem 2rem',
            marginBottom: '1rem',
          }}
        >
          <p
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-light)',
              marginBottom: '1rem',
              textAlign: 'center',
            }}
          >
            What happens next?
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              {
                icon: '📞',
                title: 'We call you',
                desc: 'Our team will call you to confirm your order and delivery details',
              },
              { icon: '📦', title: 'We pack your order', desc: 'Your items are carefully packed and prepared for shipping' },
              {
                icon: '🚚',
                title: 'Delivery to your door',
                desc: 'Expected delivery within 3-5 working days across Pakistan',
              },
              { icon: '💵', title: 'Pay on delivery', desc: 'Pay cash when your order arrives — no advance payment needed' },
            ].map(step => (
              <div
                key={step.title}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                  padding: '0.75rem',
                  background: 'var(--off-white)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                }}
              >
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{step.icon}</span>
                <div>
                  <p style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-dark)', marginBottom: '0.15rem' }}>
                    {step.title}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', lineHeight: 1.5 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom tip ── */}
        <div
          style={{
            padding: '0.85rem 1rem',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '6px',
            fontSize: '0.78rem',
            color: '#1d4ed8',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'flex-start',
          }}
        >
          <span style={{ flexShrink: 0 }}>💡</span>
          <span>
            You can track your order anytime at{' '}
            <Link href="/track-order" style={{ color: '#1d4ed8', fontWeight: 600 }}>
              Track Order
            </Link>{' '}
            using your Order Number and phone number.
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .info-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-light)' }}>Loading...</p>
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
