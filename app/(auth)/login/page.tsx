"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { signInWithEmail, getUserRole } from "@/server/supabase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const { user } = await signInWithEmail(email, password);
      if (!user) throw new Error("Autentificare eșuată.");

      const role = await getUserRole(user.id);

      if (role === "STUDENT") {
        router.push("/dashboard");
      } else if (role === "MENTOR") {
        router.push("/questions");
      } else {
        throw new Error("Rol necunoscut. Contactează suportul.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Eroare la conectare. Verifică datele.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Autentificare Skillpath
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Introdu datele contului pentru a continua
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700 font-medium text-center">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
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
            type="email"
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
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Se conectează..." : "Conectare"}
        </Button>
      </form>
    </Card>
  );
}
