# SkillPath

Platformă de evaluare pentru programatori juniori. Studentul își măsoară nivelul pe categorii prin teste grilă și avansează de la Junior la Middle și Senior. Mentorul întreține categoriile și întrebările, aprobă propunerile studenților și generează întrebări noi cu AI.

Aplicație live: _[completați link-ul Vercel]_

## Cuprins

- [Funcționalități](#funcționalități)
- [Tehnologii](#tehnologii)
- [Pornire locală](#pornire-locală)
- [Variabile de mediu](#variabile-de-mediu)
- [Testare](#testare)
- [Scripturi](#scripturi)
- [Structura proiectului](#structura-proiectului)
- [Documentație](#documentație)
- [Deploy](#deploy)

## Funcționalități

**Student**

- Test de onboarding care stabilește nivelul de start
- Teste pe fiecare categorie a nivelului curent, cu un indiciu AI per test
- Mod surpriză: întrebări amestecate din toate categoriile nivelului
- Level-up automat când toate categoriile nivelului au cel puțin 90%
- Dashboard cu progres, istoric de scoruri, radar pe categorii, serie de zile, insigne
- Recomandări de învățare generate de AI din răspunsurile greșite
- Propunere de întrebări noi, cu notificare la aprobare sau respingere

**Mentor**

- Panou cu activitatea studenților și distribuția pe nivele și scoruri
- Gestionare categorii (cu nivel) și întrebări
- Aprobare, editare sau respingere a propunerilor
- Generare de întrebări cu AI, pe categorie, tip și dificultate, cu limită zilnică
- Analiză AI a întrebărilor la care greșesc cei mai mulți studenți
- Gestionare studenți: activare, promovare la mentor

**Comun**: forum în timp real, setări de profil, avatar, dark mode.

## Tehnologii

| Strat | Tehnologie |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, Server Actions), React 19 |
| Stil | Tailwind CSS 4 |
| Date și auth | Supabase (Postgres cu RLS, Auth, Realtime, Storage) |
| AI | Google Gemini prin `@google/genai`, cu cascadă de modele |
| Validare | Zod |
| Teste | Vitest, Testing Library |
| Hosting | Vercel |

Detalii despre cum sunt legate între ele: [docs/arhitectura.md](docs/arhitectura.md).

## Pornire locală

### Cerințe

- Node.js 20.9 sau mai nou (proiectul e dezvoltat pe Node 22)
- npm
- Acces la un proiect Supabase (vezi mai jos)
- O cheie API Gemini, de la [Google AI Studio](https://aistudio.google.com/apikey)

### Pași

1. Clonează și instalează dependențele:

   ```bash
   git clone https://github.com/pavalAlexandru/SkillPath.git
   cd SkillPath
   npm install
   ```

2. Creează fișierul de mediu din model și completează valorile:

   ```bash
   cp .env.example .env.local
   ```

   Ce înseamnă fiecare variabilă e la [Variabile de mediu](#variabile-de-mediu).

3. Pornește serverul de dezvoltare:

   ```bash
   npm run dev
   ```

   Aplicația rulează la http://localhost:3000.

4. Creează-ți un cont din pagina de login. La înregistrare alegi rolul: student sau mentor.

### Baza de date

Cea mai simplă variantă este să folosești proiectul Supabase al echipei: cere URL-ul și cheia publică de la un coleg și pune-le în `.env.local`. Nu ai nevoie de nimic altceva.

Pentru un proiect Supabase nou, în `supabase/` există:

| Fișier | Conține |
|---|---|
| `migrations/` | tabela de chat și publicația Realtime |
| `profile_policies.sql` | RLS pentru `profiles` și `student_profiles` |
| `mentor_policies.sql` | RLS pentru `questions` și `question_options` |
| `notifications.sql` | tabela `notifications` cu RLS |
| `../server/supabase/seed.sql` | categorii și întrebări de pornire |

Tabelele de bază (`profiles`, `categories`, `questions`, `assessments` și restul) nu au încă un script SQL în repo. Structura lor completă este descrisă în [docs/arhitectura.md](docs/arhitectura.md#6-modelul-de-date). Pe lângă tabele, un proiect nou are nevoie și de un bucket public de Storage numit `avatars`.

### Tipuri generate

Când se schimbă schema bazei de date, regenerează tipurile TypeScript:

```bash
npm run gen:types
```

## Variabile de mediu

Fișierul `.env.local` nu se pune în git. Modelul este `.env.example`.

| Variabilă | Obligatorie | Scop |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | da | URL-ul proiectului Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | da | cheia publică; toate cererile trec prin RLS |
| `GEMINI_API_KEY` | da | generare de întrebări, indicii, recomandări, analize |
| `SUPABASE_SERVICE_ROLE_KEY` | doar teste de integrare | curățarea datelor de test; ocolește RLS, nu o pune niciodată în cod de client |
| `TEST_USER_PASSWORD` | doar teste de integrare | parola conturilor de test |

Valorile Supabase se găsesc în dashboard-ul proiectului, la Project Settings → API.

## Testare

### Teste unitare

Nu au nevoie de nimic extern: Supabase și AI-ul sunt simulate.

```bash
npm test
```

Cu raport de acoperire:

```bash
npm run test:coverage
```

Acoperă logica de scor și de nivel, server actions, componente. Fișierele stau în `unit-tests/`.

### Teste de integrare

Rulează server actions reale pe un proiect Supabase, cap-coadă: propunere și aprobare, test și scor, dashboard, notificări, chat, acțiuni de mentor.

Au nevoie de:

- `SUPABASE_SERVICE_ROLE_KEY` și `TEST_USER_PASSWORD` în `.env.local`
- două conturi existente în proiectul Supabase: `student@test.com` (rol student) și `mentor@test.com` (rol mentor), ambele cu parola din `TEST_USER_PASSWORD`

```bash
npm run test:integration
```

Testele scriu și șterg date, deci nu le rula pe proiectul de producție. Fișierele stau în `integration-tests/`.

### Lint

```bash
npm run lint
```

## Scripturi

| Comandă | Ce face |
|---|---|
| `npm run dev` | server de dezvoltare |
| `npm run build` | build de producție |
| `npm start` | pornește build-ul |
| `npm run lint` | ESLint |
| `npm test` | teste unitare |
| `npm run test:coverage` | teste unitare cu acoperire |
| `npm run test:integration` | teste de integrare pe Supabase |
| `npm run gen:types` | regenerează tipurile din schema Supabase |

## Structura proiectului

```
app/                  rute (App Router): (auth), (student), (mentor), forum, settings
components/           componente React, grupate pe domeniu
server/actions/       server actions, un fișier per domeniu
server/supabase/      clienți Supabase și servicii de citire
lib/                  logică pură: niveluri, cenzură, navigație
config/               valori configurabile: teste, praguri, limite AI
supabase/             migrații și politici RLS
unit-tests/           teste unitare
integration-tests/    teste de integrare
proxy.ts              control acces pe fiecare cerere
docs/                 documentație
```

## Documentație

- [Arhitectura aplicației](docs/arhitectura.md): componente, cum trece o cerere, modelul de date, fluxurile principale, limitări cunoscute

## Deploy

Aplicația se publică pe Vercel. Fiecare push pe `main` face deploy automat, iar fiecare PR primește un preview. Variabilele din [Variabile de mediu](#variabile-de-mediu) trebuie setate în proiectul Vercel; cele pentru testele de integrare nu sunt necesare acolo.
