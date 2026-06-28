import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  // Toggle is_active
  const { data: current } = await supabase
    .from('installers')
    .select('is_active')
    .eq('id', id)
    .single();

  const newValue = !current?.is_active;

  const { error } = await supabase
    .from('installers')
    .update({ is_active: newValue })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.redirect(new URL('/admin/installers', _req.nextUrl.origin), {
    status: 303,
  });
}
