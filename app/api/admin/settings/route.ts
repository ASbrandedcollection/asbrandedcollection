import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.from('store_settings').select('key, value').order('key');

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const settings = Object.fromEntries(data.map((row: any) => [row.key, row.value]));
  return NextResponse.json({ success: true, data: settings });
}

export async function PUT(request: NextRequest) {
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const supabaseAdmin = getSupabaseAdmin();

  // Upsert each key-value pair
  const updates = Object.entries(body).map(([key, value]) => ({
    key,
    value: String(value),
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabaseAdmin.from('store_settings').upsert(updates, { onConflict: 'key' });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: { updated: updates.length } });
}
