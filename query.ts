import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
async function run() {
    const { data: q } = await supabase.from('questions').select('*').order('id', { ascending: false }).limit(1);
    console.log("Last question:", q);
    if (q && q.length > 0) {
        const { data: o } = await supabase.from('question_options').select('*').eq('question_id', q[0].id);
        console.log("Options for this question:", o);
    }
}
run();
