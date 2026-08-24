import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://awxanbbjroyjahlknqvl.supabase.co';
const supabaseKey = 'sb_publishable_u45vVYMfisu3NVdOTIhKNQ_XQz-rhOL';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('questions').select('id, status').eq('id', 176);
  console.log(data, error);
}
run();
