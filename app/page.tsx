import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/server/supabase/server';

export const dynamic = 'force-dynamic';

export default async function WelcomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Dacă utilizatorul este deja autentificat, mergem direct pe dashboard
  if (user) {
    redirect('/dashboard');
  }

  return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative">
        {/* Efect subtil de lumină în fundal */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Navbar lipicios pe toată lățimea paginii (Sticky Header) */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md transition-all">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black tracking-tight text-indigo-400">SkillPath</span>
              <span className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                            Evaluare Tehnică
                        </span>
            </div>
          </div>
        </header>

        {/* Secțiunea Hero & Prezentare */}
        <main className="flex-1 flex items-center z-10">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center lg:py-20">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Platformă inteligentă de testare și evoluție profesională
            </div>

            {/* Titlu Principal */}
            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-tight">
              Măsoară-ți abilitățile tehnice și atinge nivelul{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            următor
                        </span>
            </h1>

            {/* Descriere */}
            <p className="mx-auto mt-6 max-w-2xl text-base text-slate-400 sm:text-lg leading-relaxed">
              Teste adaptate pe categorii specifice, evaluări structurate conform standardelor din industrie, grafice de progres în timp real și recomandări de învățare personalizate.
            </p>

            {/* Singurul Buton Call-To-Action */}
            <div className="mt-10 flex flex-col items-center justify-center gap-3">
              <Link
                  href="/login"
                  className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-9 py-4 text-base font-extrabold text-white shadow-xl shadow-indigo-600/30 transition-all duration-200 hover:bg-indigo-500 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0"
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
              <span className="text-xs text-slate-400 font-medium">
                            Acces în contul de student sau mentor
                        </span>
            </div>

            {/* Beneficii / Feature Grid */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {/* Card 1 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xs transition hover:border-slate-700 hover:bg-slate-900/90">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20 text-lg">
                  📊
                </div>
                <h3 className="text-base font-bold text-white mb-2">Evaluări pe Niveluri</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Întrebări calibrate precis pentru nivelurile Junior, Middle și Senior, bazate pe scenarii reale.
                </p>
              </div>

              {/* Card 2 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xs transition hover:border-slate-700 hover:bg-slate-900/90">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20 text-lg">
                  🚀
                </div>
                <h3 className="text-base font-bold text-white mb-2">Sistem de Level-Up</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Obține un scor de minim 90% la toate categoriile unui nivel pentru a debloca automat nivelul următor.
                </p>
              </div>

              {/* Card 3 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xs transition hover:border-slate-700 hover:bg-slate-900/90">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 mb-4 border border-purple-500/20 text-lg">
                  💡
                </div>
                <h3 className="text-base font-bold text-white mb-2">Recomandări & Resurse</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Descoperă punctele slabe după fiecare test și primești link-uri directe de documentare pentru remediere.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer discret */}
        <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-400 z-10">
          <p>© {new Date().getFullYear()} SkillPath</p>
        </footer>
      </div>
  );
}