# GitHub Copilot Agents

Dette prosjektet bruker GitHub Copilot Agents for spesialiserte utviklingsoppgaver.

## Tilgjengelige agenter

### 📚 [docs-agent](docs-agent.md)
**Fokus:** Dokumentasjon og teknisk skriving

Brukes til:
- Oppdatere dokumentasjon i `docs/`
- Skrive brukerveiledninger
- Dokumentere API-endringer
- Holde README.md oppdatert

**Når bruke:** Når du trenger hjelp med å skrive eller oppdatere dokumentasjon.

---

### ⚡ [feature-agent](feature-agent.md)
**Fokus:** Feature-utvikling og React-komponenter

Brukes til:
- Bygge nye features i `App.tsx`
- Legge til nye metrikker eller visualiseringer
- Implementere UI-forbedringer
- Oppdatere TypeScript types

**Når bruke:** Når du skal bygge nye funksjoner eller utvide dashboardet.

---

### 🧪 [test-agent](test-agent.md)
**Fokus:** Testing og kvalitetssikring

Brukes til:
- Skrive unit tests for komponenter
- Teste API-integrasjon
- Mock eksterne avhengigheter
- Debugge failing tests

**Når bruke:** Når du trenger tester for ny funksjonalitet eller skal fikse failing tests.

---

### 🚀 [deploy-agent](deploy-agent.md)
**Fokus:** Deployment og CI/CD

Brukes til:
- Fikse GitHub Actions workflows
- Troubleshoot deployment-problemer
- Optimalisere produksjonsbuilds
- Administrere GitHub Pages

**Når bruke:** Når deployment feiler eller du skal optimalisere build-prosessen.

---

### 🔌 [api-agent](api-agent.md)
**Fokus:** GitHub API-integrasjon

Brukes til:
- Arbeide med Copilot Metrics API
- Prosessere API-responser
- Håndtere autentisering
- Optimalisere dataprosessering

**Når bruke:** Når du skal endre API-kall eller data-transformasjon logikk.

---

### 🔧 [refactor-agent](refactor-agent.md)
**Fokus:** Refactoring og kodekvalitet

Brukes til:
- Forbedre kodestruktur
- Optimalisere ytelse
- Konsolidere CSS
- Følge best practices

**Når bruke:** Når du skal forbedre eksisterende kode uten å endre funksjonalitet.

---

## Hvordan bruke agenter

### I GitHub Copilot Chat

Merk en agent med `@`:

```
@feature-agent Legg til støtte for dotcom chat metrics i breakdown-tabellen
```

```
@test-agent Skriv tester for den nye processMetricsData funksjonen
```

```
@docs-agent Oppdater API-dokumentasjonen med nye felter
```

### Velge riktig agent

| Oppgave | Agent |
|---------|-------|
| Dokumentere ny feature | `@docs-agent` |
| Bygge ny UI-komponent | `@feature-agent` |
| Skrive tester | `@test-agent` |
| Fikse deployment-feil | `@deploy-agent` |
| Endre API-kall | `@api-agent` |
| Forbedre kodestruktur | `@refactor-agent` |

### Kombinere agenter

Noen oppgaver krever flere agenter:

```
# 1. Bygg feature
@feature-agent Legg til filter for datoperiode

# 2. Test feature
@test-agent Skriv tester for datofilter-funksjonen

# 3. Dokumenter feature
@docs-agent Oppdater brukerveiledning med datofilter-instruksjoner
```

## Agent-struktur

Hver agent følger samme mønster:

```chatagent
---
name: agent_name
description: Short description
---

You are an expert in [specialty].

## Your role
- Primary responsibilities
- Key focus areas

## Project knowledge
- Relevant tech stack
- Important files
- Key patterns

## Commands you can use
- Relevant npm scripts
- Tool commands

## Practices/Patterns
- Best practices
- Code examples

## Boundaries
- ✅ Always do
- ⚠️ Ask first
- 🚫 Never do
```

## Best practices

### 1. Vær spesifikk
❌ `@feature-agent Kan du hjelpe meg?`  
✅ `@feature-agent Legg til accept rate i metrics cards med % formattering`

### 2. Gi kontekst
❌ `@test-agent Test dette`  
✅ `@test-agent Skriv tester for fetchMetrics() inkludert error cases (401, 403, 404)`

### 3. Ett ansvar per agent
❌ `@feature-agent Bygg feature + skriv tester + deploy`  
✅ `@feature-agent Bygg feature` → `@test-agent Skriv tester` → `@deploy-agent Deploy`

### 4. Følg agent-grenser
Hver agent har klare boundaries - respekter disse for best resultat.

## Bidra

Når du legger til nye agenter:

1. Følg eksisterende struktur
2. Definer klare boundaries
3. Inkluder relevante kommandoer
4. Oppdater denne README-filen
5. Hold agenter fokuserte (en spesialitet per agent)

## Spørsmål?

Se [dokumentasjonen](../../docs/) eller spør i issues.
