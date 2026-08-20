-- 1. Curățare date vechi
TRUNCATE public.question_options, public.questions, public.categories RESTART IDENTITY CASCADE;

-- 2. Inserare Categorii
INSERT INTO public.categories (id, name, description, level, is_active) OVERRIDING SYSTEM VALUE VALUES
                                                                                                    (1, 'Programming & OOP Basics', 'Fundamente de programare orientată pe obiecte, structuri de date și algoritmi', 'JUNIOR', true),
                                                                                                    (2, 'Version Control (Git)', 'Lucrul cu Git, GitHub, branching workflows și conflicte', 'JUNIOR', true),
                                                                                                    (3, 'SQL & Database Basics', 'Operații CRUD, interogări relaționale, constrângeri și modelare', 'JUNIOR', true),
                                                                                                    (4, 'Clean Code & Documentation', 'Scrierea de cod lizibil, mentenabil, refactoring și principii SOLID', 'JUNIOR', true);

-- 3. Inserare Întrebări Categoria 1 (OOP Basics: 5 EASY, 4 MEDIUM, 3 HARD)
INSERT INTO public.questions (id, category_id, question_text, difficulty, question_type, status, is_active) OVERRIDING SYSTEM VALUE VALUES
                                                                                                                                        (1, 1, 'Care concept OOP descrie cel mai bine ascunderea stării interne și a detaliilor de implementare ale unui obiect?', 'EASY', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (2, 1, 'Ce structură de date funcționează după principiul LIFO (Last In, First Out)?', 'EASY', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (3, 1, 'Care este rolul principal al unui constructor într-o clasă?', 'EASY', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (4, 1, 'Ce cuvânt cheie este folosit de regulă pentru a referi instanța curentă a clasei?', 'EASY', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (5, 1, 'Ce tip de relație există între clasa "Mașină" și clasa "Motor"?', 'EASY', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (6, 1, 'Ce caracteristică permite unei metode să aibă același nume, dar parametri diferiți în aceeași clasă?', 'MEDIUM', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (7, 1, 'Ce înseamnă că o clasă este abstractă într-un limbaj orientat pe obiecte?', 'MEDIUM', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (8, 1, 'Ce principiu OOP permite ca obiecte de tipuri derivate diferite să fie tratate unitar prin clasa de bază?', 'MEDIUM', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (9, 1, 'Ce structură de date asigură asocierea cheie-valoare cu căutare medie în timp constant O(1)?', 'MEDIUM', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (10, 1, 'Care este complexitatea de timp în cel mai nefavorabil caz (worst-case) pentru căutarea într-un Arbore Binar de Căutare nebalansat?', 'HARD', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (11, 1, 'Ce problemă arhitecturală apare la moștenirea multiplă atunci când două clase părinte derivă din aceeași clasă de bază (Diamond Problem)?', 'HARD', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (12, 1, 'Ce se întâmplă la nivel de memorie (Call Stack vs Heap) la apelul unei funcții recursive fără condiție de oprire?', 'HARD', 'SINGLE', 'APPROVED', true);

-- Opțiuni Categoria 1
INSERT INTO public.question_options (question_id, option_text, is_correct) VALUES
                                                                               (1, 'Moștenire (Inheritance)', false), (1, 'Încapsulare (Encapsulation)', true), (1, 'Polimorfism (Polymorphism)', false), (1, 'Abstractizare (Abstraction)', false),
                                                                               (2, 'Queue (Coadă)', false), (2, 'Stack (Stivă)', true), (2, 'Array (Vector)', false), (2, 'Linked List', false),
                                                                               (3, 'Inițializează starea inițială a unui obiect la instanțiere', true), (3, 'Distruge obiectul', false), (3, 'Oprește execuția programului', false), (3, 'Transformă clasa în interfață', false),
                                                                               (4, 'this (sau self)', true), (4, 'super', false), (4, 'base', false), (4, 'parent', false),
                                                                               (5, 'Compoziție / Agregare (HAS-A)', true), (5, 'Moștenire (IS-A)', false), (5, 'Polimorfism dinamic', false), (5, 'Generalizare pură', false),
                                                                               (6, 'Method Overloading (Supraîncărcare)', true), (6, 'Method Overriding (Suprascriere)', false), (6, 'Encapsulation', false), (6, 'Multiple Inheritance', false),
                                                                               (7, 'Nu poate fi instanțiată direct prin operatorul new', true), (7, 'Nu poate avea metode implementate', false), (7, 'Este doar Singleton', false), (7, 'Nu poate fi moștenită', false),
                                                                               (8, 'Polimorfism', true), (8, 'Serializare', false), (8, 'Compilare', false), (8, 'Imutabilitate', false),
                                                                               (9, 'Hash Table / Map / Dicționar', true), (9, 'Vector nesortat', false), (9, 'Listă simplu înlănțuită', false), (9, 'Arbore Binar de Căutare', false),
                                                                               (10, 'O(n)', true), (10, 'O(log n)', false), (10, 'O(1)', false), (10, 'O(n log n)', false),
                                                                               (11, 'Ambiguitate în rezolvarea metodelor moștenite din rădăcina comună', true), (11, 'Blocare la compilare din lipsă de memorie', false), (11, 'Transformarea automată a metodelor în statice', false), (11, 'Imposibilitatea definirii de constructori', false),
                                                                               (12, 'Stiva de apeluri (Call Stack) depășește limita alocată generând StackOverflowError', true), (12, 'Heap-ul este curățat instant de Garbage Collector', false), (12, 'Variabilele locale devin globale', false), (12, 'Procesorul trece automat în mod single-thread', false);

-- 4. Inserare Întrebări Categoria 2 (Git: 5 EASY, 4 MEDIUM, 2 HARD)
INSERT INTO public.questions (id, category_id, question_text, difficulty, question_type, status, is_active) OVERRIDING SYSTEM VALUE VALUES
                                                                                                                                        (13, 2, 'Ce comandă Git creează un nou branch și trece imediat pe acesta?', 'EASY', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (14, 2, 'Ce fișier este utilizat pentru a indica fișierele pe care Git trebuie să le ignore la urmărire?', 'EASY', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (15, 2, 'Ce comandă adaugă toate fișierele modificate în zona de Staging (index)?', 'EASY', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (16, 2, 'Ce comandă afișează istoricul commit-urilor realizate în repository?', 'EASY', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (17, 2, 'Ce utilitate are comanda "git status"?', 'EASY', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (18, 2, 'Ce comandă salvează temporar modificările nelivrate (uncommitted) într-un stash?', 'MEDIUM', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (19, 2, 'Care este diferența principală dintre git fetch și git pull?', 'MEDIUM', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (20, 2, 'Când apare de obicei un Merge Conflict în Git?', 'MEDIUM', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (21, 2, 'Ce reprezintă un Pull Request (PR) pe GitHub / GitLab?', 'MEDIUM', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (22, 2, 'Ce diferență există între "git reset --soft HEAD~1" și "git reset --hard HEAD~1"?', 'HARD', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (23, 2, 'Ce operație realizează comanda "git rebase main" executată pe un feature branch?', 'HARD', 'SINGLE', 'APPROVED', true);

-- Opțiuni Categoria 2
INSERT INTO public.question_options (question_id, option_text, is_correct) VALUES
                                                                               (13, 'git checkout -b <nume_branch>', true), (13, 'git branch -new <nume>', false), (13, 'git pull origin <nume>', false), (13, 'git commit -b <nume>', false),
                                                                               (14, '.gitignore', true), (14, '.gitconfig', false), (14, '.gitkeep', false), (14, '.gitexclude', false),
                                                                               (15, 'git add .', true), (15, 'git stage all', false), (15, 'git commit -a', false), (15, 'git push -u', false),
                                                                               (16, 'git log', true), (16, 'git status', false), (16, 'git history', false), (16, 'git show-all', false),
                                                                               (17, 'Afișează starea fișierelor din working tree și staging', true), (17, 'Pornește serverul', false), (17, 'Rulează testele', false), (17, 'Face backup pe cloud', false),
                                                                               (18, 'git stash', true), (18, 'git save', false), (18, 'git pause', false), (18, 'git backup', false),
                                                                               (19, 'git pull descarcă modificările și face automat merge, în timp ce git fetch doar le descarcă', true), (19, 'git fetch șterge branch-urile remote', false), (19, 'git pull este doar pentru fișiere noi', false), (19, 'Sunt comenzi identice', false),
                                                                               (20, 'Când doi dezvoltatori au modificat aceleași linii de cod în mod diferit pe branch-uri diferite', true), (20, 'Când fișierul .gitignore este șters', false), (20, 'Când serverul nu are memorie', false), (20, 'Când un commit conține peste 10 fișiere', false),
                                                                               (21, 'O cerere de a analiza și îmbina (merge) codul dintr-un branch în altul', true), (21, 'O descărcare automată a dependințelor', false), (21, 'O ștergere de bază de date', false), (21, 'O blocare a repository-ului', false),
                                                                               (22, '--soft păstrează modificările în Staging, în timp ce --hard șterge complet modificările din fișiere', true), (22, '--soft șterge istoricul de pe GitHub, --hard doar local', false), (22, '--hard face commit automat cu mesaj gol', false), (22, 'Ambele comenzi au exact același efect', false),
                                                                               (23, 'Reaplică commit-urile din feature branch peste ultimul commit din main, creând un istoric liniar', true), (23, 'Șterge branch-ul main și îl înlocuiește cu feature', false), (23, 'Creează automat un merge commit de tip octopus', false), (23, 'Trimite codul direct în producție fără review', false);

-- 5. Inserare Întrebări Categoria 3 (SQL: 5 EASY, 4 MEDIUM, 2 HARD)
INSERT INTO public.questions (id, category_id, question_text, difficulty, question_type, status, is_active) OVERRIDING SYSTEM VALUE VALUES
                                                                                                                                        (24, 3, 'Ce clauză SQL este utilizată pentru a filtra înregistrările returnate de o interogare SELECT?', 'EASY', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (25, 3, 'Ce comandă SQL șterge toate înregistrările dintr-o tabelă fără a șterge structura tabelei?', 'EASY', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (26, 3, 'Ce funcție de agregare SQL calculează numărul total de rânduri dintr-o tabelă?', 'EASY', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (27, 3, 'Ce comandă SQL este utilizată pentru a modifica datele existente dintr-un tabel?', 'EASY', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (28, 3, 'Ce constrângere asigură că o coloană nu poate conține valori duplicate și nici NULL?', 'EASY', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (29, 3, 'Ce tip de JOIN returnează doar rândurile care au corespondență în ambele tabele?', 'MEDIUM', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (30, 3, 'Care este diferența dintre clauzele WHERE și HAVING?', 'MEDIUM', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (31, 3, 'Ce rol are o cheie externă (FOREIGN KEY)?', 'MEDIUM', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (32, 3, 'Ce rol are un INDEX într-o bază de date relațională?', 'MEDIUM', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (33, 3, 'Ce garantează proprietatea de Izolare (Isolation) din cadrul standardului ACID?', 'HARD', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (34, 3, 'Ce problemă de consistență apare atunci când o tranzacție citește date modificate de o altă tranzacție nefinalizată (Dirty Read)?', 'HARD', 'SINGLE', 'APPROVED', true);

-- Opțiuni Categoria 3
INSERT INTO public.question_options (question_id, option_text, is_correct) VALUES
                                                                               (24, 'WHERE', true), (24, 'ORDER BY', false), (24, 'GROUP BY', false), (24, 'LIMIT', false),
                                                                               (25, 'TRUNCATE TABLE (sau DELETE FROM)', true), (25, 'DROP TABLE', false), (25, 'ALTER TABLE DROP', false), (25, 'REMOVE ALL', false),
                                                                               (26, 'COUNT(*)', true), (26, 'SUM(*)', false), (26, 'TOTAL(*)', false), (26, 'AVG(*)', false),
                                                                               (27, 'UPDATE', true), (27, 'MODIFY', false), (27, 'CHANGE', false), (27, 'ALTER', false),
                                                                               (28, 'PRIMARY KEY', true), (28, 'FOREIGN KEY', false), (28, 'CHECK', false), (28, 'DEFAULT', false),
                                                                               (29, 'INNER JOIN', true), (29, 'LEFT JOIN', false), (29, 'FULL OUTER JOIN', false), (29, 'CROSS JOIN', false),
                                                                               (30, 'WHERE filtrează înainte de grupare, HAVING filtrează după agregare (GROUP BY)', true), (30, 'WHERE e doar la UPDATE, HAVING la SELECT', false), (30, 'HAVING e doar pentru numere', false), (30, 'Sunt identice', false),
                                                                               (31, 'Asigură integritatea referențială făcând legătura cu cheia primară a altei tabele', true), (31, 'Permite conexiuni externe', false), (31, 'Criptează parolele', false), (31, 'Face backup automat', false),
                                                                               (32, 'Accelerează viteza interogărilor de căutare/filtrare (SELECT)', true), (32, 'Criptează datele', false), (32, 'Reduce spațiul pe disc', false), (32, 'Previne ștergerea datelor', false),
                                                                               (33, 'Execuția concurentă a tranzacțiilor produce aceleași rezultate ca și cum s-ar executa secvențial', true), (33, 'Tranzacțiile sunt salvate pe discuri fizice separate', false), (33, 'Tabelele sunt blocate permanent pentru citire', false), (33, 'Datele nu pot fi vizualizate de administratori', false),
                                                                               (34, 'Tranzacția A citește date modificate de Tranzacția B care ulterior dă ROLLBACK', true), (34, 'Două tranzacții încearcă să creeze același tabel simultan', false), (34, 'Indicele tabelei este reconstruit greșit', false), (34, 'Baza de date rămâne fără spațiu de stocare', false);

-- 6. Inserare Întrebări Categoria 4 (Clean Code: 5 EASY, 4 MEDIUM, 2 HARD)
INSERT INTO public.questions (id, category_id, question_text, difficulty, question_type, status, is_active) OVERRIDING SYSTEM VALUE VALUES
                                                                                                                                        (35, 4, 'Ce principiu Clean Code susține că o clasă sau funcție trebuie să aibă un singur motiv de a se schimba?', 'EASY', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (36, 4, 'Ce semnifică principiul DRY în ingineria software?', 'EASY', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (37, 4, 'Ce semnifică principiul KISS în dezvoltarea de software?', 'EASY', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (38, 4, 'Cum ar trebui să fie denumită o funcție curată conform standardelor Clean Code?', 'EASY', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (39, 4, 'Ce este un "Magic Number" în programare și de ce ar trebui evitat?', 'EASY', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (40, 4, 'Ce semnifică Boy Scout Rule în dezvoltarea de software?', 'MEDIUM', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (41, 4, 'Care este rolul principal al testelor unitare (Unit Tests)?', 'MEDIUM', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (42, 4, 'Ce semnifică conceptul de Code Smells?', 'MEDIUM', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (43, 4, 'Când este util un comentariu în cod conform bunelor practici?', 'MEDIUM', 'SINGLE', 'APPROVED', true),
                                                                                                                                        (44, 4, 'Ce impune principiul Liskov Substitution (L din SOLID)?', 'HARD', 'SINGLE', 'APPROVED', true);

-- Opțiuni Categoria 4
INSERT INTO public.question_options (question_id, option_text, is_correct) VALUES
                                                                               (35, 'Single Responsibility Principle (SRP)', true), (35, 'Open-Closed Principle (OCP)', false), (35, 'Liskov Substitution Principle', false), (35, 'Interface Segregation', false),
                                                                               (36, 'Don''t Repeat Yourself (evitarea duplicării logicii)', true), (36, 'Do Refactor Yearly', false), (36, 'Document Ready Yield', false), (36, 'Debug Rapidly Yourself', false),
                                                                               (37, 'Keep It Simple, Stupid (păstrarea simplității)', true), (37, 'Knowledge Is Software Strength', false), (37, 'Keep Interfaces Strictly Small', false), (37, 'Key Infrastructure Standard', false),
                                                                               (38, 'Să înceapă cu un verb și să descrie clar intenția (ex: calculateTotalPrice)', true), (38, 'Să fie cât mai scurtă (ex: ctp)', false), (38, 'Să conțină data creării', false), (38, 'Să fie scrisă doar cu majuscule', false),
                                                                               (39, 'O valoare numerică literală codată direct fără explicație; trebuie înlocuită cu constante numite', true), (39, 'Un număr prim folosit la criptare', false), (39, 'Un ID generat automat', false), (39, 'O variabilă numerică', false),
                                                                               (40, 'Lasă codul pe care l-ai editat mai curat decât l-ai găsit', true), (40, 'Scrie teste înainte de cod', false), (40, 'Nu modifica codul scris de un coleg', false), (40, 'Documentează fiecare linie', false),
                                                                               (41, 'Verifică izolarea și corectitudinea celor mai mici unități logice de cod (funcții/metode)', true), (41, 'Testează viteza serverului', false), (41, 'Verifică grafica', false), (41, 'Înlocuiesc documentația', false),
                                                                               (42, 'Indicii sau simptome în cod care sugerează o problemă mai profundă de design', true), (42, 'Erori de sintaxă', false), (42, 'Fișiere șterse dar păstrate în memorie', false), (42, 'Librării externe expirate', false),
                                                                               (43, 'Pentru a explica "DE CE" a fost luată o decizie complexă, nu "CE" face codul evident', true), (43, 'Pentru a traduce fiecare linie', false), (43, 'Pentru a înlocui denumirile clare', false), (43, 'Pentru a păstra cod vechi comentat', false),
                                                                               (44, 'Obiectele unei clase derivate trebuie să poată înlocui obiectele clasei de bază fără a altera corectitudinea programului', true), (44, 'Toate clasele trebuie să aibă cel puțin două interfețe implementate', false), (44, 'Clasele derivate nu au voie să adauge metode noi', false), (44, 'Toate variabilele membre trebuie să fie protected', false);

-- 7. Politici Row Level Security (RLS) pentru citire publică
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read questions" ON public.questions;
CREATE POLICY "Allow public read questions" ON public.questions FOR SELECT USING (true);

ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read question_options" ON public.question_options;
CREATE POLICY "Allow public read question_options" ON public.question_options FOR SELECT USING (true);