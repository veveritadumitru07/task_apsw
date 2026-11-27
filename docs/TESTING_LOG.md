# Jurnal de testare — Evaluare TaskFlow

## Mediu
- Sistem de operare: Windows 11 <!-- modifică dacă e cazul -->
- Versiune Node.js (`node -v`): v22.x <!-- completează cu rezultatul comenzii -->
- Browser: Google Chrome
- Comenzi pornite: `npm install`, `npm run api` (port 3001), `npm run dev` (port 5173), `npm test`, `npm run build`

## Probleme identificate și remediate

| Nr. | Pași de reproducere | Comportament observat | Comportament așteptat | Soluție aplicată | Verificare |
|---|---|---|---|---|---|
| 1 | Deschide **Overview** și uită-te la cardul „In progress”. | Afișează `0`, deși în `db.json` există 2 sarcini „In progress”. | Cardul arată numărul real (2). | `Dashboard.jsx`: comparația folosea `'In Progress'` (P mare), iar datele au `'In progress'`. Am corectat textul. | Cardul afișează 2; după schimbarea statusului unei sarcini numărul se actualizează. |
| 2 | Pe **Overview**, în cardul „Recent tasks”, apasă **View all**. | Ruta `/task` nu există, aplicația te trimite înapoi pe Overview. | Se deschide lista de sarcini `/tasks`. | `Dashboard.jsx`: link-ul corectat din `/task` în `/tasks`. | Click pe „View all” → pagina „All tasks”. |
| 3 | În **Tasks**, alege status „In progress”. | Lista e goală („No tasks found”). | Apar sarcinile 1 și 6. | `Tasks.jsx`: filtrul transforma „In progress” în „In Progress”, care nu există în date. Am eliminat conversia, comparația e directă. | Test automat `statusul "In progress"…` + verificare manuală. |
| 4 | În **Tasks**, caută `ana` sau `mihai` (litere mici). | Nu găsește nimic după persoană; dacă o sarcină nu are câmpul `assignee` (ex. adăugată direct prin API), pagina dă eroare (`Cannot read properties of undefined`). | Căutarea după persoană nu ține cont de majuscule și nu se blochează la câmpuri lipsă. | Căutarea compară `title` și `assignee` cu `toLowerCase()`, ignoră spațiile de la capete și folosește `|| ''` pentru câmpuri lipsă. | Testele `căutarea după persoană…` și `câmpurile lipsă…`. |
| 5 | **Create task** → titlu format doar din spații + dată → Create. | Se creează o sarcină cu titlu gol. | Apare eroarea „A task title is required.” | `TaskForm.jsx`: validarea folosește `title.trim()`; valorile text sunt trimise fără spații în plus. | Formular cu titlu `"   "` → mesaj de eroare, nicio cerere POST. |
| 6 | Deschide o sarcină → **Edit task** → schimbă proiectul din select → **Save changes**. | `projectId` e salvat ca text (`"1"`), așa că numele proiectului dispare din detalii/listă și sarcina nu mai apare în pagina proiectului. | Sarcina rămâne legată de proiect. | `TaskDetails.jsx`: la editare `projectId` e convertit cu `Number()`, ca la creare. | Verificat în `db.json` (valoare numerică) și în pagina proiectului. |
| 7 | Deschide o sarcină → **Delete task** → confirmă. | Sarcina se șterge, dar ajungi pe Overview (ruta `/task` nu există). | Revii în lista de sarcini. | `TaskDetails.jsx`: `navigate('/tasks')`. | După ștergere se afișează „All tasks”, fără sarcina ștearsă. |
| 8 | **Projects** → **View project** pe orice card. | Ruta `/project/1` nu există → redirect pe Overview. | Se deschide `/projects/1`. | `Projects.jsx`: link corectat în `/projects/:id`. | Fiecare card deschide pagina proiectului corect. |
| 9 | Creează sau șterge o sarcină și uită-te la numărul de lângă **Tasks** în meniu. | Rămâne mereu `7` (valoare scrisă direct în cod). | Numărul real de sarcini. | `App.jsx`: numărul vine din API și se reîncarcă la fiecare schimbare de pagină. | Creare → 8, ștergere → 7. |
| 10 | Oprește API-ul (`npm run api`) și deschide **Overview** / **Projects**. | Overview arată „No tasks yet”, Projects arată o listă goală, fără nicio eroare (promisiune respinsă netratată în consolă). | Mesaj clar că datele nu au putut fi încărcate. | `Dashboard.jsx` și `Projects.jsx`: am adăugat `.catch()` și mesaj de eroare (`role="alert"`). | Cu API-ul oprit apare mesajul de eroare; cu API pornit totul funcționează normal. |

## Funcționalitate nouă — filtrare după prioritate

- **Ce am implementat:** un select „All priorities / Low / Medium / High” în bara de filtre din pagina **Tasks**. Logica de filtrare e mutată în `src/utils/filterTasks.js` (funcție pură, testată separat).
- **Cum se folosește:** alegi prioritatea din select; se combină cu căutarea și cu filtrul de status. Butonul **Reset filters** apare când un filtru e activ și le resetează pe toate. În starea goală există și butonul **Clear filters**.
- **Cum am verificat criteriile de acceptare:**
  - selectare prioritate sau „All priorities” → testul `filtrul după prioritate…`;
  - combinare cu căutarea și statusul (AND, niciun criteriu nu îl anulează pe altul) → testele `prioritatea se combină cu statusul / căutarea`;
  - contorul „Showing X of Y tasks” folosește lista filtrată (anunțat și pentru cititoare de ecran cu `aria-live`);
  - starea goală: `Done` + `High` → „No tasks found” + „Clear filters”;
  - accesibilitate: `<label for>` pentru ambele select-uri (status și prioritate);
  - stil: același `filter-wrap` ca filtrul de status, iconiță `Flag`, responsive pe mobil.

## Teste automate

```bash
npm test
```

9 teste (`node:test`, fără dependențe în plus) pentru logica de filtrare: prioritate, status, căutare, combinații, rezultat gol, câmpuri lipsă și detectarea filtrelor active.

## Verificări finale
- [ ] `npm run build`
- [ ] CRUD verificat prin interfață (creare, citire, editare, ștergere)
- [ ] Navigarea între pagini verificată (Overview, Tasks, detalii, Projects, detalii proiect, rută inexistentă → Overview)
- [ ] Căutarea și filtrele verificate împreună
- [ ] Scenariu fără rezultate verificat
- [ ] Formular cu date invalide verificat (titlu gol/spații, fără dată)
- [x] `npm test` — 9/9 teste trec
- [x] PR descrie modificările și testele

## Limitări rămase
- Numărul din meniu se actualizează la schimbarea paginii, nu în timp real dacă `db.json` e modificat din afara aplicației.
- Proiectele noi nu pot fi create din interfață (funcționalitate marcată „coming soon” în aplicația inițială).
