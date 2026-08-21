const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
    const [key, ...val] = line.split('=');
    if (key) acc[key] = val.join('=');
    return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function run() {
    const { data: questions, error: qErr } = await supabase.from('questions').select('id, question_text, created_at').order('created_at', { ascending: false }).limit(3);
    console.log("Last 3 questions:", questions, qErr);

    if (questions && questions.length > 0) {
        const { data: options, error: oErr } = await supabase.from('question_options').select('*').eq('question_id', questions[0].id);
        console.log(`Options for question ${questions[0].id}:`, options, oErr);
    }
}
run();
