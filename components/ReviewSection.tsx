'use client';

import { useEffect, useState } from 'react';
import ReviewForm from './ReviewForm';
import StarRating from './StarRating';

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  description?: string;
  created_at: string;
}

interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    [key: number]: number;
  };
}

interface ReviewsSectionProps {
  productSlug: string;
}

export default function ReviewsSection({ productSlug }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${productSlug}/reviews`);
        const data = await res.json();
        setReviews(data.reviews || []);
        setStats(data.stats);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productSlug, refreshTrigger]);

  const handleReviewSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>Loading reviews...</div>;
  }

  const displayReviews = expanded ? reviews : reviews.slice(0, 5);

  return (
    <div
      style={{
        marginTop: '48px',
        paddingTop: '48px',
        borderTop: '1px solid var(--border)',
      }}
    >
      {/* Stats Section */}
      {stats && stats.total_reviews > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: '32px',
            marginBottom: '40px',
            alignItems: 'start',
          }}
        >
          {/* Average Rating Card */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', fontWeight: '700', marginBottom: '8px' }}>{stats.average_rating}</div>
            <StarRating rating={Math.round(stats.average_rating)} size="md" />
            <div
              style={{
                fontSize: '14px',
                color: 'var(--text-dark)',
                marginTop: '8px',
              }}
            >
              {stats.total_reviews} {stats.total_reviews === 1 ? 'review' : 'reviews'}
            </div>
          </div>

          {/* Rating Distribution */}
          <div>
            {[5, 4, 3, 2, 1].map(star => {
              const count = stats.rating_distribution[star] || 0;
              const percentage = stats.total_reviews > 0 ? Math.round((count / stats.total_reviews) * 100) : 0;

              return (
                <div
                  key={star}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px',
                  }}
                >
                  <div style={{ fontSize: '14px', minWidth: '30px' }}>{star} ★</div>
                  <div
                    style={{
                      flex: 1,
                      height: '8px',
                      backgroundColor: 'var(--border)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        backgroundColor: 'var(--blush-deep)',
                        width: `${percentage}%`,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '12px', minWidth: '40px', textAlign: 'right' }}>{percentage}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Review Form */}
      <ReviewForm productSlug={productSlug} onSuccess={handleReviewSuccess} />

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '20px' }}>Customer Reviews</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {displayReviews.map(review => (
              <div
                key={review.id}
                style={{
                  padding: '16px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
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
                  <div>
                    <div
                      style={{
                        fontWeight: '600',
                        fontSize: '16px',
                        marginBottom: '4px',
                      }}
                    >
                      {review.customer_name}
                    </div>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>{new Date(review.created_at).toLocaleDateString()}</div>
                </div>

                {review.description && (
                  <p
                    style={{
                      margin: '12px 0 0 0',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      color: 'var(--text-dark)',
                    }}
                  >
                    {review.description}
                  </p>
                )}
              </div>
            ))}
          </div>

          {reviews.length > 5 && !expanded && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button
                onClick={() => setExpanded(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--blush-deep)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  textDecoration: 'underline',
                }}
              >
                View all {reviews.length} reviews
              </button>
            </div>
          )}

          {expanded && reviews.length > 5 && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button
                onClick={() => setExpanded(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--blush-deep)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  textDecoration: 'underline',
                }}
              >
                Show less
              </button>
            </div>
          )}
        </div>
      )}

      {reviews.length === 0 && (
        <div
          style={{
            marginTop: '40px',
            padding: '24px',
            textAlign: 'center',
            backgroundColor: 'var(--off-white)',
            borderRadius: '8px',
            color: '#999',
          }}
        >
          No reviews yet. Be the first to review this product!
        </div>
      )}
    </div>
  );
}
