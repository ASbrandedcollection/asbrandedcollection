'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order_number');
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!orderNumber) return;
    navigator.clipboard.writeText(orderNumber ?? '');
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

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--off-white)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '560px', animation: 'fadeUp 0.5s ease' }}>
        {/* Success card */}
        <div
          style={{
            background: 'var(--white)',
            border: '1px solid var(--border)',
            padding: '3rem 2.5rem',
            textAlign: 'center',
            marginBottom: '1rem',
            borderRadius: '8px',
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

          {/* Order number — big and friendly */}
          {orderNumber && (
            <p
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--blush-deep)',
                marginBottom: '0.75rem',
                letterSpacing: '0.02em',
              }}
            >
              Order #{orderNumber}
            </p>
          )}

          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-mid)',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
            }}
          >
            Thank you for your order. We've received it and will call you shortly to confirm your delivery.
          </p>

          {/* Order Number box with copy button */}
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
            <span style={{ flexShrink: 0, fontSize: '1rem' }}>📱</span>
            <p style={{ fontSize: '0.78rem', color: '#92400e', lineHeight: 1.5 }}>
              <strong>Take a screenshot</strong> of this page or tap <strong>Copy ID</strong> above. You'll need this Order
              Number to track your order status later.
            </p>
          </div>

          <div style={{ height: '1px', background: 'var(--border)', margin: '1.5rem 0' }} />

          {/* What happens next */}
          <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
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
                {
                  icon: '📦',
                  title: 'We pack your order',
                  desc: 'Your items are carefully packed and prepared for shipping',
                },
                {
                  icon: '🚚',
                  title: 'Delivery to your door',
                  desc: 'Expected delivery within 3-5 working days across Pakistan',
                },
                {
                  icon: '💵',
                  title: 'Pay on delivery',
                  desc: 'Pay cash when your order arrives — no advance payment needed',
                },
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

          {/* Track order + actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={`/track-order?order_number=${orderNumber}`} className="btn-primary">
              Track My Order
            </Link>
            <Link href="/products" className="btn-outline">
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Bottom tip */}
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
