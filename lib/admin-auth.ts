import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

const supabaseAdmin = getSupabaseAdmin();

export async function requireAdmin(request: NextRequest): Promise<{
  error: NextResponse | null;
  userId: string | null;
}> {
  // Check Authorization header (for API testing)
  const authHeader = request.headers.get('Authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return {
        error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }),
        userId: null,
      };
    }
    return { error: null, userId: user.id };
  }

  // Fall back to cookie-based session (for admin panel in browser)
  const { createServerClient } = await import('@supabase/ssr');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {},
    },
  });

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    return {
      error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }),
      userId: null,
    };
  }

  return { error: null, userId: session.user.id };
}
