import { getSupabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const [{ count: productCount }, { count: reviewCount }] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('reviews').select('*', { count: 'exact', head: true }),
    ]);

    return NextResponse.json({
      success: true,
      products: productCount ?? 0,
      happy_customers: reviewCount ?? 0,
    });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
