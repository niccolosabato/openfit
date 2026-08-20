# OpenFit

Diario di allenamento web, installabile come PWA. Nessun backend: tutti i dati (profilo, schede, storico, peso corporeo) restano nel `localStorage` del browser.

> **Stato:** progetto sospeso. Il codice è funzionalmente completo per un MVP, ma non in sviluppo attivo.

## Funzionalità

- **Onboarding** guidato alla prima apertura (dati anagrafici, obiettivo, scelta tra scheda template Push/Pull/Legs o scheda vuota)
- **Builder schede**: creazione/modifica di giorni ed esercizi (gruppo muscolare, serie, ripetizioni, recupero, note)
- **Sessione live**: allenamento guidato con timer di recupero tra le serie
- **Storico** delle sessioni completate
- **Progressi**: grafico del peso corporeo, andamento dei carichi per esercizio, volume per gruppo muscolare
- **Profilo & impostazioni**: dati personali, colore accento, backup dati (export/import JSON), reset completo
- **PWA**: installabile su desktop/mobile, dark theme

## Stack tecnico

- HTML/CSS/JavaScript vanilla (ES Modules), nessun bundler/build step
- [Tailwind CSS](https://tailwindcss.com) via CDN, con [`js/tailwind.config.js`](js/tailwind.config.js) per i colori accento personalizzati
- [Lucide Icons](https://lucide.dev) via CDN
- Persistenza dati tramite `localStorage` (namespace `openfit_v3_*`), niente server/database

## Struttura del progetto

```
index.html              Markup di tutte le schermate (onboarding + app)
manifest.json            Manifest PWA
js/
  main.js                Bootstrap dell'app
  router.js               Router a tab (le view si registrano via registerView)
  timer.js                Timer di recupero
  state/
    store.js               Store centrale + load/persist su localStorage
    schema.js               Stato iniziale, template scheda, mappa colori accento
    actions/                Azioni raggruppate per dominio (profilo, scheda, sessione, storico, peso, dati)
  views/                  Una view per tab (dashboard, builder, session, history, analytics, profile, onboarding, shell)
  ui/                     Helper riusabili (DOM delegation, classi, icone, modali, toast, tema)
css/style.css            Stili custom
img/                      Icone PWA
```

## Avvio in locale

Essendo un progetto statico senza build step, basta servire la cartella con un qualsiasi server HTTP (necessario per gli ES Modules, non basta aprire `index.html` da file://):

```bash
python3 -m http.server 8000
```

Poi apri `http://localhost:8000` nel browser.

## Dati e privacy

Non c'è alcun account né sincronizzazione: profilo, schede, storico allenamenti e log del peso vengono salvati solo nel browser (`localStorage`). L'export/import di backup (JSON) nella sezione Profilo permette di spostare i dati tra dispositivi o conservarli.
