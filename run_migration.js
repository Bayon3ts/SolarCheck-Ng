const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const lines = fs.readFileSync('.env.local', 'utf8').split('\n');
const get = (k) => {
  const l = lines.find(x => x.startsWith(k));
  return l ? l.split('=').slice(1).join('=').trim() : '';
};

const SUPABASE_URL = get('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE_KEY = get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function addColumnIfMissing(column, type, defaultVal) {
  // Probe the column by selecting it
  const { error } = await supabase.from('installers').select(column).limit(1);
  if (!error) {
    console.log(`Column '${column}' already exists.`);
    return;
  }
  // Column missing — insert a fake row update to trigger auto-cast? No.
  // Instead use the management API
  console.log(`Column '${column}' missing (error: ${error.message}). Need to add via Supabase dashboard SQL editor.`);
}

async function checkColumns() {
  const columns = ['states_covered', 'languages_spoken', 'warranty_workmanship', 'warranty_roof_leak', 'warranty_equipment', 'price_per_watt'];
  const missing = [];
  for (const col of columns) {
    const { error } = await supabase.from('installers').select(col).limit(1);
    if (error && error.code === '42703') {
      missing.push(col);
    } else if (error) {
      console.log(`Column '${col}': Other error - ${error.message}`);
    } else {
      console.log(`Column '${col}': EXISTS`);
    }
  }
  if (missing.length > 0) {
    console.log('\n=== MISSING COLUMNS ===');
    console.log('Run this SQL in your Supabase SQL Editor:');
    console.log('');
    for (const col of missing) {
      const type = ['states_covered', 'languages_spoken'].includes(col) ? "TEXT[] DEFAULT '{}'" : col === 'price_per_watt' ? 'NUMERIC' : 'TEXT';
      console.log(`ALTER TABLE installers ADD COLUMN IF NOT EXISTS ${col} ${type};`);
    }
    console.log('\nNOTIFY pgrst, \'reload schema\';');
  } else {
    console.log('\nAll columns exist!');
  }
}

checkColumns().catch(console.error);
