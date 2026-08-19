import { supabase } from "./client";

export type AppRole = "student" | "mentor";

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user;
}

export function getUserRole(
  user: { user_metadata?: { role?: string } } | null,
): AppRole | null {
  const role = user?.user_metadata?.role;

  if (role === "student" || role === "mentor" ) {
    return role;
  }

  return null;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}
