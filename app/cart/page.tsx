'use client';

import { useCart } from '@/lib/cart-context';
import { formatPKR } from '@/lib/utils';
import Link from 'next/link';

export default function CartPage() {
  const { items, itemCount, totalAmount, removeItem, updateQty, clearCart } = useCart();

  if (itemCount === 0)
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--blush-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--blush-deep)" strokeWidth="1.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.8rem',
              fontStyle: 'italic',
              color: 'var(--text-dark)',
              marginBottom: '0.5rem',
            }}
          >
            Your cart is empty
          </h2>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Looks like you haven't added anything yet.
          </p>
          <Link href="/products" className="btn-primary">
            Start Shopping
          </Link>
        </div>
      </div>
    );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      {/* Header */}
      <div
        style={{
          background: 'var(--white)',
          borderBottom: '1px solid var(--border)',
          padding: '2rem 0',
        }}
      >
        <div className="container">
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
              fontWeight: 400,
              fontStyle: 'italic',
              color: 'var(--text-dark)',
            }}
          >
            Shopping Cart
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                fontStyle: 'normal',
                color: 'var(--text-light)',
                marginLeft: '0.75rem',
              }}
            >
              ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </span>
          </h1>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: '2rem',
            alignItems: 'start',
          }}
          className="cart-grid"
        >
          {/* ── Cart items ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Clear cart */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={clearCart}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.75rem',
                  color: 'var(--text-light)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontFamily: 'var(--font-body)',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--blush-deep)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-light)')}
              >
                Clear all
              </button>
            </div>

            {items.map(item => (
              <div
                key={item.product_id}
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--border)',
                  padding: '1.25rem',
                  display: 'flex',
                  gap: '1.25rem',
                  animation: 'fadeUp 0.3s ease',
                }}
              >
                {/* Image */}
                <Link href={`/products/${item.slug}`}>
                  <div
                    style={{
                      width: '90px',
                      height: '110px',
                      flexShrink: 0,
                      background: 'var(--blush-light)',
                      overflow: 'hidden',
                    }}
                  >
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
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
                        }}
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--blush-deep)"
                          strokeWidth="1.2"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/products/${item.slug}`} style={{ textDecoration: 'none' }}>
                    <p
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1rem',
                        fontStyle: 'italic',
                        color: 'var(--text-dark)',
                        marginBottom: '0.25rem',
                        lineHeight: 1.3,
                      }}
                    >
                      {item.name}
                    </p>
                  </Link>

                  {/* Price */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-dark)' }}>
                      {formatPKR(item.unit_price)}
                    </span>
                    {item.discount_percent > 0 && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-light)',
                          textDecoration: 'line-through',
                        }}
                      >
                        {formatPKR(item.original_price)}
                      </span>
                    )}
                  </div>

                  {/* Quantity + Remove */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <button
                        onClick={() => updateQty(item.product_id, item.quantity - 1)}
                        style={{
                          width: '32px',
                          height: '32px',
                          border: '1px solid var(--border)',
                          background: 'var(--white)',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          color: 'var(--text-mid)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        −
                      </button>
                      <div
                        style={{
                          width: '44px',
                          height: '32px',
                          border: '1px solid var(--border)',
                          borderLeft: 'none',
                          borderRight: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          color: 'var(--text-dark)',
                          background: 'var(--white)',
                        }}
                      >
                        {item.quantity}
                      </div>
                      <button
                        onClick={() => updateQty(item.product_id, item.quantity + 1)}
                        style={{
                          width: '32px',
                          height: '32px',
                          border: '1px solid var(--border)',
                          background: 'var(--white)',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          color: 'var(--text-mid)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        +
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-dark)' }}>
                        {formatPKR(item.unit_price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.product_id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-light)',
                          padding: '4px',
                          transition: 'color 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--blush-deep)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-light)')}
                        title="Remove item"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue shopping */}
            <div style={{ marginTop: '0.5rem' }}>
              <Link
                href="/products"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-mid)',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--blush-deep)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-mid)')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* ── Order Summary ── */}
          <div
            style={{
              background: 'var(--white)',
              border: '1px solid var(--border)',
              padding: '1.5rem',
              position: 'sticky',
              top: 'calc(var(--nav-height) + 1rem)',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.3rem',
                fontStyle: 'italic',
                color: 'var(--text-dark)',
                marginBottom: '1.25rem',
              }}
            >
              Order Summary
            </h2>

            {/* Line items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
              {items.map(item => (
                <div
                  key={item.product_id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.82rem',
                    color: 'var(--text-mid)',
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      marginRight: '0.5rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.name} × {item.quantity}
                  </span>
                  <span style={{ flexShrink: 0 }}>{formatPKR(item.unit_price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div style={{ height: '1px', background: 'var(--border)', margin: '1rem 0' }} />

            {/* Subtotal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-mid)' }}>Subtotal</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dark)' }}>{formatPKR(totalAmount)}</span>
            </div>

            {/* Shipping */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-mid)' }}>Shipping</span>
              <span style={{ fontSize: '0.85rem', color: '#81c784' }}>{totalAmount >= 3000 ? 'Free' : formatPKR(200)}</span>
            </div>

            {totalAmount < 3000 && (
              <div
                style={{
                  background: 'var(--blush-light)',
                  padding: '0.6rem 0.75rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-mid)',
                  marginBottom: '1rem',
                  lineHeight: 1.5,
                }}
              >
                Add {formatPKR(3000 - totalAmount)} more for <strong>free shipping</strong>
              </div>
            )}

            <div style={{ height: '1px', background: 'var(--border)', marginBottom: '1rem' }} />

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.1rem',
                  fontStyle: 'italic',
                  color: 'var(--text-dark)',
                }}
              >
                Total
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.2rem',
                  fontWeight: 500,
                  color: 'var(--text-dark)',
                }}
              >
                {formatPKR(totalAmount >= 3000 ? totalAmount : totalAmount + 200)}
              </span>
            </div>

            <Link href="/checkout" className="btn-primary" style={{ width: '100%', textAlign: 'center' }}>
              Proceed to Checkout
            </Link>

            {/* Payment methods */}
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>We accept</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['💵 Cash on Delivery'].map(method => (
                  <span
                    key={method}
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-mid)',
                      background: 'var(--off-white)',
                      border: '1px solid var(--border)',
                      padding: '3px 8px',
                    }}
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cart-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
