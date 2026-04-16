import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabaseAdmin = getSupabaseAdmin();

  try {
    await requireAdmin(request);
    const { id } = await params;

    const { error } = await supabaseAdmin.from('reviews').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
