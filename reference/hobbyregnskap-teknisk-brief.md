# Hobbyregnskap – teknisk brief for Claude Code

## Bakgrunn

Dette er en videreføring av `HobbyRegnskap.jsx` (vedlagt), som ble bygget som et Claude.ai-artefakt. Den fungerer der, men bruker API-er (`window.storage`, ferdig-tilgjengelig Tailwind/lucide-react/recharts) som kun finnes i det miljøet. Målet nå er et frittstående, installerbart PWA-prosjekt som kan bygges og kjøres normalt (Vite/npm).

## Beslutninger tatt (ikke gjenåpne uten grunn)

| Spørsmål | Beslutning |
|---|---|
| Omfang | **Kun inntekter, utgifter og resultat.** Dokumentscanning/-lagring er droppet – ikke nødvendig for regnskapet. |
| Synk mellom enheter | **Manuell, via JSON-eksport/import.** Ikke automatisk. Data er lette (tall/tekst, ingen filer), så eksport via telefonens native delefunksjon (`navigator.share`) → AirDrop/e-post/hva som helst → importeres på mottakende enhet. |
| Backend/skytjeneste | **Ingen.** Ingen konto, ingen login, ingen server, ingen tredjepart har tilgang til dataene. |
| Plattform/layout | **Responsiv**, ikke to separate apper. Samme kodebase tilpasser seg mobil (kompakt) og desktop (bredere layout for oversikt/graf). |

## Arkitektur

- **Stack:** React + Vite + Tailwind, responsivt (se eget avsnitt om desktop-layout)
- **PWA:** `vite-plugin-pwa` for manifest + service worker → installerbar på mobil. Desktop er vanlig nettleservisning.
- **Lagring:** 100 % klient-side, `localStorage` er nok nå (kun tekst/tall, ingen binærdata lenger – ikke nødvendig med IndexedDB).
- **Ingen nettverkskall.**

## Datamodell

Samme som i artefaktet, ingen `documents`-tabell:

```
projects:         { id, name, createdAt }
transactions:      { id, projectId, date, type: 'income'|'expense', category, amount, comment }
customCategories:  { income: string[], expense: string[] }
```

## To typer eksport, to ulike formål

1. **CSV-eksport** (allerede bygget) – for regnskapsformål: åpnes i Excel, sendes til regnskapsfører, brukes til dokumentasjon overfor Skatteetaten om nødvendig.
2. **JSON-eksport/import** (NY) – for å flytte data mellom dine egne enheter. Full-fidelity (bevarer alt: kategorier, id-er osv.), slik at import gjenskaper nøyaktig samme tilstand på mottakende enhet. Bruk `navigator.share({ files: [...] })` der det støttes, med vanlig nedlasting som fallback. Importsiden må håndtere sammenslåing (nye transaksjoner lagt til på den andre enheten i mellomtiden) – enkleste og mest forutsigbare v1: import overskriver lokalt datasett helt, med en tydelig advarsel om det først. Ikke bygg smart sammenslåing i v1, det er en egen kompleksitet dere ikke trenger ennå.

## Desktop-layout

Samme app, ikke en egen desktop-versjon:
- **Mobil (< 768px):** dagens design fra artefaktet – énkolonne, bunn-plassert "+"-knapp, bunn-ark for skjemaer.
- **Desktop (≥ 1024px):** to-kolonne dashboard (prosjektliste til venstre, valgt prosjekts detaljer/graf til høyre i stedet for full skjermbytte), skjemaer som modal midt på skjermen i stedet for bunn-ark, større graf-flate for måned/år-oversikten.
- Behold samme fargepalett/typografi på begge – kun layout og interaksjonsmønster (bunn-ark vs. modal) endres etter skjermbredde.

## Hva som videreføres fra artefaktet

- Design/fargepalett (paper/ink/income/expense/gold), typografi (Fraunces/Inter/IBM Plex Mono)
- All logikk for prosjekter, transaksjoner (inkl. redigering), kategorier, måned/år-oversikt, CSV-eksport
- **Kategorioversikt** («Utgifter per kategori — hvor du blør mest» / «Inntekter per kategori»): sortert liste med søylebar per kategori, øverst i Oversikt-fanen. Dette er kjernefunksjonen for å se hvor pengene faktisk går – ikke fjern eller gjem den bak en ekstra fane.
- Erstatt: alle `window.storage.get(...)`/`.set(...)`-kall med `localStorage.getItem/setItem`
- Legg til: JSON-eksport/import (se over)

## Manifest / ikoner

Trenger appikon i flere størrelser (192×192, 512×512 som minimum) og et `theme_color` som matcher paper-fargen (`#E7E2D0`). Foreslå enkel, gjenkjennelig ikon-variant av kvittering-signaturelementet fra artefaktet.
