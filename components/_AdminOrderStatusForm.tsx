'use client';

import React, { useState } from 'react';

interface AdminOrderStatusFormProps {
  orderId: string;
  currentStatus: string;
  onUpdated?: () => void;
}

export default function AdminOrderStatusForm({ orderId, currentStatus, onUpdated }: AdminOrderStatusFormProps) {
  const [status, setStatus] = useState(currentStatus);
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [shippingCarrier, setShippingCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          estimated_delivery_date: estimatedDeliveryDate || null,
          shipping_carrier: shippingCarrier || null,
          tracking_number: trackingNumber || null,
          notes: notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update order');
      }

      setSuccess(true);
      onUpdated?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: '16px',
        backgroundColor: 'var(--off-white)',
        borderRadius: '6px',
        border: '1px solid var(--border)',
      }}
    >
      <h4 style={{ marginTop: 0, marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>Update Order Status</h4>

      {error && (
        <div
          style={{
            padding: '8px',
            marginBottom: '12px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '4px',
            fontSize: '12px',
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: '8px',
            marginBottom: '12px',
            backgroundColor: '#e8f5e9',
            color: '#2e7d32',
            borderRadius: '4px',
            fontSize: '12px',
          }}
        >
          ✓ Order updated successfully
        </div>
      )}

      <div style={{ marginBottom: '12px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '4px',
          }}
        >
          Status
        </label>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="ready_to_ship">Ready to Ship</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '4px',
          }}
        >
          Estimated Delivery Date
        </label>
        <input
          type="date"
          value={estimatedDeliveryDate}
          onChange={e => setEstimatedDeliveryDate(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '4px',
          }}
        >
          Shipping Carrier (e.g., TCS, Daewoo)
        </label>
        <input
          type="text"
          value={shippingCarrier}
          onChange={e => setShippingCarrier(e.target.value)}
          placeholder="e.g., TCS, Daewoo Express"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '4px',
          }}
        >
          Tracking Number
        </label>
        <input
          type="text"
          value={trackingNumber}
          onChange={e => setTrackingNumber(e.target.value)}
          placeholder="e.g., TCS123456789"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '4px',
          }}
        >
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="e.g., Delayed due to weather"
          style={{
            width: '100%',
            minHeight: '60px',
            padding: '8px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            resize: 'vertical',
          }}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '8px',
          backgroundColor: loading ? '#ccc' : 'var(--blush-deep)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Updating...' : 'Update Status'}
      </button>
    </form>
  );
}
