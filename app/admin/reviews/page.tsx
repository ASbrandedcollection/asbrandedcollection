'use client';

import StarRating from '@/components/StarRating';
import { useEffect, useState } from 'react';

interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  description?: string;
  created_at: string;
  products?: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/admin/reviews');

      if (!res.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await res.json();
      setReviews(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      setDeleting(reviewId);
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete review');
      }

      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginTop: 0, marginBottom: '24px', fontSize: '28px' }}>Customer Reviews</h1>

      {error && (
        <div
          style={{
            padding: '12px',
            marginBottom: '16px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '4px',
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', color: '#999' }}>Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: '#999',
          }}
        >
          No reviews yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reviews.map(review => (
            <div
              key={review.id}
              style={{
                padding: '16px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                backgroundColor: 'var(--off-white)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '12px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '8px',
                    }}
                  >
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>{review.customer_name}</div>
                    <StarRating rating={review.rating} size="sm" />
                    <span style={{ fontSize: '14px', color: '#999' }}>{review.rating}/5</span>
                  </div>

                  {review.products && (
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      Product: <span style={{ fontWeight: '500' }}>{review.products.name}</span>
                    </div>
                  )}

                  <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    {new Date(review.created_at).toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(review.id)}
                  disabled={deleting === review.id}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#ffcdd2',
                    color: '#c62828',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    opacity: deleting === review.id ? 0.6 : 1,
                  }}
                >
                  {deleting === review.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>

              {review.description && (
                <div
                  style={{
                    padding: '12px',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    marginTop: '12px',
                  }}
                >
                  {review.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
