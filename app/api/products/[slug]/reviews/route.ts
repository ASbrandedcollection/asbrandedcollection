import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const supabase = await createSupabaseServerClient();

    // Get product by slug to find product_id
    const { data: product, error: productError } = await supabase.from('products').select('id').eq('slug', slug).single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get all reviews for this product, ordered by newest first
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false });

    if (reviewsError) {
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }

    // Calculate stats
    const totalReviews = reviews?.length || 0;
    const averageRating = totalReviews > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) : 0;

    const ratingDistribution = {
      5: reviews?.filter(r => r.rating === 5).length || 0,
      4: reviews?.filter(r => r.rating === 4).length || 0,
      3: reviews?.filter(r => r.rating === 3).length || 0,
      2: reviews?.filter(r => r.rating === 2).length || 0,
      1: reviews?.filter(r => r.rating === 1).length || 0,
    };

    return NextResponse.json({
      reviews: reviews || [],
      stats: {
        average_rating: parseFloat(averageRating as string),
        total_reviews: totalReviews,
        rating_distribution: ratingDistribution,
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const body = await request.json();

    const { customer_name, rating, description } = body;

    if (!customer_name || !customer_name.trim()) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    // Get product by slug
    const { data: product, error: productError } = await supabase.from('products').select('id').eq('slug', slug).single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert([
        {
          product_id: product.id,
          customer_name: customer_name.trim(),
          rating: parseInt(rating),
          description: description?.trim() || null,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
