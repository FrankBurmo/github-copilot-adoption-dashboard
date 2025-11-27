# GitHub Copilot Adoption Dashboard - Dokumentasjon

Velkommen til dokumentasjonen for GitHub Copilot Adoption Dashboard. Dette er et klientsidebasert React-dashboard for å visualisere GitHub Copilot enterprise-metrikker via GitHub REST API.

## Oversikt

Dette dashboardet gir en enkel og oversiktlig måte å:

- Hente og vise GitHub Copilot bruksmetrikker for din enterprise
- Visualisere trender over tid med interaktive diagrammer
- Analysere engasjement per programmeringsspråk og editor
- Estimere seteforbruk og aksepteringsrater

## Dokumentasjonsstruktur

### [Brukerveiledning](user-guide.md)
Komplett guide for sluttbrukere som skal bruke dashboardet.

- Komme i gang (token, enterprise)
- Forstå metrikkene
- Tolke grafer og tabeller
- Feilsøking
- Tips og beste praksis

### [Arkitektur](architecture.md)
Detaljert beskrivelse av applikasjonens struktur, dataflyt og tekniske valg.

- Single-page application design
- Komponenthierarki
- State management
- TypeScript type system

### [API Integrasjon](api-integration.md)
Hvordan applikasjonen integrerer med GitHub Copilot Metrics API.

- Autentisering og sikkerhet
- API endpoints og datamodeller
- Dataprosessering og transformasjon
- Feilhåndtering

### [Utviklingsguide](development.md)
Alt du trenger for å komme i gang med lokal utvikling.

- Forutsetninger og installasjon
- Lokalt utviklingsmiljø
- Testing og linting
- Debugging

### [Deployment](deployment.md)
Informasjon om deployment til GitHub Pages og produksjonsbygg.

- GitHub Actions workflow
- Build-prosess
- GitHub Pages konfigurasjon
- Produksjonsoptimalisering

## Rask start

```bash
# Klon repository
git clone https://github.com/FrankBurmo/github-copilot-adoption-dashboard.git
cd github-copilot-adoption-dashboard

# Installer avhengigheter
npm install

# Start utviklingsserver
npm run dev
```

Applikasjonen vil starte på `http://localhost:5173`.

## Live demo

En kjørende versjon av dashboardet er tilgjengelig på:
**https://frankburmo.github.io/github-copilot-adoption-dashboard/**

## Teknologi stack

- **React 19.2** - UI framework
- **TypeScript 5.9** - Type safety
- **Vite 7.2** - Build tool og dev server
- **Chart.js 4.5** - Datavisualisering
- **Vitest 4.0** - Testing framework

## Bidra

Se [Utviklingsguiden](development.md) for informasjon om hvordan du bidrar til prosjektet.

## Lisens

MIT License - se [LICENSE](../LICENSE) filen for detaljer.
