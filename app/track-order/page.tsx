'use client';

import OrderTrackingDetails from '@/components/OrderTrackingDetails';
import OrderTrackingForm from '@/components/OrderTrackingForm';
import { useState } from 'react';

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  status: string;
  estimated_delivery_date?: string;
  shipping_carrier?: string;
  tracking_number?: string;
  notes?: string;
  created_at: string;
  order_items?: any[];
  status_history?: any[];
}

export default function TrackOrderPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentOrderNumber, setCurrentOrderNumber] = useState('');
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState('');

  const handleTrack = async (orderNumber: string, phoneNumber: string) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number: orderNumber,
          phone_number: phoneNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to track order');
      }

      setOrder(data.data);
      setCurrentOrderNumber(orderNumber);
      setCurrentPhoneNumber(phoneNumber);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while tracking your order');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!order) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/orders/${order.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'Cancelled by customer',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to cancel order');
      }

      // Refresh order status
      await handleTrack(currentOrderNumber, currentPhoneNumber);
      alert('Order has been cancelled successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (currentOrderNumber && currentPhoneNumber) {
      await handleTrack(currentOrderNumber, currentPhoneNumber);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--off-white)',
        padding: '48px 20px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '40px',
              fontStyle: 'italic',
              color: 'var(--text-dark)',
              margin: 0,
              marginBottom: '12px',
            }}
          >
            Track Your Order
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-mid)' }}>
            Enter your order number and phone number to track your shipment
          </p>
        </div>

        {!order ? (
          <OrderTrackingForm onTrack={handleTrack} loading={loading} error={error} />
        ) : (
          <>
            {/* Back to search button */}
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <button
                onClick={() => {
                  setOrder(null);
                  setError('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--blush-deep)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textDecoration: 'underline',
                }}
              >
                ← Track a different order
              </button>
            </div>

            {/* Order Details */}
            <OrderTrackingDetails order={order} onCancel={handleCancel} onUpdate={handleRefresh} />
          </>
        )}
      </div>
    </div>
  );
}
