import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rematchUnmatchedLeads } from '@/lib/lead-matching';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  // Toggle is_active
  const { data: current } = await supabase
    .from('installers')
    .select('is_active, is_verified, state')
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

  // Auto-rematch: if installer is now BOTH active AND verified,
  // match any pending unmatched leads in their state
  if (newValue && current?.is_verified && current?.state) {
    rematchUnmatchedLeads(current.state).then((result) => {
      console.log(
        `[Auto-Rematch] After activating installer: ${result.matched} leads matched in ${current.state}`
      );
    }).catch(console.error);
  }

  return NextResponse.redirect(new URL('/admin/installers', _req.nextUrl.origin), {
    status: 303,
  });
}
