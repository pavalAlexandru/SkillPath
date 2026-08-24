const fs = require('fs');
const file = '/home/andu/skill-path/server/supabase/auth.ts';
let content = fs.readFileSync(file, 'utf8');

const signUpFunction = `
export async function signUpWithEmail(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: AppRole
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  
  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      email: email,
      first_name: firstName,
      last_name: lastName,
      role: role,
    });
    
    if (profileError) {
      console.error("Profile creation error", profileError);
      throw profileError;
    }

    if (role === "STUDENT") {
      const { error: studentError } = await supabase.from("student_profiles").insert({
        user_id: data.user.id,
        current_level: "JUNIOR",
      });
      if (studentError) {
        console.error("Student profile creation error", studentError);
        throw studentError;
      }
    }
  }

  return data;
}
`;

content = content + "\n" + signUpFunction;
fs.writeFileSync(file, content);
