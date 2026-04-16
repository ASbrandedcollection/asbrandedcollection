import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { toSlug } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('category_id');

  const supabaseAdmin = getSupabaseAdmin();
  let query = supabaseAdmin
    .from('subcategories')
    .select('id, name, slug, category_id, display_order, is_active, group_name, image_url, created_at')
    .order('display_order', { ascending: true });

  if (categoryId) query = query.eq('category_id', categoryId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();

  if (!body.name || !body.category_id) {
    return NextResponse.json({ success: false, error: 'name and category_id are required' }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const slug = body.slug ? toSlug(body.slug) : toSlug(body.name);

  // Get next display_order for this category
  const { data: last } = await supabaseAdmin
    .from('subcategories')
    .select('display_order')
    .eq('category_id', body.category_id)
    .order('display_order', { ascending: false })
    .limit(1)
    .single();

  const { data, error } = await supabaseAdmin
    .from('subcategories')
    .insert({
      name: body.name.trim(),
      slug,
      category_id: body.category_id,
      group_name: body.group_name,
      display_order: (last?.display_order ?? 0) + 1,
      is_active: body.is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    const msg = error.code === '23505' ? 'A subcategory with this slug already exists in this category' : error.message;
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }

  return NextResponse.json({ success: true, data }, { status: 201 });
}
