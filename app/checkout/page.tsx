'use client';

import { useCart } from '@/lib/cart-context';
import { formatPKR } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function Field({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  half = false,
  value,
  error,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  half?: boolean;
  value: string;
  error?: string;
  onChange: (val: string) => void;
}) {
  return (
    <div style={{ gridColumn: half ? 'span 1' : 'span 2' }}>
      <label
        style={{
          display: 'block',
          fontSize: '0.72rem',
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
          color: 'var(--text-mid)',
          marginBottom: '0.4rem',
        }}
      >
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '0.75rem',
          border: `1px solid ${error ? '#ef4444' : 'var(--border)'}`,
          background: 'var(--white)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.875rem',
          color: 'var(--text-dark)',
          outline: 'none',
          transition: 'border-color 0.2s',
          borderRadius: '2px',
        }}
        onFocus={e => {
          if (!error) e.target.style.borderColor = 'var(--blush-deep)';
        }}
        onBlur={e => {
          if (!error) e.target.style.borderColor = 'var(--border)';
        }}
      />
      {error && <p style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '0.3rem' }}>{error}</p>}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const [serverError, setServerError] = useState('');

  const shipping = totalAmount >= 3000 ? 0 : 200;
  const grandTotal = totalAmount + shipping;

  if (items.length === 0) {
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
              fontSize: '1.8rem',
            }}
          >
            🛍
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
            Your cart is empty
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '1.5rem' }}>
            Add some products before checking out.
          </p>
          <Link href="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  function validate() {
    const newErrors: Record<string, string> = {};

    if (!form.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!form.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^(\+92|0)3[0-9]{9}$/.test(form.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Enter a valid Pakistani number (03XXXXXXXXX)';
    }
    if (!form.address.trim()) newErrors.address = 'Address is required';
    if (!form.city.trim()) newErrors.city = 'City is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handlePlaceOrder() {
    if (!validate()) return;

    setPlacing(true);
    setServerError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          postal_code: form.postal_code.trim(),
          notes: form.notes.trim(),
          payment_method: 'cod',
          items: items.map(i => ({
            product_id: i.product_id,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setServerError(data.error ?? 'Something went wrong. Please try again.');
        setPlacing(false);
        return;
      }

      clearCart();
      router.push(`/order-confirmation?order_number=${data.data.order_number}&order_id=${data.data.order_id}`);
    } catch {
      setServerError('Network error. Please check your connection and try again.');
      setPlacing(false);
    }
  }

  const inputStyle = (hasError: boolean) => ({
    width: '100%',
    padding: '0.75rem',
    border: `1px solid ${hasError ? '#ef4444' : 'var(--border)'}`,
    background: 'var(--white)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.875rem',
    color: 'var(--text-dark)',
    outline: 'none',
    transition: 'border-color 0.2s',
    borderRadius: '2px',
  });

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.72rem',
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-mid)',
    marginBottom: '0.4rem',
  };

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
          {/* Breadcrumb */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem',
            }}
          >
            {[
              { label: 'Cart', href: '/cart' },
              { label: 'Checkout', href: null },
            ].map((crumb, i, arr) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-light)',
                      textDecoration: 'none',
                    }}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dark)', fontWeight: 500 }}>{crumb.label}</span>
                )}
                {i < arr.length - 1 && <span style={{ fontSize: '0.7rem', color: 'var(--border-dark)' }}>›</span>}
              </span>
            ))}
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
              fontWeight: 400,
              fontStyle: 'italic',
              color: 'var(--text-dark)',
            }}
          >
            Checkout
          </h1>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 360px',
            gap: '2rem',
            alignItems: 'flex-start',
          }}
          className="checkout-grid"
        >
          {/* ── Left: Customer form ── */}
          <div
            style={{
              background: 'var(--white)',
              border: '1px solid var(--border)',
              padding: '2rem',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.2rem',
                fontStyle: 'italic',
                color: 'var(--text-dark)',
                marginBottom: '1.5rem',
              }}
            >
              Delivery Information
            </h2>

            {/* Form grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
              }}
            >
              <Field
                label="First Name"
                name="first_name"
                placeholder="Ahmed"
                required
                half
                value={form.first_name}
                error={errors.first_name}
                onChange={val => {
                  setForm(f => ({ ...f, first_name: val }));
                  setErrors(e => ({ ...e, first_name: '' }));
                }}
              />
              <Field
                label="Last Name"
                name="last_name"
                placeholder="Khan"
                required
                half
                value={form.last_name}
                error={errors.last_name}
                onChange={val => {
                  setForm(f => ({ ...f, last_name: val }));
                  setErrors(e => ({ ...e, last_name: '' }));
                }}
              />
              <Field
                label="Phone Number"
                name="phone"
                placeholder="03001234567"
                required
                type="tel"
                value={form.phone}
                error={errors.phone}
                onChange={val => {
                  setForm(f => ({ ...f, phone: val }));
                  setErrors(e => ({ ...e, phone: '' }));
                }}
              />
              <Field
                label="Full Address"
                name="address"
                placeholder="House #12, Street 5, Block B"
                required
                value={form.address}
                error={errors.address}
                onChange={val => {
                  setForm(f => ({ ...f, address: val }));
                  setErrors(e => ({ ...e, address: '' }));
                }}
              />
              <Field
                label="City"
                name="city"
                placeholder="Karachi"
                required
                half
                value={form.city}
                error={errors.city}
                onChange={val => {
                  setForm(f => ({ ...f, city: val }));
                  setErrors(e => ({ ...e, city: '' }));
                }}
              />
              <Field
                label="Postal Code"
                name="postal_code"
                placeholder="75500"
                half
                value={form.postal_code}
                onChange={val => setForm(f => ({ ...f, postal_code: val }))}
              />
            </div>

            {/* Notes */}
            <div style={{ marginTop: '1rem' }}>
              <label style={labelStyle}>Order Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Any special instructions? e.g. Call before delivery, leave at door..."
                rows={3}
                style={{
                  ...inputStyle(false),
                  resize: 'vertical',
                  lineHeight: 1.6,
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--blush-deep)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>

            {/* Payment method — COD only */}
            <div style={{ marginTop: '1.5rem' }}>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.1rem',
                  fontStyle: 'italic',
                  color: 'var(--text-dark)',
                  marginBottom: '1rem',
                }}
              >
                Payment Method
              </h3>
              <div
                style={{
                  border: '2px solid var(--blush-deep)',
                  borderRadius: '4px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: 'var(--blush-light)',
                }}
              >
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: '2px solid var(--blush-deep)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--blush-deep)',
                    }}
                  />
                </div>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-dark)' }}>💵 Cash on Delivery</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-mid)', marginTop: '0.15rem' }}>
                    Pay when your order arrives at your door
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Order summary ── */}
          <div
            style={{
              position: 'sticky',
              top: 'calc(var(--nav-height) + 1rem)',
            }}
          >
            <div
              style={{
                background: 'var(--white)',
                border: '1px solid var(--border)',
                padding: '1.5rem',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.2rem',
                  fontStyle: 'italic',
                  color: 'var(--text-dark)',
                  marginBottom: '1.25rem',
                }}
              >
                Order Summary
              </h2>

              {/* Items */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                }}
              >
                {items.map(item => (
                  <div
                    key={item.product_id}
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'center',
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      style={{
                        width: '52px',
                        height: '64px',
                        flexShrink: 0,
                        background: 'var(--blush-light)',
                        overflow: 'hidden',
                        position: 'relative',
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
                            fontSize: '1rem',
                          }}
                        >
                          📦
                        </div>
                      )}
                      {/* Quantity badge */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-6px',
                          background: 'var(--text-dark)',
                          color: 'white',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          fontSize: '0.6rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {item.quantity}
                      </div>
                    </div>

                    {/* Name + price */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: '0.82rem',
                          color: 'var(--text-dark)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginBottom: '0.2rem',
                        }}
                      >
                        {item.name}
                      </p>
                      {item.discount_percent > 0 && (
                        <p
                          style={{
                            fontSize: '0.7rem',
                            color: 'var(--text-light)',
                            textDecoration: 'line-through',
                          }}
                        >
                          {formatPKR(item.original_price)}
                        </p>
                      )}
                    </div>

                    <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-dark)', flexShrink: 0 }}>
                      {formatPKR(item.unit_price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ height: '1px', background: 'var(--border)', margin: '1rem 0' }} />

              {/* Totals */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-mid)' }}>Subtotal</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-dark)' }}>{formatPKR(totalAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-mid)' }}>Shipping</span>
                  <span style={{ fontSize: '0.85rem', color: shipping === 0 ? '#16a34a' : 'var(--text-dark)' }}>
                    {shipping === 0 ? 'Free' : formatPKR(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-light)',
                      background: 'var(--blush-light)',
                      padding: '0.5rem 0.75rem',
                    }}
                  >
                    Add {formatPKR(3000 - totalAmount)} more for free shipping
                  </p>
                )}
              </div>

              <div style={{ height: '1px', background: 'var(--border)', marginBottom: '1rem' }} />

              {/* Grand total */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                }}
              >
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
                    fontSize: '1.3rem',
                    color: 'var(--text-dark)',
                    fontWeight: 500,
                  }}
                >
                  {formatPKR(grandTotal)}
                </span>
              </div>

              {/* Server error */}
              {serverError && (
                <div
                  style={{
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    fontSize: '0.8rem',
                    color: '#dc2626',
                  }}
                >
                  {serverError}
                </div>
              )}

              {/* Place order button */}
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="btn-primary"
                style={{
                  width: '100%',
                  opacity: placing ? 0.7 : 1,
                  cursor: placing ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem',
                  padding: '1rem',
                }}
              >
                {placing ? 'Placing Order...' : `Place Order · ${formatPKR(grandTotal)}`}
              </button>

              <p
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-light)',
                  textAlign: 'center',
                  marginTop: '0.75rem',
                  lineHeight: 1.5,
                }}
              >
                By placing your order you agree to our terms. We'll call you to confirm before delivery.
              </p>
            </div>

            {/* Back to cart */}
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link
                href="/cart"
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-light)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                ← Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
