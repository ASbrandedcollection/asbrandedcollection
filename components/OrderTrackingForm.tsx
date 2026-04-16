'use client';

import React, { useState } from 'react';

interface OrderTrackingFormProps {
  onTrack: (orderId: string, phoneNumber: string) => void;
  loading?: boolean;
  error?: string;
}

export default function OrderTrackingForm({ onTrack, loading = false, error }: OrderTrackingFormProps) {
  const [orderNumber, setOrderNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderNumber.trim()) {
      alert('Please enter your order ID');
      return;
    }

    if (!phoneNumber.trim()) {
      alert('Please enter your phone number');
      return;
    }

    onTrack(orderNumber.trim(), phoneNumber.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: '500px',
        margin: '0 auto',
        padding: '32px',
        backgroundColor: 'var(--off-white)',
        borderRadius: '8px',
        border: '1px solid var(--border)',
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: '24px',
          fontStyle: 'italic',
          marginTop: 0,
          marginBottom: '32px',
          color: 'var(--text-dark)',
        }}
      >
        Track Your Order
      </h2>

      {error && (
        <div
          style={{
            padding: '12px',
            marginBottom: '16px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '4px',
            fontSize: '14px',
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px',
            color: 'var(--text-dark)',
          }}
        >
          Order Number *
        </label>
        <input
          type="text"
          value={orderNumber}
          onChange={e => setOrderNumber(e.target.value)}
          placeholder="e.g., ORD-10234"
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
        <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
          You can find your order number on your confirmation screen
        </p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px',
            color: 'var(--text-dark)',
          }}
        >
          Phone Number *
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={e => setPhoneNumber(e.target.value)}
          placeholder="e.g., +92 300 1234567"
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
        <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>The phone number associated with your order</p>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: loading ? '#ccc' : 'var(--blush-deep)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: '600',
          letterSpacing: '0.05em',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => {
          if (!loading) (e.target as HTMLButtonElement).style.opacity = '0.9';
        }}
        onMouseLeave={e => {
          (e.target as HTMLButtonElement).style.opacity = '1';
        }}
      >
        {loading ? 'Tracking...' : 'Track Order'}
      </button>
    </form>
  );
}
