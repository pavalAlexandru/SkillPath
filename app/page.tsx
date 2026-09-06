import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/server/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Cine e deja autentificat merge direct la panoul lui.
  if (user) {
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

    const isMentor = profile?.role?.trim().toLowerCase() === 'mentor';
    redirect(isMentor ? '/overview' : '/dashboard');
  }

  return (
      <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white transition-colors dark:bg-slate-950 dark:text-slate-100">
        {/* Efect vizual fundal */}
        <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-indigo-200/50 blur-3xl dark:bg-indigo-950/40" />

        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-colors dark:border-slate-800/80 dark:bg-slate-900/80">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">SkillPath</span>
              <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:border-indigo-800/80 dark:bg-indigo-950/60 dark:text-indigo-300">
                Evaluare Tehnică
              </span>
            </div>
          </div>
        </header>

        {/* Secțiunea Principală (Hero) */}
        <main className="z-10 flex flex-1 items-center">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center lg:py-20">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-xs dark:border-indigo-800/60 dark:bg-indigo-950/50 dark:text-indigo-300">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Platformă inteligentă de testare și evoluție profesională
            </div>

            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl sm:leading-tight dark:text-white">
              Măsoară-ți abilitățile tehnice și atinge nivelul{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                următor
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-400">
              Teste adaptate pe categorii specifice, evaluări structurate conform standardelor din industrie, grafice de progres în timp real și recomandări de învățare personalizate.
            </p>

            {/* Butonul principal care trimite către Login */}
            <div className="mt-10 flex flex-col items-center justify-center gap-3">
              <Link
                  href="/login"
                  className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-9 py-4 text-base font-extrabold text-white shadow-lg shadow-indigo-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-indigo-600/35 active:translate-y-0 dark:bg-indigo-600 dark:shadow-indigo-950/50 dark:hover:bg-indigo-500"
              >
                Încearcă și tu
                <svg
                    className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Acces în contul de student sau mentor
              </span>
            </div>

            {/* Carduri de Prezentare */}
            <div className="mt-16 grid grid-cols-1 gap-6 text-left md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:border-slate-300 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/80 dark:hover:border-slate-700">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-lg text-indigo-600 dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-400">
                  📊
                </div>
                <h3 className="mb-2 text-base font-bold text-slate-900 dark:text-white">Evaluări pe Niveluri</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Întrebări calibrate precis pentru nivelurile Junior, Middle și Senior, bazate pe scenarii reale.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:border-slate-300 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/80 dark:hover:border-slate-700">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-lg text-emerald-600 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-400">
                  🚀
                </div>
                <h3 className="mb-2 text-base font-bold text-slate-900 dark:text-white">Sistem de Level-Up</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Obține un scor de minim 90% la toate categoriile unui nivel pentru a debloca automat nivelul următor.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:border-slate-300 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/80 dark:hover:border-slate-700">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-purple-100 bg-purple-50 text-lg text-purple-600 dark:border-purple-900/60 dark:bg-purple-950/60 dark:text-purple-400">
                  💡
                </div>
                <h3 className="mb-2 text-base font-bold text-slate-900 dark:text-white">Recomandări & Resurse</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Descoperă punctele slabe după fiecare test și primești link-uri directe de documentare pentru remediere.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="z-10 border-t border-slate-200 py-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <p>© {new Date().getFullYear()} SkillPath</p>
        </footer>
      </div>
  );
}