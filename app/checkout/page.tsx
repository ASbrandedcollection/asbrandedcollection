
'use client';

import { useCart } from '@/lib/cart-context';
import { formatPKR } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

type MetaPixel = (
  action: string,
  event: string,
  params?: Record<string, unknown>,
  options?: Record<string, unknown>
) => void;

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
        htmlFor={name}
        style={{
          display: 'block',
          fontSize: '0.72rem',
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-mid)',
          marginBottom: '0.4rem',
        }}
      >
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
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
          if (!error) {
            e.target.style.borderColor = 'var(--blush-deep)';
          }
        }}
        onBlur={e => {
          if (!error) {
            e.target.style.borderColor = 'var(--border)';
          }
        }}
      />

      {error && (
        <p
          role="alert"
          style={{
            fontSize: '0.72rem',
            color: '#ef4444',
            marginTop: '0.3rem',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();

  // Meta Pixel and duplicate submission guards
  const checkoutTracked = useRef(false);
  const placingRef = useRef(false);

  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(3000);
  const [flatShippingCost, setFlatShippingCost] = useState(200);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'advance'>('cod');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const [serverError, setServerError] = useState('');

  // Meta Pixel InitiateCheckout
  useEffect(() => {
    if (checkoutTracked.current || items.length === 0) return;

    const fbq = (window as Window & { fbq?: MetaPixel }).fbq;

    if (typeof fbq !== 'function') return;

    try {
      fbq('track', 'InitiateCheckout', {
        content_ids: items.map(item => item.product_id),
        content_type: 'product',
        contents: items.map(item => ({
          id: item.product_id,
          quantity: item.quantity,
          item_price: item.unit_price,
        })),
        num_items: items.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),
        value: totalAmount,
        currency: 'PKR',
      });

      checkoutTracked.current = true;
    } catch (error) {
      console.error('InitiateCheckout tracking failed:', error);
    }
  }, [items, totalAmount]);

  // Fetch shipping settings
  useEffect(() => {
    const controller = new AbortController();

    async function fetchSettings() {
      try {
        const response = await fetch('/api/settings', {
          signal: controller.signal,
        });

        if (!response.ok) return;

        const result = await response.json();

        if (controller.signal.aborted || !result.success) return;

        const threshold = Number(
          result.data?.free_delivery_threshold
        );

        const shippingCost = Number(
          result.data?.flat_shipping_cost
        );

        if (Number.isFinite(threshold) && threshold >= 0) {
          setFreeDeliveryThreshold(threshold);
        }

        if (Number.isFinite(shippingCost) && shippingCost >= 0) {
          setFlatShippingCost(shippingCost);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Shipping settings fetch failed:', error);
        }
      }
    }

    fetchSettings();

    return () => controller.abort();
  }, []);

  const allItemsFreeDelivery =
    items.length > 0 &&
    items.every(item => item.free_delivery);

  const shipping =
    allItemsFreeDelivery || totalAmount >= freeDeliveryThreshold
      ? 0
      : flatShippingCost;

  const advanceDiscount =
    paymentMethod === 'advance'
      ? Math.floor(totalAmount * 0.05)
      : 0;

  const grandTotal = totalAmount + shipping - advanceDiscount;

  function validate() {
    const newErrors: Record<string, string> = {};

    if (!form.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!form.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (
      !/^(\+92|0)3[0-9]{9}$/.test(
        form.phone.replace(/\s/g, '')
      )
    ) {
      newErrors.phone =
        'Enter a valid Pakistani number (03XXXXXXXXX)';
    }

    if (!form.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!form.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!form.postal_code.trim()) {
      newErrors.postal_code = 'Postal code is required';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  async function handlePlaceOrder() {
    // Prevent rapid double-click submissions
    if (placingRef.current) return;

    if (items.length === 0) {
      setServerError('Your cart is empty.');
      return;
    }

    if (!validate()) return;

    placingRef.current = true;
    setPlacing(true);
    setServerError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          postal_code: form.postal_code.trim(),
          notes: form.notes.trim(),
          payment_method: paymentMethod,
          items: items.map(item => ({
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (
        !res.ok ||
        !data.success ||
        !data.data?.order_id ||
        !data.data?.order_number ||
        !Number.isFinite(Number(data.data?.total_amount))
      ) {
        setServerError(
          data.error ??
            'Something went wrong. Please try again.'
        );

        placingRef.current = false;
        setPlacing(false);
        return;
      }

      const createdOrder = data.data;

      // Meta Pixel Purchase
      // Only fire after successful server-side order creation.
      try {
        const fbq = (
          window as Window & {
            fbq?: MetaPixel;
          }
        ).fbq;

        if (typeof fbq === 'function') {
          fbq(
            'track',
            'Purchase',
            {
              content_ids: items.map(
                item => item.product_id
              ),
              content_type: 'product',
              contents: items.map(item => ({
                id: item.product_id,
                quantity: item.quantity,
                item_price: item.unit_price,
              })),
              num_items: items.reduce(
                (sum, item) => sum + item.quantity,
                0
              ),
              value: Number(createdOrder.total_amount),
              currency: 'PKR',
              order_id: createdOrder.order_id,
            },
            {
              eventID: `purchase_${createdOrder.order_id}`,
            }
          );
        }
      } catch (pixelError) {
        // Pixel failure must not prevent a successful checkout.
        console.error(
          'Meta Purchase tracking failed:',
          pixelError
        );
      }

      const confirmationUrl =
        `/order-confirmation?order_number=${encodeURIComponent(
          createdOrder.order_number
        )}&order_id=${encodeURIComponent(
          createdOrder.order_id
        )}`;

      clearCart();

      router.push(confirmationUrl);
    } catch (error) {
      console.error('Checkout request failed:', error);

      setServerError(
        'Unable to confirm the order result. Please check your order status before trying again.'
      );

      placingRef.current = false;
      setPlacing(false);
    }
  }

  const inputStyle = (hasError: boolean): CSSProperties => ({
    width: '100%',
    padding: '0.75rem',
    border: `1px solid ${
      hasError ? '#ef4444' : 'var(--border)'
    }`,
    background: 'var(--white)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.875rem',
    color: 'var(--text-dark)',
    outline: 'none',
    transition: 'border-color 0.2s',
    borderRadius: '2px',
  });

  const labelStyle: CSSProperties = {
    display: 'block',
    fontSize: '0.72rem',
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-mid)',
    marginBottom: '0.4rem',
  };

  const radioOption = (
    value: 'cod' | 'advance',
    emoji: string,
    title: string,
    subtitle: string,
    accentColor: string,
    bgColor: string
  ) => {
    const selected = paymentMethod === value;

    return (
      <div
        key={value}
        role="radio"
        aria-checked={selected}
        tabIndex={0}
        onClick={() => setPaymentMethod(value)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setPaymentMethod(value);
          }
        }}
        style={{
          border: `2px solid ${
            selected ? accentColor : 'var(--border)'
          }`,
          borderRadius: '4px',
          padding: '1rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          background: selected ? bgColor : 'var(--white)',
          cursor: 'pointer',
          transition:
            'border-color 0.2s, background 0.2s',
        }}
      >
        <div
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            border: `2px solid ${
              selected ? accentColor : 'var(--border)'
            }`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '1px',
          }}
        >
          {selected && (
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: accentColor,
              }}
            />
          )}
        </div>

        <div>
          <p
            style={{
              fontSize: '0.85rem',
              fontWeight: 500,
              color: 'var(--text-dark)',
            }}
          >
            {emoji} {title}
          </p>

          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-mid)',
              marginTop: '0.15rem',
            }}
          >
            {subtitle}
          </p>
        </div>
      </div>
    );
  };

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
        <div
          style={{
            textAlign: 'center',
            padding: '2rem',
          }}
        >
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

          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-light)',
              marginBottom: '1.5rem',
            }}
          >
            Add some products before checking out.
          </p>

          <Link href="/products" className="btn-primary">
            Browse Products
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
        overflowX: 'hidden',
      }}
    >
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
              <span
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
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
                  <span
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-dark)',
                      fontWeight: 500,
                    }}
                  >
                    {crumb.label}
                  </span>
                )}

                {i < arr.length - 1 && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--border-dark)',
                    }}
                  >
                    ›
                  </span>
                )}
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

      <div
        className="container"
        style={{ padding: '2rem 0' }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'minmax(0, 1fr) min(360px, 100%)',
            gap: '2rem',
            alignItems: 'flex-start',
          }}
          className="checkout-grid"
        >
          {/* Left: Customer form */}

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
                  setForm(f => ({
                    ...f,
                    first_name: val,
                  }));
                  setErrors(e => ({
                    ...e,
                    first_name: '',
                  }));
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
                  setForm(f => ({
                    ...f,
                    last_name: val,
                  }));
                  setErrors(e => ({
                    ...e,
                    last_name: '',
                  }));
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
                  setForm(f => ({
                    ...f,
                    phone: val,
                  }));
                  setErrors(e => ({
                    ...e,
                    phone: '',
                  }));
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
                  setForm(f => ({
                    ...f,
                    address: val,
                  }));
                  setErrors(e => ({
                    ...e,
                    address: '',
                  }));
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
                  setForm(f => ({
                    ...f,
                    city: val,
                  }));
                  setErrors(e => ({
                    ...e,
                    city: '',
                  }));
                }}
              />

              <Field
                label="Postal Code"
                name="postal_code"
                placeholder="75500"
                required
                half
                value={form.postal_code}
                error={errors.postal_code}
                onChange={val => {
                  setForm(f => ({
                    ...f,
                    postal_code: val,
                  }));
                  setErrors(e => ({
                    ...e,
                    postal_code: '',
                  }));
                }}
              />
            </div>

            {/* Notes */}

            <div style={{ marginTop: '1rem' }}>
              <label style={labelStyle}>
                Order Notes (optional)
              </label>

              <textarea
                value={form.notes}
                onChange={e =>
                  setForm(f => ({
                    ...f,
                    notes: e.target.value,
                  }))
                }
                placeholder="Any special instructions? e.g. Call before delivery, leave at door..."
                rows={3}
                style={{
                  ...inputStyle(false),
                  resize: 'vertical',
                  lineHeight: 1.6,
                }}
                onFocus={e => {
                  e.target.style.borderColor =
                    'var(--blush-deep)';
                }}
                onBlur={e => {
                  e.target.style.borderColor =
                    'var(--border)';
                }}
              />
            </div>

            {/* Payment method */}

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
                role="radiogroup"
                aria-label="Payment Method"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {radioOption(
                  'cod',
                  '💵',
                  'Cash on Delivery',
                  'Pay when your order arrives at your door',
                  'var(--blush-deep)',
                  'var(--blush-light)'
                )}

                {radioOption(
                  'advance',
                  '💸',
                  'Pay in Advance — Save 5%',
                  'Transfer before delivery and get 5% off your entire order',
                  '#16a34a',
                  '#f0fdf4'
                )}
              </div>

              {/* Advance payment details */}

              {paymentMethod === 'advance' && (
                <div
                  style={{
                    marginTop: '0.75rem',
                    border: '1px solid #bbf7d0',
                    borderRadius: '4px',
                    background: '#f0fdf4',
                    padding: '1.25rem',
                  }}
                >
                  <p
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#15803d',
                      marginBottom: '0.75rem',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    🏦 Bank Transfer Details
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.45rem',
                    }}
                  >
                    {[
                      ['Bank', 'Meezan Bank'],
                      ['Account Title', 'Muhammad Shoaib'],
                      ['Account No', '99270111918894'],
                      ['IBAN', 'PK57 MEZN 0099270111918894'],
                    ].map(([key, val]) => (
                      <div
                        key={key}
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          fontSize: '0.82rem',
                        }}
                      >
                        <span
                          style={{
                            color: '#6b7280',
                            minWidth: '100px',
                            flexShrink: 0,
                          }}
                        >
                          {key}
                        </span>

                        <span
                          style={{
                            color: 'var(--text-dark)',
                            fontWeight: 500,
                          }}
                        >
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: '0.85rem',
                      paddingTop: '0.85rem',
                      borderTop: '1px solid #bbf7d0',
                      fontSize: '0.78rem',
                      color: '#374151',
                      lineHeight: 1.6,
                    }}
                  >
                    📩 After payment, send your receipt
                    screenshot to{' '}
                    <strong style={{ color: '#15803d' }}>
                      0309 1225130
                    </strong>{' '}
                    on WhatsApp to confirm your order.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Order summary */}

          <div
            style={{
              position: 'sticky',
              top: 'calc(var(--nav-height) + 1rem)',
              width: '100%',
              minWidth: 0,
            }}
          >
            <div
              style={{
                background: 'var(--white)',
                border: '1px solid var(--border)',
                padding: '1.5rem',
                width: '100%',
                boxSizing: 'border-box',
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
                {items.map((item, index) => (
                  <div
                    key={`${item.product_id}-${item.variant_id ?? 'default'}-${index}`}
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
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
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
                          top: '2px',
                          right: '2px',
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

                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
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

                    <p
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        color: 'var(--text-dark)',
                        flexShrink: 0,
                      }}
                    >
                      {formatPKR(
                        item.unit_price * item.quantity
                      )}
                    </p>
                  </div>
                ))}
              </div>

              <div
                style={{
                  height: '1px',
                  background: 'var(--border)',
                  margin: '1rem 0',
                }}
              />

              {/* Totals */}

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-mid)',
                    }}
                  >
                    Subtotal
                  </span>

                  <span
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-dark)',
                    }}
                  >
                    {formatPKR(totalAmount)}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-mid)',
                    }}
                  >
                    Shipping
                  </span>

                  <span
                    style={{
                      fontSize: '0.85rem',
                      color:
                        shipping === 0
                          ? '#16a34a'
                          : 'var(--text-dark)',
                    }}
                  >
                    {shipping === 0
                      ? 'Free'
                      : formatPKR(shipping)}
                  </span>
                </div>

                {shipping > 0 &&
                  freeDeliveryThreshold > totalAmount && (
                    <p
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-light)',
                        background: 'var(--blush-light)',
                        padding: '0.5rem 0.75rem',
                      }}
                    >
                      Add{' '}
                      {formatPKR(
                        freeDeliveryThreshold - totalAmount
                      )}{' '}
                      more for free shipping
                    </p>
                  )}

                {/* Advance discount */}

                {paymentMethod === 'advance' && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.85rem',
                        color: '#16a34a',
                        flexShrink: 1,
                        minWidth: 0,
                      }}
                    >
                      Advance (5% off)
                    </span>

                    <span
                      style={{
                        fontSize: '0.85rem',
                        color: '#16a34a',
                        fontWeight: 500,
                        flexShrink: 0,
                      }}
                    >
                      -{formatPKR(advanceDiscount)}
                    </span>
                  </div>
                )}
              </div>

              <div
                style={{
                  height: '1px',
                  background: 'var(--border)',
                  marginBottom: '1rem',
                }}
              />

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
                  role="alert"
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
                type="button"
                onClick={handlePlaceOrder}
                disabled={placing}
                className="btn-primary"
                style={{
                  width: '100%',
                  opacity: placing ? 0.7 : 1,
                  cursor: placing
                    ? 'not-allowed'
                    : 'pointer',
                  fontSize: '0.85rem',
                  padding: '1rem',
                }}
              >
                {placing
                  ? 'Placing Order...'
                  : `Place Order · ${formatPKR(grandTotal)}`}
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
                By placing your order you agree to our terms.{' '}
                {paymentMethod === 'cod'
                  ? "We'll call you to confirm before delivery."
                  : 'Send your payment receipt to confirm your order.'}
              </p>
            </div>

            {/* Back to cart */}

            <div
              style={{
                textAlign: 'center',
                marginTop: '1rem',
              }}
            >
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

          .checkout-grid > div:last-child {
            position: static !important;
          }

          .container {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
            max-width: 100vw !important;
            overflow-x: hidden !important;
          }
        }
      `}</style>
    </div>
  );
}
