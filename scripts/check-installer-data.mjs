// Diagnostic: check what's currently in the DB for the installer
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data, error } = await supabase
  .from('installers')
  .select('id, company_name, website, states_covered, business_hours, workflow, phone')
  .eq('slug', 'circlelink-technology-587')
  .single();

if (error) {
  console.error('Error:', error.message);
} else {
  console.log('company_name:', data.company_name);
  console.log('website:', JSON.stringify(data.website));
  console.log('states_covered:', JSON.stringify(data.states_covered));
  console.log('business_hours:', JSON.stringify(data.business_hours));
  console.log('workflow:', JSON.stringify(data.workflow)?.slice(0, 200));
  console.log('phone:', JSON.stringify(data.phone));
}
