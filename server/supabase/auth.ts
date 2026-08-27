import { supabase } from "./client";

export type AppRole = "STUDENT" | "MENTOR";

export function normalizeAppRole(value: unknown): AppRole | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "student") {
    return "STUDENT";
  }

  if (normalized === "mentor") {
    return "MENTOR";
  }

  return null;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function getUserRole(userId: string): Promise<AppRole | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Eroare la preluarea rolului:", error.message);
    return null;
  }

  return normalizeAppRole(data?.role);
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}


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
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        role: role,
      }
    }
  });
  if (error) throw error;
  if (data.user?.identities && data.user.identities.length === 0) {
    throw new Error("Un cont cu acest email există deja.");
  }

  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").upsert({
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
      const { error: studentError } = await supabase.from("student_profiles").upsert({
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
