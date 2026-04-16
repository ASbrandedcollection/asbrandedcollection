import { getSupabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.from('store_settings').select('key, value');

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  // Convert array to object: { phone: '...', email: '...', ... }
  const settings = Object.fromEntries(data.map((row: any) => [row.key, row.value]));
  return NextResponse.json({ success: true, data: settings });
}
