# Brukerveiledning

En enkel guide for å bruke GitHub Copilot Adoption Dashboard.

## Hva er dette dashboardet?

GitHub Copilot Adoption Dashboard viser bruksstatistikk for GitHub Copilot i din enterprise. Du kan se:

- **Antall aktive brukere** - Hvor mange som bruker Copilot
- **Engasjement** - Hvor mange som aktivt benytter funksjoner
- **Språk og editor-statistikk** - Hvilke programmeringsspråk og editorer som brukes mest
- **Aksepteringsrate** - Hvor mange kodeforslag som aksepteres
- **Trender over tid** - Historisk utvikling av engasjement

## Komme i gang

### 1. Åpne dashboardet

Gå til: **https://frankburmo.github.io/github-copilot-adoption-dashboard/**

### 2. Forbered GitHub Token

Du trenger et GitHub Personal Access Token for å hente data.

#### Opprette token

1. Gå til GitHub.com
2. Klikk på profilikonet (øverst til høyre) → **Settings**
3. Scroll ned til **Developer settings** (nederst i venstre meny)
4. Velg **Personal access tokens** → **Fine-grained tokens**
5. Klikk **Generate new token**
6. Fyll ut:
   - **Token name**: "Copilot Metrics Dashboard"
   - **Expiration**: Velg varighet (anbefalt: 90 dager)
   - **Repository access**: Ikke relevant for dette
   - **Permissions**:
     - Under "Account permissions" → finn **Copilot** → velg **Read-only**
7. Scroll ned og klikk **Generate token**
8. **Viktig**: Kopier tokenet NÅ - du vil ikke se det igjen!

#### Token sikkerhet

⚠️ **Behandle token som et passord**:
- Del ALDRI tokenet med andre
- Lagre det sikkert (password manager anbefales)
- Revoke token hvis du mistenker kompromittering

### 3. Finn ditt Enterprise navn

Enterprise navnet finner du i GitHub URL:

```
https://github.com/enterprises/YOUR-ENTERPRISE-NAME
```

Eller:
1. Gå til din GitHub enterprise
2. Se på URL-linjen i browseren
3. Enterprise navnet er det som kommer etter `/enterprises/`

**Eksempel**: Hvis URL er `https://github.com/enterprises/acme-corp`, er enterprise navnet `acme-corp`.

### 4. Hent metrikker

1. **Lim inn GitHub Token** i første felt (feltet er skjult av sikkerhetsgrunner)
2. **Skriv inn Enterprise navn** i andre felt
3. Klikk **Get Metrics**
4. Vent noen sekunder mens data hentes

## Forstå metrikkene

### Metrics Cards

#### Total Seats (Estimerte seter)
- **Hva**: Estimert antall Copilot-lisenser
- **Beregning**: 120% av aktive brukere (estimat)
- **Bruk**: Få en følelse av total sete-kapasitet

#### Active Users (Aktive brukere)
- **Hva**: Brukere som har brukt Copilot i perioden
- **Definisjon**: Minst én aktivitet (suggestion, chat, etc.)
- **Bruk**: Måle total aktiv brukerbase

#### Engaged Users (Engasjerte brukere)
- **Hva**: Brukere som aktivt benytter Copilot-funksjoner
- **Definisjon**: Brukere med meningsfull interaksjon
- **Bruk**: Måle reelt engasjement (ikke bare passiv bruk)

#### Engagement Rate (Engasjementsrate)
- **Hva**: Prosent av seter som er engasjert
- **Beregning**: (Engaged Users / Total Seats) × 100
- **Bruk**: KPI for Copilot-adopsjon
- **Mål**: Høyere er bedre (typisk 60-80% er godt)

### Historical Engagement Trend (Historisk trend)

Graf som viser daglig engasjement over tid (siste 28 dager).

**Hvordan lese grafen**:
- **X-akse**: Datoer (venstre = eldste, høyre = nyeste)
- **Y-akse**: Antall engasjerte brukere
- **Linje**: Trend over tid

**Hva å se etter**:
- ✅ **Stigende trend**: Økende adopsjon (positivt)
- ⚠️ **Fallende trend**: Mulig problem eller ferie-periode
- ⚠️ **Flat trend**: Stabil, men kanskje rom for vekst
- ✅ **Høye punkter**: Suksessfulle dager/uker

### Usage Breakdown (Detaljert oversikt)

Tabell som viser bruk per språk og editor.

#### Kolonner

| Kolonne | Beskrivelse | Bruk |
|---------|-------------|------|
| **Language** | Programmeringsspråk (TypeScript, Python, etc.) | Identifiser mest brukte språk |
| **Editor** | Kodeeditor (VS Code, JetBrains, etc.) | Se hvilke editorer teamet bruker |
| **Suggestions** | Antall kodeforslag Copilot ga | Volum av forslag |
| **Acceptances** | Antall forslag som ble akseptert | Faktisk bruk |
| **Accept Rate** | (Acceptances / Suggestions) × 100 | Kvalitet av forslag |
| **Active Users** | Brukere aktive i denne kombinasjonen | Adopsjonsbredde |

#### Sortering

Tabellen er sortert etter:
1. **Active Users** (høyest først)
2. **Accept Rate** (høyest først, ved likt antall brukere)

Dette betyr at de mest brukte språk/editor-kombinasjonene vises øverst.

#### Tolkning

**Høy accept rate (>60%)**:
- ✅ Copilot gir relevante forslag
- ✅ Brukerne finner verdi i forslagene
- ✅ Godt match mellom modell og bruksområde

**Lav accept rate (<30%)**:
- ⚠️ Mulig mismatch mellom forslag og behov
- ⚠️ Språket/domenet kan være utfordrende for Copilot
- ⚠️ Brukere er kanskje usikre på hvordan de skal bruke Copilot

**Mange suggestions, få acceptances**:
- 📊 Copilot er aktiv, men forslagene passer ikke alltid
- 💡 Vurder opplæring i hvordan brukere kan veilede Copilot bedre

**Få suggestions**:
- 📊 Språket/editoren brukes lite
- 💡 Eller: Copilot er ikke aktivert for denne kombinasjonen

## Vanlige spørsmål

### Hvor ofte oppdateres data?

GitHub oppdaterer Copilot metrics **daglig**. Data viser de siste 28 dagene.

### Hvorfor vises ikke mitt enterprise?

Mulige årsaker:
1. **Feil enterprise navn** - Sjekk at navnet er korrekt (case-sensitive)
2. **Ingen tilgang** - Du må være medlem av enterprise
3. **Metrics ikke aktivert** - Enterprise admin må aktivere API

### Hvorfor er Total Seats et estimat?

GitHub API gir ikke totalt antall kjøpte lisenser. Vi estimerer derfor til 120% av aktive brukere som en fornuftig proxy.

### Kan jeg eksportere data?

For øyeblikket støtter ikke dashboardet eksport. Du kan:
- Ta skjermbilde
- Kopiere data manuelt fra tabellen
- Bruke GitHub API direkte for rå data

### Er mine data sikre?

Ja:
- **Token lagres ikke** - Kun i browser-minnet under sesjonen
- **Ingen backend** - Data hentes direkte fra GitHub API
- **HTTPS** - All kommunikasjon er kryptert
- **Ingen logging** - Vi logger ikke tokens eller data

### Kan andre se min data?

Nei:
- Data hentes kun når du klikker "Get Metrics"
- Data lagres kun i din browser
- Ingen data sendes til servere (utenom GitHub API)
- Andre brukere ser ikke din data

## Feilsøking

### "Error: Not Found"

**Problem**: Enterprise finnes ikke eller du har ikke tilgang.

**Løsning**:
1. Sjekk at enterprise navnet er riktig
2. Verifiser at du er medlem av enterprise
3. Sjekk at du har nødvendig tilgang

### "Error: Unauthorized"

**Problem**: Token er ugyldig eller har ikke riktige permissions.

**Løsning**:
1. Generer nytt token med `copilot` scope
2. Sjekk at tokenet ikke er utløpt
3. Sjekk at du kopierte hele tokenet

### "Error: Forbidden"

**Problem**: Du har ikke tilgang til Copilot metrics for dette enterprise.

**Løsning**:
1. Be enterprise admin om tilgang
2. Sjekk at metrics API er aktivert i enterprise settings

### Siden er blank etter "Get Metrics"

**Problem**: Mulig JavaScript error.

**Løsning**:
1. Åpne browser DevTools (F12)
2. Sjekk Console-fanen for errors
3. Prøv å refresh siden (Ctrl+R / Cmd+R)
4. Prøv en annen browser

### Data vises ikke / tom tabell

**Problem**: Ingen data tilgjengelig for enterprise.

**Mulige årsaker**:
- Enterprise har ikke Copilot aktivert
- Ingen brukere har brukt Copilot ennå
- Metrics samling er ikke aktivert

### Grafen vises ikke

**Problem**: Chart.js lastingsproblem.

**Løsning**:
1. Refresh siden
2. Sjekk internettforbindelse
3. Prøv en annen browser

## Tips for beste resultat

### 1. Lagre token sikkert

Bruk en password manager (1Password, Bitwarden, etc.) til å lagre tokenet. Dette gjør det enkelt å bruke dashboardet senere.

### 2. Regelmessig oppfølging

Sjekk metrikker **ukentlig** eller **månedlig** for å:
- Spore adopsjonstrend
- Identifisere problemer tidlig
- Feire forbedringer

### 3. Del innsikter

Screenshot eller eksporter nøkkeltall for å dele med:
- Team leads
- Engineering managers
- Stakeholders

### 4. Kombiner med kvalitative data

Metrikker er nyttige, men kombiner med:
- Utviklerundersøkelser
- Intervjuer
- Feedback sessions

### 5. Sett mål

Definér suksess-metrikker for ditt team:
- Målsetting for engagement rate (f.eks. >70%)
- Målsetting for aktive brukere (f.eks. 80% av teamet)
- Målsetting for accept rate (f.eks. >55%)

## Support

### Teknisk support

Ved tekniske problemer:
1. Sjekk [Troubleshooting](#feilsøking) seksjonen ovenfor
2. Sjekk [GitHub Issues](https://github.com/FrankBurmo/github-copilot-adoption-dashboard/issues)
3. Opprett ny issue hvis problemet ikke er dokumentert

### GitHub Copilot support

For spørsmål om Copilot selv (ikke dashboardet):
- [GitHub Copilot dokumentasjon](https://docs.github.com/copilot)
- [GitHub Support](https://support.github.com)

## Neste steg

- Utforsk [API Integration](api-integration.md) for tekniske detaljer
- Les [Architecture](architecture.md) for systemforståelse
- Se [Development Guide](development.md) hvis du vil bidra til prosjektet
