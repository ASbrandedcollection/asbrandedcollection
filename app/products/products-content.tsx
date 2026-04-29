'use client';

import { calcFinalPrice, formatPKR } from '@/lib/utils';
import type { Category, Product } from '@/types';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

function ProductCard({ product }: { product: Product }) {
  const finalPrice = calcFinalPrice(product.price, product.discount_percent);
  const image = product.images?.find(i => i.is_primary)?.image_url ?? null;
  const hasDiscount = product.discount_percent > 0;

  return (
    <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div
        style={{
          background: 'var(--white)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          cursor: 'pointer',
          height: '100%',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
        }}
      >
        {/* Image */}
        <div
          style={{
            width: '100%',
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--blush-light)',
          }}
          className="product-card-image"
        >
          {image ? (
            <img
              src={image}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blush-deep)" strokeWidth="1.2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-light)' }}>No image</span>
            </div>
          )}
          {hasDiscount && (
            <div
              style={{
                position: 'absolute',
                top: '6px',
                left: '6px',
                background: 'var(--blush-deep)',
                color: 'var(--white)',
                fontSize: '0.6rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                padding: '2px 6px',
              }}
            >
              -{product.discount_percent}%
            </div>
          )}
        </div>

        {/* Info */}
        <div className="product-card-info" style={{ padding: '0.6rem' }}>
          <p
            style={{
              fontSize: '0.55rem',
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-light)',
              marginBottom: '0.2rem',
            }}
          >
            {product.category?.name}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.8rem',
              fontWeight: 400,
              color: 'var(--text-dark)',
              marginBottom: '0.35rem',
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as any,
              overflow: 'hidden',
            }}
          >
            {product.name}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: hasDiscount ? 'var(--blush-deep)' : 'var(--text-dark)',
              }}
            >
              {formatPKR(finalPrice)}
            </span>
            {hasDiscount && (
              <span
                style={{
                  fontSize: '0.65rem',
                  color: 'var(--text-light)',
                  textDecoration: 'line-through',
                }}
              >
                {formatPKR(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// function ProductCard({ product }: { product: Product }) {
//   const finalPrice = calcFinalPrice(product.price, product.discount_percent);
//   const image = product.images?.find(i => i.is_primary)?.image_url ?? null;
//   const hasDiscount = product.discount_percent > 0;

//   return (
//     <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
//       <div
//         style={{
//           background: 'var(--white)',
//           border: '1px solid var(--border)',
//           overflow: 'hidden',
//           transition: 'transform 0.25s ease, box-shadow 0.25s ease',
//           cursor: 'pointer',
//           height: '100%',
//         }}
//         onMouseEnter={e => {
//           (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
//           (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)';
//         }}
//         onMouseLeave={e => {
//           (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
//           (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
//         }}
//       >
//         {/* Image */}
//         <div
//           style={{
//             width: '100%',
//             aspectRatio: '3/4',
//             background: 'var(--blush-light)',
//             position: 'relative',
//             overflow: 'hidden',
//           }}
//         >
//           {image ? (
//             <img src={image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//           ) : (
//             <div
//               style={{
//                 width: '100%',
//                 height: '100%',
//                 display: 'flex',
//                 flexDirection: 'column',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 gap: '0.5rem',
//               }}
//             >
//               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--blush-deep)" strokeWidth="1.2">
//                 <rect x="3" y="3" width="18" height="18" rx="2" />
//                 <circle cx="8.5" cy="8.5" r="1.5" />
//                 <polyline points="21 15 16 10 5 21" />
//               </svg>
//               <span style={{ fontSize: '0.65rem', color: 'var(--text-light)' }}>No image</span>
//             </div>
//           )}
//           {hasDiscount && (
//             <div
//               style={{
//                 position: 'absolute',
//                 top: '10px',
//                 left: '10px',
//                 background: 'var(--blush-deep)',
//                 color: 'var(--white)',
//                 fontSize: '0.65rem',
//                 fontWeight: 500,
//                 letterSpacing: '0.04em',
//                 padding: '3px 8px',
//               }}
//             >
//               -{product.discount_percent}%
//             </div>
//           )}
//         </div>

//         {/* Info */}
//         <div style={{ padding: '0.9rem' }}>
//           <p
//             style={{
//               fontSize: '0.62rem',
//               fontWeight: 500,
//               letterSpacing: '0.1em',
//               textTransform: 'uppercase',
//               color: 'var(--text-light)',
//               marginBottom: '0.3rem',
//             }}
//           >
//             {product.category?.name}
//           </p>
//           <p
//             style={{
//               fontFamily: 'var(--font-display)',
//               fontSize: '0.95rem',
//               fontWeight: 400,
//               color: 'var(--text-dark)',
//               marginBottom: '0.5rem',
//               lineHeight: 1.3,
//             }}
//           >
//             {product.name}
//           </p>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//             <span
//               style={{
//                 fontSize: '0.88rem',
//                 fontWeight: 500,
//                 color: hasDiscount ? 'var(--blush-deep)' : 'var(--text-dark)',
//               }}
//             >
//               {formatPKR(finalPrice)}
//             </span>
//             {hasDiscount && (
//               <span
//                 style={{
//                   fontSize: '0.75rem',
//                   color: 'var(--text-light)',
//                   textDecoration: 'line-through',
//                 }}
//               >
//                 {formatPKR(product.price)}
//               </span>
//             )}
//           </div>
//         </div>
//       </div>
//     </Link>
//   );
// }

// ── Main Page ─────────────────────────────────
export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Read filters from URL
  const currentCategory = searchParams.get('category') ?? '';
  const currentSearch = searchParams.get('search') ?? '';
  const currentSort = searchParams.get('sort') ?? 'newest';
  const currentMinPrice = searchParams.get('min_price') ?? '';
  const currentMaxPrice = searchParams.get('max_price') ?? '';
  const currentPage = parseInt(searchParams.get('page') ?? '1');

  // Local search input (not committed yet)
  const [searchInput, setSearchInput] = useState(currentSearch);

  // Update URL params
  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      params.delete('page'); // reset to page 1 on filter change
      router.push(`/products?${params.toString()}`);
    },
    [searchParams, router],
  );

  // Fetch products
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (currentCategory) params.set('category', currentCategory);
    if (currentSearch) params.set('search', currentSearch);
    if (currentSort) params.set('sort', currentSort);
    if (currentMinPrice) params.set('min_price', currentMinPrice);
    if (currentMaxPrice) params.set('max_price', currentMaxPrice);
    params.set('page', currentPage.toString());
    params.set('limit', '12');

    const currentSubcategory = searchParams.get('subcategory') ?? '';
    if (currentSubcategory) params.set('subcategory', currentSubcategory);

    fetch(`/api/products?${params.toString()}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setProducts(res.data.data);
          setTotal(res.data.total);
          setTotalPages(res.data.total_pages);
        }
      })
      .finally(() => setLoading(false));
  }, [currentCategory, currentSearch, currentSort, currentMinPrice, currentMaxPrice, currentPage, searchParams]);

  // Fetch categories for filter sidebar
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(res => {
        if (res.success) setCategories(res.data);
      });
  }, []);

  const handleSearchSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput });
  };

  const clearFilters = () => {
    setSearchInput('');
    router.push('/products');
  };

  const currentSubcategory = searchParams.get('subcategory') ?? '';
  const hasFilters = currentCategory || currentSubcategory || currentSearch || currentMinPrice || currentMaxPrice;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      {/* Back button */}
      <div
        style={{
          background: 'var(--white)',
          borderBottom: '1px solid var(--border)',
          padding: '0.6rem 1.5rem',
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: '0.8rem',
            fontWeight: 500,
            color: 'var(--text-mid)',
            padding: 0,
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--blush-deep)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-mid)')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
      </div>

      {/* Page Header */}
      <div
        style={{
          background: 'var(--white)',
          borderBottom: '1px solid var(--border)',
          padding: '2rem 0',
        }}
      >
        <div className="container">
          <p
            style={{
              fontSize: '0.7rem',
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--text-light)',
              marginBottom: '0.4rem',
            }}
          >
            {(() => {
              const currentSubcategory = searchParams.get('subcategory') ?? '';
              const cat = categories.find(c => c.slug === currentCategory);
              const sub = cat?.subcategories?.find(s => s.slug === currentSubcategory);
              if (sub) return `${cat?.name} › ${sub.name}`;
              if (cat) return cat.name;
              return 'All Products';
            })()}
          </p>

          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}
          >
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                fontWeight: 700,
                color: 'var(--text-dark)',
              }}
            >
              {(() => {
                const currentSubcategory = searchParams.get('subcategory') ?? '';
                const cat = categories.find(c => c.slug === currentCategory);
                const sub = cat?.subcategories?.find(s => s.slug === currentSubcategory);
                if (currentSearch) return `Results for "${currentSearch}"`;
                if (sub) return sub.name;
                if (cat) return cat.name;
                return 'All Products';
              })()}
            </h1>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
              {loading ? 'Loading...' : `${total} product${total !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          {/* ── Sidebar ── */}
          <aside
            style={{
              width: '220px',
              flexShrink: 0,
              position: 'sticky',
              top: 'calc(var(--nav-height) + 1rem)',
            }}
            className="filter-sidebar"
          >
            {/* Search */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--text-mid)',
                  marginBottom: '0.75rem',
                }}
              >
                Search
              </p>
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search products..."
                  style={{
                    flex: 1,
                    padding: '0.6rem 0.75rem',
                    border: '1px solid var(--border)',
                    background: 'var(--white)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.8rem',
                    color: 'var(--text-dark)',
                    outline: 'none',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--blush-deep)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
                <button
                  type="submit"
                  style={{
                    padding: '0.6rem 0.75rem',
                    background: 'var(--text-dark)',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--white)',
                    fontSize: '0.8rem',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </button>
              </form>
            </div>

            <div style={{ width: '100%', height: '1px', background: 'var(--border)', marginBottom: '1.5rem' }} />

            {/* Categories + Subcategories filter */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--text-mid)',
                  marginBottom: '0.75rem',
                }}
              >
                Category
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <button
                  onClick={() => updateParams({ category: '', subcategory: '' })}
                  style={{
                    textAlign: 'left',
                    padding: '0.45rem 0.75rem',
                    background: !currentCategory ? 'var(--blush-light)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    color: !currentCategory ? 'var(--blush-deep)' : 'var(--text-mid)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: !currentCategory ? 600 : 400,
                    borderRadius: '4px',
                  }}
                >
                  All Categories
                </button>

                {categories.map(cat => {
                  const isCatActive = currentCategory === cat.slug;
                  const currentSubcategory = searchParams.get('subcategory') ?? '';

                  return (
                    <div key={cat.id}>
                      <button
                        onClick={() => updateParams({ category: cat.slug, subcategory: '' })}
                        style={{
                          textAlign: 'left',
                          padding: '0.45rem 0.75rem',
                          background: isCatActive && !currentSubcategory ? 'var(--blush-light)' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          color: isCatActive ? 'var(--blush-deep)' : 'var(--text-mid)',
                          fontFamily: 'var(--font-body)',
                          fontWeight: isCatActive ? 600 : 400,
                          width: '100%',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <span style={{ fontSize: '0.9rem' }}>{cat.icon}</span>
                        {cat.name}
                      </button>

                      {/* Subcategories — only show if this category is selected */}
                      {isCatActive && cat.subcategories && cat.subcategories.length > 0 && (
                        <div style={{ paddingLeft: '0.75rem', marginTop: '0.15rem' }}>
                          {cat.subcategories.map(sub => (
                            <button
                              key={sub.id}
                              onClick={() => updateParams({ category: cat.slug, subcategory: sub.slug })}
                              style={{
                                textAlign: 'left',
                                padding: '0.35rem 0.75rem',
                                background: currentSubcategory === sub.slug ? 'var(--blush-light)' : 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.78rem',
                                color: currentSubcategory === sub.slug ? 'var(--blush-deep)' : 'var(--text-mid)',
                                fontFamily: 'var(--font-body)',
                                fontWeight: currentSubcategory === sub.slug ? 600 : 400,
                                width: '100%',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                              }}
                            >
                              <span style={{ color: 'var(--border-dark)' }}>—</span>
                              {sub.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ width: '100%', height: '1px', background: 'var(--border)', marginBottom: '1.5rem' }} />

            {/* Price Range */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--text-mid)',
                  marginBottom: '0.75rem',
                }}
              >
                Price Range (PKR)
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="number"
                  placeholder="Min"
                  defaultValue={currentMinPrice}
                  onBlur={e => updateParams({ min_price: e.target.value })}
                  style={{
                    width: '80px',
                    padding: '0.5rem',
                    border: '1px solid var(--border)',
                    background: 'var(--white)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.8rem',
                    color: 'var(--text-dark)',
                    outline: 'none',
                  }}
                />
                <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>—</span>
                <input
                  type="number"
                  placeholder="Max"
                  defaultValue={currentMaxPrice}
                  onBlur={e => updateParams({ max_price: e.target.value })}
                  style={{
                    width: '80px',
                    padding: '0.5rem',
                    border: '1px solid var(--border)',
                    background: 'var(--white)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.8rem',
                    color: 'var(--text-dark)',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Clear filters */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  background: 'transparent',
                  border: '1px solid var(--border-dark)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-mid)',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--text-dark)';
                  e.currentTarget.style.color = 'var(--white)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-mid)';
                }}
              >
                Clear Filters
              </button>
            )}
          </aside>

          {/* ── Main content ── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Sort bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                marginBottom: '1.25rem',
                gap: '0.75rem',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Sort by:</span>
              <select
                value={currentSort}
                onChange={e => updateParams({ sort: e.target.value })}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid var(--border)',
                  background: 'var(--white)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8rem',
                  color: 'var(--text-dark)',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>

            {/* Products grid */}
            {loading ? (
              <div
                className="products-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
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
            ) : products.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '4rem 2rem',
                  background: 'var(--white)',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '64px',
                    height: '64px',
                    background: 'var(--blush-light)',
                    borderRadius: '50%',
                    marginBottom: '1.25rem',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blush-deep)" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.3rem',
                    color: 'var(--text-dark)',
                    marginBottom: '0.5rem',
                  }}
                >
                  No products found
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '1.25rem' }}>
                  Try adjusting your filters or search term
                </p>
                <button onClick={clearFilters} className="btn-primary">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {/* Desktop grid */}
                <div
                  className="products-grid-desktop"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  {products.map((product, i) => (
                    <div key={product.id} style={{ animation: `fadeUp 0.4s ease ${i * 0.05}s both` }}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {/* Mobile horizontal scroll */}
                <div
                  className="products-grid-mobile"
                  style={{
                    display: 'none',
                    overflowX: 'auto',
                    WebkitOverflowScrolling: 'touch' as any,
                    scrollSnapType: 'x mandatory',
                    gap: '0.75rem',
                    paddingBottom: '0.5rem',
                    // Hide scrollbar
                  }}
                >
                  {products.map((product, i) => (
                    <div
                      key={product.id}
                      style={{
                        flexShrink: 0,
                        width: '42vw',
                        maxWidth: '180px',
                        scrollSnapAlign: 'start',
                      }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginTop: '2.5rem',
                    }}
                  >
                    <button
                      onClick={() => updateParams({ page: (currentPage - 1).toString() })}
                      disabled={currentPage === 1}
                      style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid var(--border)',
                        background: 'var(--white)',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        opacity: currentPage === 1 ? 0.4 : 1,
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.8rem',
                        color: 'var(--text-mid)',
                      }}
                    >
                      ← Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => updateParams({ page: page.toString() })}
                        style={{
                          width: '36px',
                          height: '36px',
                          border: '1px solid',
                          borderColor: page === currentPage ? 'var(--blush-deep)' : 'var(--border)',
                          background: page === currentPage ? 'var(--blush-deep)' : 'var(--white)',
                          color: page === currentPage ? 'var(--white)' : 'var(--text-mid)',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.82rem',
                          fontWeight: 500,
                        }}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => updateParams({ page: (currentPage + 1).toString() })}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid var(--border)',
                        background: 'var(--white)',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        opacity: currentPage === totalPages ? 0.4 : 1,
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.8rem',
                        color: 'var(--text-mid)',
                      }}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile responsive */}
      <style>{`
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      /* Desktop image — tall portrait */
      .product-card-image {
        aspect-ratio: 3/4;
      }

      @media (max-width: 768px) {
        .filter-sidebar { display: none !important; }
        .products-grid-desktop { display: none !important; }
        .products-grid-mobile { display: flex !important; }

        /* Mobile image — square, compact */
        .product-card-image {
          aspect-ratio: 1/1;
        }
        .product-card-info {
          padding: 0.4rem !important;
        }
      }

      .products-grid-mobile::-webkit-scrollbar { display: none; }
      .products-grid-mobile { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
    </div>
  );
}
