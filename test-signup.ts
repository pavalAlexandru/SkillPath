import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Signing up user...");
  const { data, error } = await supabase.auth.signUp({
    email: "test_duplicate_999@example.com",
    password: "Password123!",
  });
  console.log("Signup 1 result:", JSON.stringify({ data, error }, null, 2));

  console.log("Signing up SAME user again...");
  const { data: data2, error: error2 } = await supabase.auth.signUp({
    email: "test_duplicate_999@example.com",
    password: "Password123!",
  });
  console.log("Signup 2 result:", JSON.stringify({ data: data2, error: error2 }, null, 2));
}

main().catch(console.error);
