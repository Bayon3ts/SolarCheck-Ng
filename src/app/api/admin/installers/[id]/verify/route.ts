import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rematchUnmatchedLeads } from '@/lib/lead-matching';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  // Toggle is_verified
  const { data: current } = await supabase
    .from('installers')
    .select('is_verified, is_active, state')
    .eq('id', id)
    .single();

  const newValue = !current?.is_verified;

  const { error } = await supabase
    .from('installers')
    .update({ is_verified: newValue })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Auto-rematch: if installer is now BOTH verified AND active,
  // match any pending unmatched leads in their state
  if (newValue && current?.is_active && current?.state) {
    rematchUnmatchedLeads(current.state).then((result) => {
      console.log(
        `[Auto-Rematch] After verifying installer: ${result.matched} leads matched in ${current.state}`
      );
    }).catch(console.error);
  }

  return NextResponse.redirect(new URL('/admin/installers', _req.nextUrl.origin), {
    status: 303,
  });
}
