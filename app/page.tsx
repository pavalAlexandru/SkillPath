import Link from 'next/link';

export default function HomePage() {
  return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
        {/* Efect vizual fundal */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200/50 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-all">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black tracking-tight text-indigo-600">SkillPath</span>
              <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-700">
              Evaluare Tehnică
            </span>
            </div>
          </div>
        </header>

        {/* Secțiunea Principală (Hero) */}
        <main className="flex-1 flex items-center z-10">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center lg:py-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-4 py-1.5 text-xs font-semibold text-indigo-700 mb-8 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Platformă inteligentă de testare și evoluție profesională
            </div>

            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl sm:leading-tight">
              Măsoară-ți abilitățile tehnice și atinge nivelul{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              următor
            </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base text-slate-600 sm:text-lg leading-relaxed">
              Teste adaptate pe categorii specifice, evaluări structurate conform standardelor din industrie, grafice de progres în timp real și recomandări de învățare personalizate.
            </p>

            {/* Butonul principal care trimite către Login */}
            <div className="mt-10 flex flex-col items-center justify-center gap-3">
              <Link
                  href="/login"
                  className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-9 py-4 text-base font-extrabold text-white shadow-lg shadow-indigo-600/25 transition-all duration-200 hover:bg-indigo-700 hover:shadow-indigo-600/35 hover:-translate-y-0.5 active:translate-y-0"
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
              <span className="text-xs text-slate-500 font-medium">
              Acces în contul de student sau mentor
            </span>
            </div>

            {/* Carduri de Prezentare */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:border-slate-300 hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-4 border border-indigo-100 text-lg">
                  📊
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Evaluări pe Niveluri</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Întrebări calibrate precis pentru nivelurile Junior, Middle și Senior, bazate pe scenarii reale.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:border-slate-300 hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-4 border border-emerald-100 text-lg">
                  🚀
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Sistem de Level-Up</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Obține un scor de minim 90% la toate categoriile unui nivel pentru a debloca automat nivelul următor.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:border-slate-300 hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 mb-4 border border-purple-100 text-lg">
                  💡
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Recomandări & Resurse</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Descoperă punctele slabe după fiecare test și primești link-uri directe de documentare pentru remediere.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 z-10">
          <p>© {new Date().getFullYear()} SkillPath</p>
        </footer>
      </div>
  );
}