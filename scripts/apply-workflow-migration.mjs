// Run this once to add the workflow column to the installers table.
// Usage: node --env-file=.env.local scripts/apply-workflow-migration.mjs

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

// Insert a dummy row with an empty workflow to force-create the column
// Actually — use a raw query via PostgREST's rpc approach
// Supabase admin SDK does not expose raw DDL; we insert and update instead.

// Check if the column already exists by attempting a select
const { error: checkError } = await supabase
  .from('installers')
  .select('workflow')
  .limit(1);

if (!checkError) {
  console.log('✅ workflow column already exists — no migration needed.');
  process.exit(0);
}

if (checkError.message.includes('workflow')) {
  console.log('Column missing. Attempting to add via management API...');
  // Use Supabase DB REST endpoint for DDL via pg_query
  const projectId = new URL(url).hostname.split('.')[0];
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectId}/database/query`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        query: "ALTER TABLE installers ADD COLUMN IF NOT EXISTS workflow JSONB DEFAULT '[]';"
      })
    }
  );
  const data = await res.json();
  if (res.ok) {
    console.log('✅ Migration applied!', data);
  } else {
    console.error('❌ Management API failed:', JSON.stringify(data, null, 2));
    console.log('\n👉 Please run this SQL in your Supabase SQL Editor:');
    console.log("ALTER TABLE installers ADD COLUMN IF NOT EXISTS workflow JSONB DEFAULT '[]';");
  }
} else {
  console.error('Unexpected error:', checkError.message);
}
