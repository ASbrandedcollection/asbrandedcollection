import { Suspense } from 'react';
import ProductsContent from './products-content';

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoadingFallback />}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsLoadingFallback() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', padding: '2rem' }}>
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                background: 'var(--white)',
                border: '1px solid var(--border)',
                aspectRatio: '3/4',
                animation: 'pulse 1.5s ease infinite',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
