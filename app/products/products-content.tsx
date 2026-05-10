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
        <div
          style={{ width: '100%', position: 'relative', overflow: 'hidden', background: 'var(--blush-light)' }}
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

          {/* Stars + review count */}
          {(product.review_count ?? 0) > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
              <div style={{ display: 'flex', gap: '1px' }}>
                {[1, 2, 3, 4, 5].map(star => {
                  const fill = Math.min(1, Math.max(0, (product.rating_avg ?? 0) - (star - 1)));
                  return (
                    <svg key={star} width="10" height="10" viewBox="0 0 24 24">
                      <defs>
                        <linearGradient id={`star-${product.id}-${star}`}>
                          <stop offset={`${fill * 100}%`} stopColor="var(--blush-deep)" />
                          <stop offset={`${fill * 100}%`} stopColor="#e5e7eb" />
                        </linearGradient>
                      </defs>
                      <polygon
                        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                        fill={`url(#star-${product.id}-${star})`}
                        stroke="none"
                      />
                    </svg>
                  );
                })}
              </div>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-light)' }}>({product.review_count})</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
            <span
              style={{ fontSize: '0.78rem', fontWeight: 600, color: hasDiscount ? 'var(--blush-deep)' : 'var(--text-dark)' }}
            >
              {formatPKR(finalPrice)}
            </span>
            {hasDiscount && (
              <span style={{ fontSize: '0.65rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                {formatPKR(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const currentCategory = searchParams.get('category') ?? '';
  const currentSubcategory = searchParams.get('subcategory') ?? '';
  const currentSearch = searchParams.get('search') ?? '';
  const currentSort = searchParams.get('sort') ?? 'newest';
  const currentMinPrice = searchParams.get('min_price') ?? '';
  const currentMaxPrice = searchParams.get('max_price') ?? '';
  const currentPage = parseInt(searchParams.get('page') ?? '1');

  const [searchInput, setSearchInput] = useState(currentSearch);

  // FIX: separate page updates from filter updates so page param isn't deleted
  const updateParams = useCallback(
    (updates: Record<string, string>, isPageChange = false) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      if (!isPageChange) params.delete('page'); // only reset page on filter changes
      router.push(`/products?${params.toString()}`);
    },
    [searchParams, router],
  );

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (currentCategory) params.set('category', currentCategory);
    if (currentSubcategory) params.set('subcategory', currentSubcategory);
    if (currentSearch) params.set('search', currentSearch);
    if (currentSort) params.set('sort', currentSort);
    if (currentMinPrice) params.set('min_price', currentMinPrice);
    if (currentMaxPrice) params.set('max_price', currentMaxPrice);
    params.set('page', currentPage.toString());
    params.set('limit', '80');

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
  }, [currentCategory, currentSubcategory, currentSearch, currentSort, currentMinPrice, currentMaxPrice, currentPage]);

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(res => {
        if (res.success) setCategories(res.data);
      });
  }, []);

  // Keep search input in sync when URL changes externally (e.g. back button)
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput });
  };

  const clearFilters = () => {
    setSearchInput('');
    router.push('/products');
  };

  const hasFilters = currentCategory || currentSubcategory || currentSearch || currentMinPrice || currentMaxPrice;

  const cat = categories.find(c => c.slug === currentCategory);
  const sub = cat?.subcategories?.find(s => s.slug === currentSubcategory);

  const pageTitle = currentSearch ? `Results for "${currentSearch}"` : (sub?.name ?? cat?.name ?? 'All Products');

  const breadcrumb = sub ? `${cat?.name} › ${sub.name}` : (cat?.name ?? 'All Products');

  // Shared search form — rendered in sidebar (desktop) and above grid (mobile)
  const SearchForm = (
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
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>
    </form>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      {/* Smart Back Button */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '0.6rem 1.5rem' }}>
        <Link
          href={sub && currentCategory ? `/products?category=${currentCategory}` : currentSearch ? '/products' : '/'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontFamily: 'var(--font-body)',
            fontSize: '0.8rem',
            fontWeight: 500,
            color: 'var(--text-mid)',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--blush-deep)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-mid)')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          {sub ? (cat?.name ?? 'Category') : currentSearch ? 'All Products' : 'Home'}
        </Link>
      </div>

      {/* Page Header */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '2rem 0' }}>
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
            {breadcrumb}
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
              {pageTitle}
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
              {loading ? 'Loading...' : `${total} product${total !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem' }}>
        {/* Mobile search bar — shown only on mobile */}
        <div className="mobile-search" style={{ marginBottom: '1rem' }}>
          {SearchForm}
        </div>

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          {/* Sidebar */}
          <aside
            style={{ width: '220px', flexShrink: 0, position: 'sticky', top: 'calc(var(--nav-height) + 1rem)' }}
            className="filter-sidebar"
          >
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
              {SearchForm}
            </div>

            <div style={{ width: '100%', height: '1px', background: 'var(--border)', marginBottom: '1.5rem' }} />

            {/* Categories */}
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

                {categories.map(c => {
                  const isCatActive = currentCategory === c.slug;
                  return (
                    <div key={c.id}>
                      <button
                        onClick={() => updateParams({ category: c.slug, subcategory: '' })}
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
                        <span style={{ fontSize: '0.9rem' }}>{c.icon}</span>
                        {c.name}
                      </button>
                      {isCatActive && c.subcategories && c.subcategories.length > 0 && (
                        <div style={{ paddingLeft: '0.75rem', marginTop: '0.15rem' }}>
                          {c.subcategories.map(sub => (
                            <button
                              key={sub.id}
                              onClick={() => updateParams({ category: c.slug, subcategory: sub.slug })}
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

          {/* Main content */}
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

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1.25rem' }}>
                {Array.from({ length: 12 }).map((_, i) => (
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
                <div
                  className="products-grid" // add this
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1.25rem' }}
                >
                  {products.map((product, i) => (
                    <div key={product.id} style={{ animation: `fadeUp 0.4s ease ${Math.min(i, 10) * 0.05}s both` }}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {/* Pagination — FIX: pass isPageChange=true */}
                {totalPages > 1 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginTop: '2.5rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      onClick={() => updateParams({ page: (currentPage - 1).toString() }, true)}
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
                        onClick={() => updateParams({ page: page.toString() }, true)}
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
                      onClick={() => updateParams({ page: (currentPage + 1).toString() }, true)}
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

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .product-card-image { aspect-ratio: 3/4; }
        .mobile-search { display: none; }

        @media (max-width: 768px) {
          .filter-sidebar { display: none !important; }
          .mobile-search { display: block !important; }
          .product-card-image { aspect-ratio: 1/1; }
          .product-card-info { padding: 0.4rem !important; }
          .products-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
