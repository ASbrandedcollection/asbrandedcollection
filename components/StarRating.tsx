import React from 'react';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
};

export default function StarRating({ rating, size = 'md', interactive = false, onRate }: StarRatingProps) {
  const iconSize = sizeMap[size];
  const [hoverRating, setHoverRating] = React.useState(0);

  const displayRating = hoverRating || rating;

  return (
    <div
      style={{
        display: 'flex',
        gap: '4px',
        cursor: interactive ? 'pointer' : 'default',
      }}
      onMouseLeave={() => setHoverRating(0)}
    >
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          style={{
            background: 'none',
            border: 'none',
            padding: '0',
            cursor: interactive ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          disabled={!interactive}
        >
          <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill={star <= displayRating ? 'var(--blush-deep)' : 'var(--border)'}
            stroke={star <= displayRating ? 'var(--blush-deep)' : 'var(--border)'}
            strokeWidth="1.5"
            style={{
              transition: 'all 0.1s ease',
            }}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}
