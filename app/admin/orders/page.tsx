'use client';

import { formatPKR, ORDER_STATUS_LABELS } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';
import { useEffect, useState } from 'react';

const STATUS_COLORS: Record<OrderStatus, { bg: string; color: string }> = {
  pending: { bg: '#fef9e7', color: '#f59e0b' },
  confirmed: { bg: '#eff6ff', color: '#3b82f6' },
  ready_to_ship: { bg: '#f3e8ff', color: '#a855f7' },
  shipped: { bg: '#f5f3ff', color: '#8b5cf6' },
  delivered: { bg: '#f0fdf4', color: '#10b981' },
  cancelled: { bg: '#fef2f2', color: '#ef4444' },
};

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'confirmed', 'ready_to_ship', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(total / 15);

  async function fetchOrders() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set('status', filterStatus);
    params.set('page', page.toString());
    params.set('limit', '15');

    const res = await fetch(`/api/admin/orders?${params.toString()}`);
    const data = await res.json();

    if (data.success) {
      setOrders(data.data.data);
      setTotal(data.data.total);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();
  }, [filterStatus, page]);

  async function updateStatus(orderId: string, status: OrderStatus) {
    setUpdatingId(orderId);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.success) {
      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status } : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => (prev ? { ...prev, status } : null));
      }
    }
    setUpdatingId(null);
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem',
              fontStyle: 'italic',
              color: 'var(--text-dark)',
              marginBottom: '0.2rem',
            }}
          >
            Orders
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
            {total} total order{total !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={e => {
            setFilterStatus(e.target.value);
            setPage(1);
          }}
          style={{
            padding: '0.6rem 1rem',
            border: '1px solid var(--border)',
            background: 'var(--white)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.82rem',
            color: 'var(--text-dark)',
            cursor: 'pointer',
            outline: 'none',
            borderRadius: '4px',
          }}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }} className="orders-layout">
        {/* ── Orders table ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              background: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            {/* Table header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 100px 130px 80px',
                padding: '0.75rem 1rem',
                background: 'var(--off-white)',
                borderBottom: '1px solid var(--border)',
                gap: '1rem',
              }}
            >
              {['Customer', 'Date', 'Amount', 'Status', 'Action'].map(h => (
                <p
                  key={h}
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--text-light)',
                  }}
                >
                  {h}
                </p>
              ))}
            </div>

            {/* Rows */}
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>No orders found</p>
              </div>
            ) : (
              orders.map((order, i) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 100px 130px 80px',
                    padding: '0.85rem 1rem',
                    borderBottom: i < orders.length - 1 ? '1px solid var(--border)' : 'none',
                    gap: '1rem',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: selectedOrder?.id === order.id ? 'var(--blush-light)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (selectedOrder?.id !== order.id)
                      (e.currentTarget as HTMLDivElement).style.background = 'var(--off-white)';
                  }}
                  onMouseLeave={e => {
                    if (selectedOrder?.id !== order.id) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }}
                >
                  {/* Customer */}
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        color: 'var(--text-dark)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {order.first_name} {order.last_name}
                    </p>
                    <p
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-light)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {order.phone}
                    </p>
                  </div>

                  {/* Date */}
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-mid)' }}>
                    {new Date(order.created_at).toLocaleDateString('en-PK', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>

                  {/* Amount */}
                  <p style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-dark)' }}>
                    {formatPKR(order.total_amount)}
                  </p>

                  {/* Status badge */}
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '0.68rem',
                      fontWeight: 500,
                      padding: '3px 10px',
                      borderRadius: '20px',
                      background: STATUS_COLORS[order.status].bg,
                      color: STATUS_COLORS[order.status].color,
                      textTransform: 'capitalize',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>

                  {/* View button */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedOrder(order);
                    }}
                    style={{
                      padding: '4px 10px',
                      background: 'transparent',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      color: 'var(--text-mid)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--blush-deep)';
                      e.currentTarget.style.color = 'var(--blush-deep)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = 'var(--text-mid)';
                    }}
                  >
                    View
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '1rem',
              }}
            >
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '0.4rem 0.9rem',
                  border: '1px solid var(--border)',
                  background: 'var(--white)',
                  borderRadius: '4px',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  opacity: page === 1 ? 0.4 : 1,
                  fontSize: '0.8rem',
                  color: 'var(--text-mid)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                ← Prev
              </button>
              <span
                style={{
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-mid)',
                }}
              >
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: '0.4rem 0.9rem',
                  border: '1px solid var(--border)',
                  background: 'var(--white)',
                  borderRadius: '4px',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  opacity: page === totalPages ? 0.4 : 1,
                  fontSize: '0.8rem',
                  color: 'var(--text-mid)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* ── Order detail panel ── */}
        {selectedOrder && (
          <div
            style={{
              width: '320px',
              flexShrink: 0,
              background: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              overflow: 'hidden',
              position: 'sticky',
              top: '1rem',
            }}
          >
            {/* Panel header */}
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
                Order Details
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-light)',
                  fontSize: '1rem',
                  padding: '2px',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Order ID */}
              <div>
                <p
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--text-light)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Order ID
                </p>
                <p
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-mid)',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                  }}
                >
                  {selectedOrder.id}
                </p>
              </div>

              {/* Order Number */}
              <div>
                <p
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--text-light)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Order Number
                </p>
                <p
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-mid)',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                  }}
                >
                  {selectedOrder.order_number}
                </p>
              </div>

              {/* Customer info */}
              <div>
                <p
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--text-light)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Customer
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {[
                    { label: 'Name', value: `${selectedOrder.first_name} ${selectedOrder.last_name}` },
                    { label: 'Phone', value: selectedOrder.phone },
                    { label: 'Address', value: selectedOrder.address },
                    { label: 'City', value: selectedOrder.city },
                    { label: 'Postal', value: selectedOrder.postal_code },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-light)', minWidth: '55px' }}>{label}:</span>
                      <span style={{ color: 'var(--text-dark)', fontWeight: 400 }}>{value}</span>
                    </div>
                  ))}
                  {selectedOrder.notes && (
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-light)', minWidth: '55px' }}>Notes:</span>
                      <span style={{ color: 'var(--text-dark)' }}>{selectedOrder.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ height: '1px', background: 'var(--border)' }} />

              {/* Order items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <p
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 500,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--text-light)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Items
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedOrder.items.map(item => (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                          fontSize: '0.8rem',
                        }}
                      >
                        <span
                          style={{
                            color: 'var(--text-dark)',
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.product_name} × {item.quantity}
                        </span>
                        <span style={{ color: 'var(--text-mid)', flexShrink: 0 }}>
                          {formatPKR(item.unit_price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ height: '1px', background: 'var(--border)' }} />

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                  {formatPKR(selectedOrder.total_amount)}
                </span>
              </div>

              {/* Payment method */}
              <div
                style={{
                  padding: '0.6rem 0.75rem',
                  background: 'var(--off-white)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  fontSize: '0.78rem',
                  color: 'var(--text-mid)',
                }}
              >
                💳{' '}
                {selectedOrder.payment_method === 'cod'
                  ? 'Cash on Delivery'
                  : selectedOrder.payment_method === 'jazzcash'
                    ? 'JazzCash'
                    : 'EasyPaisa'}
              </div>

              <div style={{ height: '1px', background: 'var(--border)' }} />

              {/* Update status */}
              <div>
                <p
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--text-light)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Update Status
                </p>

                {selectedOrder.status === 'cancelled' && (
                  <div
                    style={{
                      padding: '0.75rem',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '4px',
                      marginBottom: '0.75rem',
                      fontSize: '0.75rem',
                      color: '#dc2626',
                      textAlign: 'center',
                    }}
                  >
                    ⚠️ This order has been cancelled. Status cannot be changed.
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {STATUS_OPTIONS.map(status => {
                    const isDisabled =
                      selectedOrder.status === status ||
                      updatingId === selectedOrder.id ||
                      selectedOrder.status === 'cancelled';

                    return (
                      <button
                        key={status}
                        onClick={() => updateStatus(selectedOrder.id, status)}
                        disabled={isDisabled}
                        style={{
                          padding: '0.6rem 0.75rem',
                          border: '1px solid',
                          borderColor: selectedOrder.status === status ? STATUS_COLORS[status].color : 'var(--border)',
                          borderRadius: '4px',
                          background: selectedOrder.status === status ? STATUS_COLORS[status].bg : 'transparent',
                          color: selectedOrder.status === status ? STATUS_COLORS[status].color : 'var(--text-mid)',
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.78rem',
                          fontWeight: selectedOrder.status === status ? 500 : 400,
                          cursor: selectedOrder.status === status ? 'default' : 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s',
                          opacity: updatingId === selectedOrder.id && selectedOrder.status !== status ? 0.5 : 1,
                        }}
                      >
                        {selectedOrder.status === status ? '✓ ' : ''}
                        {ORDER_STATUS_LABELS[status]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .orders-layout { flex-direction: column !important; }
        }
      `}</style>
    </div>
  );
}
