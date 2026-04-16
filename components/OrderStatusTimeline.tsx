'use client';

import { ORDER_STATUS_CONFIG, OrderStatusHistoryEntry } from '@/types';
import React from 'react';

interface OrderStatusTimelineProps {
  currentStatus: string;
  statusHistory?: OrderStatusHistoryEntry[];
  estimatedDeliveryDate?: string;
}

export default function OrderStatusTimeline({
  currentStatus,
  statusHistory = [],
  estimatedDeliveryDate,
}: OrderStatusTimelineProps) {
  const statuses = ['pending', 'confirmed', 'ready_to_ship', 'shipped', 'delivered'];
  const currentStatusIndex = statuses.indexOf(currentStatus);

  return (
    <div
      style={{
        padding: '32px',
        backgroundColor: 'var(--off-white)',
        borderRadius: '8px',
        border: '1px solid var(--border)',
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: '32px',
          fontSize: '20px',
          fontWeight: '600',
          color: 'var(--text-dark)',
        }}
      >
        Order Status
      </h2>

      {/* Visual Timeline */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '24px' }}>
          {statuses.map((status, index) => {
            const config = ORDER_STATUS_CONFIG[status as keyof typeof ORDER_STATUS_CONFIG];
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;

            return (
              <React.Fragment key={status}>
                {/* Circle */}
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: isCompleted ? config.color : 'var(--border)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '600',
                      flexShrink: 0,
                      fontSize: isCurrent ? '18px' : '14px',
                    }}
                  >
                    {config.icon}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: isCompleted ? config.color : 'var(--text-light)',
                      }}
                    >
                      {config.label}
                    </div>
                    {isCurrent && <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>Current status</div>}
                  </div>
                </div>

                {/* Connector line */}
                {index < statuses.length - 1 && (
                  <div
                    style={{
                      width: '20px',
                      height: '2px',
                      backgroundColor: isCompleted
                        ? ORDER_STATUS_CONFIG[statuses[index + 1] as keyof typeof ORDER_STATUS_CONFIG].color
                        : 'var(--border)',
                      flexShrink: 0,
                      margin: '0 4px',
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Status description */}
        <div
          style={{
            padding: '16px',
            backgroundColor: 'white',
            borderRadius: '4px',
            border: `2px solid ${ORDER_STATUS_CONFIG[currentStatus as keyof typeof ORDER_STATUS_CONFIG]?.color || 'var(--border)'}`,
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
            {ORDER_STATUS_CONFIG[currentStatus as keyof typeof ORDER_STATUS_CONFIG]?.label}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-mid)' }}>
            {ORDER_STATUS_CONFIG[currentStatus as keyof typeof ORDER_STATUS_CONFIG]?.description}
          </div>
          {estimatedDeliveryDate && currentStatus !== 'delivered' && (
            <div style={{ fontSize: '12px', color: 'var(--blush-deep)', marginTop: '8px' }}>
              📅 Estimated Delivery:{' '}
              {new Date(estimatedDeliveryDate).toLocaleDateString('en-PK', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          )}
        </div>
      </div>

      {/* Status History */}
      {statusHistory.length > 0 && (
        <div>
          <h3
            style={{
              marginTop: '32px',
              marginBottom: '16px',
              fontSize: '14px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-light)',
            }}
          >
            Timeline
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {statusHistory.map(entry => (
              <div
                key={entry.id}
                style={{
                  padding: '12px',
                  backgroundColor: 'white',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  fontSize: '13px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '600' }}>
                    {ORDER_STATUS_CONFIG[entry.status as keyof typeof ORDER_STATUS_CONFIG]?.label}
                  </span>
                  <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>
                    {new Date(entry.changed_at).toLocaleDateString()} at{' '}
                    {new Date(entry.changed_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {entry.notes && <div style={{ color: 'var(--text-mid)', fontSize: '12px' }}>{entry.notes}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
