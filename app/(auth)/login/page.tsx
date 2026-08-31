"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  signInWithEmail,
  signUpWithEmail,
  getUserRole,
  AppRole,
} from "@/server/supabase/auth";
import { getSupabaseClient } from "@/server/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<AppRole>("STUDENT");

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEmailVerificationPending, setIsEmailVerificationPending] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
        const userRole = await getUserRole(session.user.id);
        if (userRole === "STUDENT") {
          router.push("/dashboard");
        } else if (userRole === "MENTOR") {
          router.push("/overview");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (!isEmailVerificationPending) return;

    const intervalId = setInterval(async () => {
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        clearInterval(intervalId);
        const userRole = await getUserRole(data.session.user.id);
        if (userRole === "STUDENT") {
          router.push("/dashboard");
        } else if (userRole === "MENTOR") {
          router.push("/overview");
        }
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, [isEmailVerificationPending, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalEmail = email.replace(/['"]/g, '').trim().toLowerCase();
    if (!finalEmail.includes('@')) {
      finalEmail += '@example.com';
    }
    setErrorMsg("");
    setLoading(true);

    try {
      if (isSignUp) {
        const data = await signUpWithEmail(
            finalEmail,
            password,
            firstName,
            lastName,
            role,
        );
        const { user, session } = data;
        if (!user) throw new Error("Înregistrare eșuată.");

        if (!session) {
          setIsEmailVerificationPending(true);
          return;
        }

        if (role === "STUDENT") {
          router.push("/dashboard");
        } else if (role === "MENTOR") {
          router.push("/overview");
        }
      } else {
        const { user } = await signInWithEmail(finalEmail, password);
        if (!user) throw new Error("Autentificare eșuată.");

        const userRole = await getUserRole(user.id);

        if (userRole === "STUDENT") {
          router.push("/dashboard");
        } else if (userRole === "MENTOR") {
          router.push("/overview");
        } else {
          throw new Error("Rol necunoscut. Contactează suportul.");
        }
      }
    } catch (err: any) {
      setErrorMsg(
          err.message ||
          (isSignUp
              ? "Eroare la înregistrare."
              : "Eroare la conectare. Verifică datele."),
      );
    } finally {
      setLoading(false);
    }
  };

  if (isEmailVerificationPending) {
    return (
        <Card className="mx-auto max-w-2xl p-12 text-center space-y-6 mt-8 animate-in fade-in zoom-in duration-300">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
          <h2 className="text-2xl font-bold text-slate-900">Verifică-ți adresa de email</h2>
          <p className="text-slate-500">
            Am trimis un link de confirmare pe adresa <strong>{email}</strong>.<br/>
            Dă click pe acel link pentru a-ți activa contul, apoi vei fi conectat automat aici.
          </p>
        </Card>
    );
  }

  return (
      <Card className="p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isSignUp ? "Creare cont Skillpath" : "Autentificare Skillpath"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isSignUp
                ? "Completează datele pentru a te înregistra"
                : "Introdu datele contului pentru a continua"}
          </p>
        </div>

        {errorMsg && (
            <div className="mb-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700 font-medium text-center">
              {errorMsg}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
              <>
                <div>
                  <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-slate-700"
                  >
                    Prenume
                  </label>
                  <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-slate-700"
                  >
                    Nume
                  </label>
                  <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </>
          )}
          <div>
            <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
                id="email"
                name="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                required
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
            >
              Parolă
            </label>
            <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
                type={!isSignUp ? "submit" : "button"}
                onClick={
                  !isSignUp
                      ? undefined
                      : () => {
                        setIsSignUp(false);
                        setErrorMsg("");
                      }
                }
                variant={!isSignUp ? "primary" : "outline"}
                className="flex-1"
                disabled={loading}
            >
              {loading && !isSignUp ? "Se conectează..." : "Conectare"}
            </Button>
            <Button
                type={isSignUp ? "submit" : "button"}
                onClick={
                  isSignUp
                      ? undefined
                      : () => {
                        setIsSignUp(true);
                        setErrorMsg("");
                      }
                }
                variant={isSignUp ? "primary" : "outline"}
                className="flex-1"
                disabled={loading}
            >
              {loading && isSignUp ? "Se creează..." : "Înregistrare"}
            </Button>
          </div>
        </form>
      </Card>
  );
}