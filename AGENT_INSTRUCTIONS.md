# Job Board Agent - Instruktioner

## Syfte
Hitta och addera nya lediga jobb till job board-applikationen utan att skapa dubletter.

---

## 1. API Endpoints

### Hämta alla befintliga jobb
```
GET http://localhost:3000/api/jobs
```
Returtyp: JSON array med alla jobb

### Lägg till nytt jobb
```
POST http://localhost:3000/api/jobs
Content-Type: application/json

{
  "title": "string",
  "company": "string",
  "location": "string",
  "salary": "string",
  "url": "string",
  "score": number (0-100),
  "stage": "new",
  "source": "string",
  "description": "string",
  "education_level": "string (optional)"
}
```

---

## 2. Dubblett-Kontroll Algoritm

**INNAN du lägger till ett jobb, måste du:**

1. **Hämta alla befintliga jobb**
   ```
   GET /api/jobs
   ```

2. **Kontrollera om jobbet redan finns** - matcha på:
   - `title` (ignorera små bokstäver)
   - `company` (ignorera små bokstäver)
   - `location` (ignorera små bokstäver)

3. **Exempel på dubblett-check (pseudokod):**
   ```
   function isDuplicate(newJob, existingJobs) {
     return existingJobs.some(existing => 
       existing.title.toLowerCase() === newJob.title.toLowerCase() &&
       existing.company.toLowerCase() === newJob.company.toLowerCase() &&
       existing.location.toLowerCase() === newJob.location.toLowerCase()
     )
   }
   ```

4. **Om dubblett hittad:** 
   - Logga: "❌ DUBLETTER: [titel] @ [företag] finns redan"
   - Hoppa över detta jobb

5. **Om INTE dubblett:**
   - Logga: "✅ NYTT JOBB: [titel] @ [företag]"
   - POST till /api/jobs

---

## 3. Job Board Klassificering

Alla nya jobb startar med `"stage": "new"` (Ny-stadiet).

Möjliga stadier:
- `new` - Nytt jobb, ej granskat
- `relevant` - Markerat som relevant
- `applied` - Du har ansökt
- `interview` - Intervju schemalagd
- `rejected` - Du blev avslagna

---

## 4. Sökkällor (Prioritetsordning)

Sök på dessa svenska jobsajter:

1. **Indeed.se** - Største jobsajten
   - URL: https://se.indeed.com/jobb?q=junior&l=stockholm
   
2. **Jobbland.se** - Svenska jobb
   - URL: https://jobbland.se/lediga-jobb?q=junior&location=stockholm
   
3. **LinkedIn.se** - Professionellt nätverk
   - URL: https://www.linkedin.com/jobs/search/?keywords=junior&location=stockholm
   
4. **Arbetsförmedlingen.se** - Offentlig arbetsförmedling
   - URL: https://www.arbetsformedlingen.se/

5. **Jooble.org** - Jobbaggregator
   - URL: https://se.jooble.org/jobb-junior

---

## 5. Sökkriterier

**Sök efter jobb som matchar:**
- Nyckelord: `junior`, `trainee`, `praktikant`, `jr.`
- Platser: Stockholm, Göteborg, Malmö (eller "Remote", "Hela Sverige")
- Erfarenhet: 0-3 år
- Typ: Alla branscher OK (IT, ekonomi, försäljning, etc.)

**Undvik:**
- Ledande positioner (manager, chef)
- Specialiserad erfarenhet krävs (5+ år)
- Helt irrelevanta roller

---

## 6. Job Data Extraction

För varje jobb, extrahera:

| Fält | Källa | Notering |
|------|-------|----------|
| `title` | Jobbannonsens titel | T.ex. "Junior Försäljare", "Trainee Utvecklare" |
| `company` | Företagets namn | Exakt namn från annons |
| `location` | Stad/region | T.ex. "Stockholm", "Remote", "Göteborg" |
| `salary` | Löneangivelse | "35 000 SEK/månad" eller "Enligt överenskommelse" |
| `url` | Direktlänk till annons | Full URL från jobsajten |
| `score` | Beräknad matchning | 60-80 (din uppskattning) |
| `source` | Var du hittade det | "Indeed.se", "LinkedIn", "Jobbland.se" |
| `description` | Kortfattad sammanfattning | 1-3 meningar, vad jobbet handlar om |
| `education_level` | Utbildningskrav | "Gymnasium", "Högskola", null |

---

## 7. Execution Flow

```
FOR EACH jobsite IN ['Indeed.se', 'Jobbland.se', 'LinkedIn.se', ...]:
  
  1. Sök efter junior-jobb
  
  2. FOR EACH jobb hittad:
     
     a. Extrahera: title, company, location, salary, url, description
     
     b. Hämta alla befintliga jobb från /api/jobs
     
     c. Kontrollera dubblett:
        - Matcha title + company + location (case-insensitive)
        - Om redan finns → LOGGA och hoppa över
        - Om NY → fortsätt till steg d
     
     d. Skapa job-objekt:
        {
          title: "...",
          company: "...",
          location: "...",
          salary: "...",
          url: "...",
          score: 65-75,
          stage: "new",
          source: "[jobsite]",
          description: "...",
          education_level: null eller "..."
        }
     
     e. POST till /api/jobs
     
     f. LOGGA: "✅ TILLAGD: [title] @ [company]"
  
  3. Gå till nästa jobsite

SLUT: Rapportera resultat
- Antal nya jobb tillagda: X
- Antal dubletter ignorerade: Y
- Eventuella fel: Z
```

---

## 8. Logging/Output

Varje körning ska logga:

```
=== Job Board Agent - Körning [tid] ===

🔍 Söker på Indeed.se...
  ✅ NYTT: Junior Revisor @ Grant Thornton (ID: 15)
  ✅ NYTT: Junior HR @ Matchedin (ID: 16)
  ❌ DUBLETTER: Junior IT-support @ Liminity finns redan
  
🔍 Söker på Jobbland.se...
  ✅ NYTT: Junior Konstruktör @ Civilbyrån (ID: 17)
  ❌ DUBLETTER: Junior Revisor @ Grant Thornton finns redan

📊 RESULTAT:
  ✅ Nya jobb tillagda: 3
  ⚠️  Dubletter ignorerade: 2
  ❌ Fel: 0
  
Nästa körning: [tid]
```

---

## 9. Error Handling

| Fel | Åtgärd |
|-----|--------|
| API connection failed | Logga fel, försök igen om 5 min |
| Jobb data inkomplett | Skippa jobbet, logga varning |
| Duplicate detected | Logga & hoppa över |
| Post failed | Logga fel med HTTP status |

---

## 10. Körschema (Rekommendation)

- **Frekvens:** 1 gång per dag (t.ex. 09:00)
- **Tid på dygnet:** Morgon (många nya annonserar då)
- **Maxantal per körning:** 10-15 jobb för att undvika överbelastning

---

## 11. Test-Checklist

Innan du sätter agent i produktion:

- [ ] Kan agenten hämta befintliga jobb från API?
- [ ] Fungerar dubblett-check (title + company + location)?
- [ ] Kan agenten posta nytt jobb?
- [ ] Loggas resultat korrekt?
- [ ] Hanteras fel utan att krascha?
- [ ] URL:er är korrekta och aktiva?

---

## 12. Kontaktperson

Om något går fel eller du behöver uppdateringar:
- Kontrollera job board-appen är igång
- Verifiera API-endpoints är tillgängliga
- Kontrollera Supabase-databasen har kapacitet
