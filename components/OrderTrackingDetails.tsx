'use client';

import { formatPKR } from '@/lib/utils';
import { useState } from 'react';
import OrderStatusTimeline from './OrderStatusTimeline';

interface OrderItem {
  id: string;
  product_name: string;
  unit_price: number;
  product_discount_percent: number;
  quantity: number;
}

interface OrderTrackingDetailsProps {
  order: {
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
    order_items?: OrderItem[];
    status_history?: any[];
  };
  onCancel?: () => void;
  onUpdate?: () => void;
}

export default function OrderTrackingDetails({ order, onCancel, onUpdate }: OrderTrackingDetailsProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);

  const canCancel = order.status !== 'shipped' && order.status !== 'delivered' && order.status !== 'cancelled';

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Order Header */}
      <div
        style={{
          padding: '24px',
          backgroundColor: 'var(--off-white)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-light)',
                marginBottom: '4px',
              }}
            >
              Order Number
            </div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-dark)' }}>
              {order.id.substring(0, 8).toUpperCase()}...
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>
              Placed on{' '}
              {new Date(order.created_at).toLocaleDateString('en-PK', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-light)',
                marginBottom: '4px',
              }}
            >
              Total Amount
            </div>
            <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--blush-deep)' }}>
              {formatPKR(order.total_amount)}
            </div>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <OrderStatusTimeline
        currentStatus={order.status}
        statusHistory={order.status_history}
        estimatedDeliveryDate={order.estimated_delivery_date}
      />

      {/* Order Items */}
      <div
        style={{
          padding: '24px',
          backgroundColor: 'var(--off-white)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          marginTop: '24px',
          marginBottom: '24px',
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: '16px',
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--text-dark)',
          }}
        >
          Order Items
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {order.order_items?.map(item => (
            <div
              key={item.id}
              style={{
                padding: '12px',
                backgroundColor: 'white',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{item.product_name}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                  Qty: {item.quantity} × {formatPKR(item.unit_price)}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontWeight: '600' }}>{formatPKR(item.unit_price * item.quantity)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Info */}
      <div
        style={{
          padding: '24px',
          backgroundColor: 'var(--off-white)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          marginBottom: '24px',
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: '16px',
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--text-dark)',
          }}
        >
          Shipping Information
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-light)',
                marginBottom: '8px',
              }}
            >
              Delivery Address
            </div>
            <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-dark)' }}>
              <div style={{ fontWeight: '500', marginBottom: '4px' }}>{order.customer_name}</div>
              <div>{order.customer_address}</div>
              <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>{order.customer_phone}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>{order.customer_email}</div>
              </div>
            </div>
          </div>
          
          {/* 
          <div>
            {order.shipping_carrier && (
              <>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-light)',
                    marginBottom: '8px',
                  }}
                >
                  Carrier
                </div>
                <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '16px' }}>{order.shipping_carrier}</div>
              </>
            )}

            {order.tracking_number && (
              <>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-light)',
                    marginBottom: '8px',
                  }}
                >
                  Tracking Number
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: 'monospace',
                    color: 'var(--blush-deep)',
                  }}
                >
                  {order.tracking_number}
                </div>
              </>
            )}
          </div> */}

        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {onUpdate && (
          <button
            onClick={onUpdate}
            style={{
              padding: '10px 24px',
              backgroundColor: 'var(--blush-deep)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => ((e.target as HTMLButtonElement).style.opacity = '0.9')}
            onMouseLeave={e => ((e.target as HTMLButtonElement).style.opacity = '1')}
          >
            Refresh Status
          </button>
        )}

        {canCancel && onCancel && (
          <button
            onClick={() => setShowCancelModal(true)}
            style={{
              padding: '10px 24px',
              backgroundColor: 'transparent',
              color: 'var(--blush-deep)',
              border: '1px solid var(--blush-deep)',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'var(--off-white)';
            }}
            onMouseLeave={e => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
            }}
          >
            Cancel Order
          </button>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              maxWidth: '400px',
              width: '90%',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Cancel Order?</h3>
            <p style={{ color: 'var(--text-mid)', marginBottom: '24px' }}>
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCancelModal(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Keep Order
              </button>
              <button
                onClick={() => {
                  onCancel?.();
                  setShowCancelModal(false);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#e57373',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                Yes, Cancel It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
