'use client';

import React, { useState } from 'react';
import StarRating from './StarRating';

interface ReviewFormProps {
  productSlug: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ productSlug, onSuccess }: ReviewFormProps) {
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/products/${productSlug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          rating,
          description: description.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit review');
      }

      setSuccess(true);
      setCustomerName('');
      setRating(5);
      setDescription('');

      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
      }, 2000);
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
        padding: '24px',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        backgroundColor: 'var(--off-white)',
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px' }}>Share Your Review</h3>

      {error && (
        <div
          style={{
            padding: '12px',
            marginBottom: '16px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: '12px',
            marginBottom: '16px',
            backgroundColor: '#e8f5e9',
            color: '#2e7d32',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          ✓ Thank you! Your review has been posted.
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px',
          }}
        >
          Your Name *
        </label>
        <input
          type="text"
          value={customerName}
          onChange={e => setCustomerName(e.target.value)}
          placeholder="Enter your name"
          required
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px',
          }}
        >
          Rating *
        </label>
        <StarRating rating={rating} size="lg" interactive={true} onRate={setRating} />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px',
          }}
        >
          Your Review (Optional)
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Share your experience with this product..."
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '10px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            resize: 'vertical',
          }}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !customerName.trim()}
        style={{
          padding: '10px 24px',
          backgroundColor: customerName.trim() ? 'var(--blush-deep)' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: customerName.trim() ? 'pointer' : 'not-allowed',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => {
          if (customerName.trim()) (e.target as HTMLButtonElement).style.opacity = '0.9';
        }}
        onMouseLeave={e => {
          (e.target as HTMLButtonElement).style.opacity = '1';
        }}
      >
        {loading ? 'Posting...' : 'Post Review'}
      </button>
    </form>
  );
}
