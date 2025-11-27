# API Integrasjon

Dette dokumentet beskriver hvordan GitHub Copilot Adoption Dashboard integrerer med GitHub Copilot Metrics API.

## GitHub Copilot Metrics API

### Endpoint

```
GET https://api.github.com/enterprises/{enterprise}/copilot/metrics
```

**API Versjon**: `2022-11-28`

### Offisiell dokumentasjon

[GitHub REST API - Copilot Metrics](https://docs.github.com/en/enterprise-cloud@latest/rest/copilot/copilot-metrics?apiVersion=2022-11-28)

## Autentisering

### Personal Access Token (PAT)

Applikasjonen krever et GitHub Personal Access Token med følgende tilganger:

#### Påkrevde scopes

- **`copilot`** - For å få tilgang til Copilot metrics data
- **Enterprise member access** - Hvis enterprise er privat

#### Opprette token

1. Gå til GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Klikk "Generate new token"
3. Velg scopes:
   - `copilot` (Copilot metrics read access)
4. Velg enterprise access hvis relevant
5. Generer og kopier tokenet

**Sikkerhet**: Token vises kun én gang - lagre det sikkert!

### Request headers

```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Accept': 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28'
}
```

## API Response struktur

### DailyMetrics array

API returnerer en array av daglige metrikker, **eldste først**:

```json
[
  {
    "date": "2025-11-20",
    "total_active_users": 150,
    "total_engaged_users": 120,
    "copilot_ide_code_completions": { ... },
    "copilot_ide_chat": { ... },
    "copilot_dotcom_chat": { ... },
    "copilot_dotcom_pull_requests": { ... }
  },
  {
    "date": "2025-11-21",
    ...
  },
  ...
]
```

### Nestet struktur

Fullstendig type-hierarki:

```typescript
interface DailyMetrics {
  date: string;
  total_active_users: number;
  total_engaged_users: number;
  
  copilot_ide_code_completions: {
    editors: Array<{
      name: string; // "vscode", "jetbrains", "vim", etc.
      total_engaged_users: number;
      models: Array<{
        name: string; // "default", "gpt-4o", etc.
        languages?: Array<{
          name: string; // "typescript", "python", "java", etc.
          total_engaged_users: number;
          total_code_suggestions: number;
          total_code_acceptances: number;
          total_code_lines_suggested: number;
          total_code_lines_accepted: number;
        }>;
      }>;
    }>;
  };
  
  copilot_ide_chat: {
    total_engaged_users: number;
    editors: Array<{...}>;
  };
  
  copilot_dotcom_chat: {
    total_engaged_users: number;
  };
  
  copilot_dotcom_pull_requests: {
    total_engaged_users: number;
  };
}
```

## Dataprosessering

### fetchMetrics() funksjon

Hovedfunksjon for API-kommunikasjon:

```typescript
const fetchMetrics = async () => {
  // 1. Validering
  if (!token || !enterprise) {
    setError('Please provide both GitHub token and enterprise name');
    return;
  }

  // 2. State reset
  setLoading(true);
  setError('');
  setMetrics(null);

  try {
    // 3. API kall
    const response = await fetch(
      `https://api.github.com/enterprises/${enterprise}/copilot/metrics`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    );

    // 4. Error handling
    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // 5. Data parsing
    const data: DailyMetrics[] = await response.json();
    
    // 6. Data validation
    if (data && data.length > 0) {
      const processedMetrics = processMetricsData(data);
      setMetrics(processedMetrics);
    } else {
      throw new Error('No metrics data available');
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
  } finally {
    setLoading(false);
  }
};
```

### processMetricsData() transformasjon

Konverterer rå API-data til visningsformat:

#### 1. Ekstraher siste dag

```typescript
const latestDay = data[data.length - 1]; // Nyeste data
```

**Viktig**: API returnerer data kronologisk (eldste → nyeste).

#### 2. Bygg historisk datasett

```typescript
const historicalData = {
  dates: data.map(day => day.date),
  engaged_users: data.map(day => day.total_engaged_users)
};
```

Brukes direkte i Chart.js for trendvisualisering.

#### 3. Flatt ut breakdown-data

```typescript
const breakdown: DisplayMetrics['breakdown'] = [];

latestDay.copilot_ide_code_completions.editors.forEach(editor => {
  editor.models.forEach(model => {
    if (model.languages) {
      model.languages.forEach(lang => {
        breakdown.push({
          language: lang.name,
          editor: editor.name,
          suggestions_count: lang.total_code_suggestions,
          acceptances_count: lang.total_code_acceptances,
          lines_suggested: lang.total_code_lines_suggested,
          lines_accepted: lang.total_code_lines_accepted,
          active_users: lang.total_engaged_users
        });
      });
    }
  });
});
```

**Resultat**: Én rad per språk/editor-kombinasjon.

#### 4. Sorter breakdown

```typescript
breakdown.sort((a, b) => {
  const acceptRateA = a.suggestions_count > 0 ? (a.acceptances_count / a.suggestions_count) : 0;
  const acceptRateB = b.suggestions_count > 0 ? (b.acceptances_count / b.suggestions_count) : 0;
  
  // Primary: Active users (descending)
  if (b.active_users !== a.active_users) {
    return b.active_users - a.active_users;
  }
  
  // Secondary: Accept rate (descending)
  return acceptRateB - acceptRateA;
});
```

**Logikk**:
1. Mest aktive brukere først
2. Ved likt antall brukere: Høyest aksepteringsrate først

#### 5. Estimer totalt antall seter

```typescript
const estimated_total_seats = Math.round(latestDay.total_active_users * 1.2);
```

**Workaround**: GitHub API gir ikke totalt antall kjøpte seter. Vi estimerer til 120% av aktive brukere som en fornuftig proxy.

## Feilhåndtering

### HTTP statuskoder

| Status | Betydning | Håndtering |
|--------|-----------|------------|
| 200 OK | Suksess | Prosesser data |
| 401 Unauthorized | Ugyldig token | Vis feilmelding: "Check your token" |
| 403 Forbidden | Ingen tilgang til enterprise | Vis feilmelding: "Access denied" |
| 404 Not Found | Enterprise finnes ikke | Vis feilmelding: "Enterprise not found" |
| 500 Server Error | GitHub API problem | Vis feilmelding: "API error" |

### Error response format

```typescript
interface ErrorResponse {
  message: string;
  documentation_url?: string;
}
```

Eksempel:
```json
{
  "message": "Not Found",
  "documentation_url": "https://docs.github.com/rest/copilot/copilot-metrics"
}
```

### Error state management

```typescript
const [error, setError] = useState<string>('');

// Display error
{error && (
  <div className="error">
    <strong>Error:</strong> {error}
  </div>
)}
```

## Rate Limits

### GitHub API limits

- **Autentiserte requests**: 5000 requests/time
- **Unauthenticated**: 60 requests/time

### Rate limit headers

GitHub returnerer rate limit info i response headers:

```
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4999
X-RateLimit-Reset: 1701388800
```

**Merknad**: Applikasjonen logger ikke disse for øyeblikket. Kan implementeres ved behov.

## Data freshness

### Oppdateringsfrekvens

- GitHub oppdaterer metrics **daglig**
- Data er tilgjengelig for **siste 28 dager**
- Historiske data går tilbake opptil 28 dager

### Cache-strategi

**Applikasjonen cacher IKKE data**. Hver "Get Metrics" knapp-klikk:
1. Sender ny API-request
2. Henter fersk data
3. Overskriver tidligere state

**Begrunnelse**: Data endres daglig, og brukere forventer fresh data.

## API Prerequisites

### Enterprise setting

For å bruke dette API-et må enterprise administrator aktivere Copilot Metrics:

1. Gå til Enterprise Settings
2. Navigér til Copilot settings
3. Aktiver "Enable Copilot Metrics API"

![API Settings](https://github.com/user-attachments/assets/d4a5aa72-96c8-4ab6-b17a-2d50191773a8)

**Uten denne innstillingen**: API vil returnere 404 eller 403.

## Debugging API calls

### Browser DevTools

Bruk Network tab for å inspisere requests:

1. Åpne DevTools (F12)
2. Gå til Network tab
3. Klikk "Get Metrics"
4. Se etter request til `api.github.com/enterprises/.../copilot/metrics`
5. Inspiser:
   - Request headers (token er skjult av sikkerhetsgrunner)
   - Response status
   - Response body
   - Timing

### Common issues

**Problem**: 401 Unauthorized
- **Løsning**: Sjekk at token har `copilot` scope

**Problem**: 404 Not Found
- **Løsning**: Verifiser enterprise navn (case-sensitive)

**Problem**: 403 Forbidden
- **Løsning**: Sjekk at du har tilgang til enterprise

**Problem**: Empty array `[]`
- **Løsning**: Ingen data tilgjengelig for denne perioden

## Example API response

Forkortet eksempel:

```json
[
  {
    "date": "2025-11-27",
    "total_active_users": 245,
    "total_engaged_users": 198,
    "copilot_ide_code_completions": {
      "editors": [
        {
          "name": "vscode",
          "total_engaged_users": 180,
          "models": [
            {
              "name": "default",
              "languages": [
                {
                  "name": "typescript",
                  "total_engaged_users": 120,
                  "total_code_suggestions": 15000,
                  "total_code_acceptances": 9000,
                  "total_code_lines_suggested": 45000,
                  "total_code_lines_accepted": 27000
                }
              ]
            }
          ]
        }
      ]
    },
    "copilot_ide_chat": {
      "total_engaged_users": 85,
      "editors": [...]
    },
    "copilot_dotcom_chat": {
      "total_engaged_users": 42
    },
    "copilot_dotcom_pull_requests": {
      "total_engaged_users": 31
    }
  }
]
```

## Sikkerhet og personvern

### Token sikkerhet

- **Aldri commit tokens**: `.gitignore` skal alltid ekskludere config filer
- **Ingen logging**: Token logges ALDRI til console eller analytics
- **HTTPS only**: All kommunikasjon over kryptert forbindelse

### Data personvern

API returnerer **aggregerte metrikker** - ingen personidentifiserbar informasjon (PII):
- ✅ Antall brukere per språk
- ✅ Totale acceptances
- ❌ IKKE navn på brukere
- ❌ IKKE email-adresser
- ❌ IKKE individuelle usage patterns

**GDPR compliant**: Ingen persondata eksponeres.
