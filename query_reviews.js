import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkColumns() {
  const { data, error } = await supabase.from('reviews').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else if (data && data.length > 0) {
    console.log('Columns:', Object.keys(data[0]));
  } else {
    console.log('No rows, cannot infer columns this way. Let us query information_schema.');
    // In Supabase REST API, querying information_schema might require a raw RPC, 
    // but maybe we can just try to update a fake 'is_deleted' column and see if it fails.
  }
}
checkColumns();
