# Plan de Testare QA - Scenarii Funcționale SkillPath

Acest document reflectă arhitectura completă a platformei. Fiecare caz de test a fost extras pe baza analizei directe a interfețelor, componentelor și endpoint-urilor din codebase. Nu conține date specifice (ex. nume hardcodate), utilizând doar actorii generici (Student, Mentor).

---

## 1. Fluxul de Autentificare și Sesiune (AUTH)

| ID Caz | Actor | Precondiții | Pași de Reproducere (Acțiune) | Rezultat Așteptat |
|:---|:---|:---|:---|:---|
| **AUTH-01** | Student | Cont inexistent | 1. Accesare `/login`.<br>2. Selectează "Înregistrare".<br>3. Introduce Prenume, Nume, Email, Parolă.<br>4. Apasă "Înregistrare". | Se creează rânduri în `profiles` și `student_profiles` (nivel "JUNIOR"). UI-ul intră în starea "Verifică-ți adresa de email". |
| **AUTH-02** | Student | Precondiție AUTH-01 | 1. Dă click pe linkul din email.<br>2. Așteaptă polling-ul la 2 secunde pe pagina de login inițială. | Odată cu validarea sesiunii, polling-ul se oprește. Studentul este redirecționat automat către `/dashboard`. |
| **AUTH-03** | Student | Cont existent | 1. Accesare `/login`.<br>2. Introduce datele contului.<br>3. Apasă "Conectare". | Autentificarea reușește. Utilizatorul este redirecționat pe `/dashboard`. |
| **AUTH-04** | Mentor | Cont existent | 1. Accesare `/login`.<br>2. Introduce datele contului de mentor.<br>3. Apasă "Conectare". | Autentificarea reușește. Redirecționare automată spre `/overview` (Dashboard Mentor). |
| **AUTH-05** | Oricare | Cont existent | 1. Accesare `/login`.<br>2. Introduce parolă greșită.<br>3. Apasă "Conectare". | UI-ul prinde eroarea de la server și afișează un banner roșu cu "Eroare la conectare. Verifică datele." (nu se face nicio redirecționare). |
| **AUTH-06** | Oricare | Autentificat | 1. Click pe Navbar/Meniu utilizator.<br>2. Apasă "Deconectare". | Sesiunea Supabase este distrusă (`supabase.auth.signOut`). Redirecționare pe `/login`. |

## 2. Profil și Setări (PROFILE)

| ID Caz | Actor | Precondiții | Pași de Reproducere (Acțiune) | Rezultat Așteptat |
|:---|:---|:---|:---|:---|
| **PROF-01** | Oricare | Autentificat | 1. Navigare pe `/settings`.<br>2. Modifică valorile pentru "Prenume" și "Nume".<br>3. Apasă "Salvează". | UI-ul afișează un mesaj de succes. Numele se actualizează global (ex: în Navbar). |
| **PROF-02** | Oricare | Autentificat | 1. Navigare pe `/settings`.<br>2. Click pe componenta `AvatarUpload` (poza de profil).<br>3. Selectează o imagine validă și acceptă încărcarea. | Imaginea este încărcată în bucket-ul Supabase `avatars`, tabelul `profiles` își face update la `avatar_url`, iar poza este schimbată instant pe platformă. |

## 3. Testare, Gamificare și Progresie (ASSESS)

| ID Caz | Actor | Precondiții | Pași de Reproducere (Acțiune) | Rezultat Așteptat |
|:---|:---|:---|:---|:---|
| **ASSESS-01** | Student | Prima logare | 1. În dashboard, dă click pe "Test de plasare".<br>2. Răspunde la un număr de întrebări egal cu `ASSESSMENT_CONFIG.onboardingQuestionCount`.<br>3. Trimite testul. | Punctajul este stocat. Orice răspuns greșit generează marcarea unei "Arii Slabe" (Weak Areas) în profilul de performanță. |
| **ASSESS-02** | Student | Nivel Junior | 1. Pornește un test standard dintr-o categorie.<br>2. Răspunde intenționat greșit la multe întrebări (Scor < 60%).<br>3. Finalizează testul. | Componenta `AssessmentResultCard` afișează că scorul este insuficient. Nivelul studentului rămâne Junior. |
| **ASSESS-03** | Student | Nivel Junior | 1. Pornește un test standard.<br>2. Obține scor peste pragul minim (`passingScorePercentage`).<br>3. Finalizează. | UI-ul afișează ecranul de celebrare cu mesajul "Nivelul tău este acum MIDDLE". Statusul avansează în DB. |
| **ASSESS-04** | Student | În Dashboard | 1. Găsește `SurpriseModeBanner` (Modul Surpriză).<br>2. Click "Începe testul mixt".<br>3. Finalizează testul. | Endpoint-ul construiește testul ignorând o categorie fixă, folosind `is_surprise_mode: true`. Testul se adaugă la istoricul general. |
| **ASSESS-05** | Student | Nivel oarecare | 1. Finalizează un test obținând scorul maxim (100% răspunsuri corecte). | Funcția de evaluare deblochează badge-ul de achievement "Perfecționist". Acesta apare colorat în dashboard (în grila Achievements). |

## 4. Propuneri de Întrebări (PROP)

| ID Caz | Actor | Precondiții | Pași de Reproducere (Acțiune) | Rezultat Așteptat |
|:---|:---|:---|:---|:---|
| **PROP-01** | Student | Autentificat | 1. Accesare `/propose`.<br>2. Adaugă enunț, variante, alege 1 variantă corectă.<br>3. Apasă "Trimite propunerea". | Propunerea este stocată cu statusul `PENDING`. Formularul se curăță. |
| **PROP-02** | Student | Autentificat | 1. Navighează pe `/propose`.<br>2. Completează enunțul și opțiunile dar **NU** bifează nicio variantă ca fiind corectă.<br>3. Trimite formularul. | Validarea server/client împiedică trimiterea și afișează eroare: cel puțin o opțiune trebuie să fie corectă. |
| **PROP-03** | Mentor | O propunere PENDING e creată | 1. Navigare pe `/proposals`.<br>2. Caută propunerea studentului și dă click pe "Aprobă". | Propunerea este mutată în tabela principală de întrebări (activată). Studentul primește notificare pe clopoțel cu aprobarea. |
| **PROP-04** | Mentor | O propunere PENDING e creată | 1. Pe `/proposals`, găsește propunerea și dă click pe "Respinge".<br>2. Completează input-ul cu motivul (ex. "Incorect formulat").<br>3. Confirmă respingerea. | Statusul propunerii se schimbă în `REJECTED`. O notificare text completă pleacă spre student. |
| **PROP-05** | Student | PROP-04 e realizat | 1. Logare pe platformă.<br>2. Click pe componenta `NotificationWidget` din Navbar. | Widgetul afișează lista de notificări. Studentul citește notificarea de respingere și motivul scris de mentor. Notificarea poate fi marcată ca citită/ștersă. |

## 5. Administrare și Funcții AI (MENTOR)

| ID Caz | Actor | Precondiții | Pași de Reproducere (Acțiune) | Rezultat Așteptat |
|:---|:---|:---|:---|:---|
| **MENTOR-01** | Mentor | Autentificat | 1. Navigare pe pagina `/questions`.<br>2. Folosește butoanele "Înainte/Înapoi" pentru paginare. | Tabelul randează o listă paginată de întrebări împărțite pe categorii. Numărul total și offsetul curent se actualizează corect. |
| **MENTOR-02** | Mentor | Autentificat | 1. În lista de întrebări (`/questions`), identifică o întrebare Activă.<br>2. Click pe "Dezactivează" (`toggleQuestionActive`). | Funcția Server Action face update pe baza de date setând `is_active: false`. Întrebarea nu mai e livrată studenților la teste. |
| **MENTOR-03** | Mentor | Au fost date teste | 1. Navigare spre subsecțiunea care afișează "Top Problematic Questions".<br>2. Alege filtrul de categorie "ALL". | Se apelează acțiunea `getTopProblematicQuestions`. Se afișează statistici corecte despre care sunt întrebările cu cea mai mare rată de greșeală din rândul studenților. |
| **MENTOR-04** | Mentor | Există categorii definite | 1. Pe interfața de Mentori, accesează funcția `AiQuestionGenerator`.<br>2. Selectează Categoria, Tipul "Single" și Dificultatea, solicitând de ex. 3 întrebări.<br>3. Dă click pe "Generează cu AI". | Server-ul folosește API-ul integrat, generând întrebările și opțiunile aferente. La final apar 3 întrebări noi de review. Validează limita zilnică (ex. 10/zi, config). |

## 6. Comunitate (FORUM)

| ID Caz | Actor | Precondiții | Pași de Reproducere (Acțiune) | Rezultat Așteptat |
|:---|:---|:---|:---|:---|
| **FORUM-01** | Oricare | Există mesaje în forum | 1. Navigare la `/forum`.<br>2. În bara de căutare (Search), tastează un cuvânt cheie.<br>3. Dă submit la căutare. | Endpointul filtrează `chat_messages` folosind comanda `.ilike('content', %keyword%)`. Bula chatului se redesenează cu rezultatele potrivite. |
| **FORUM-02** | Oricare | Autentificat | 1. Pe `/forum`, scrie în input box un mesaj perfect normal ("Salut!").<br>2. Dă Enter. | Mesajul e salvat (Server action `sendMessage`). ChatCanvas preia datele și afișează imediat postarea, incluzând poza de profil și badge-ul de rol. |
| **FORUM-03** | Oricare | Autentificat | 1. Pe `/forum`, scrie un mesaj care include un cuvânt aflat în fișierul de cenzură `badwords.json`.<br>2. Dă Enter. | Mesajul este transmis spre baza de date exact cum a fost scris. La randare (`getRecentMessages`), funcția de utilitate `censorText` detectează cuvântul folosind RegEx și afișează pe ecran `####` în loc, fără a bloca funcționarea forumului. |
