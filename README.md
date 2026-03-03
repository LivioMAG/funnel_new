# funnel_new

Ein simples, JSON-gesteuertes Recruiting-Funnel-Template.

## Starten

```bash
python3 -m http.server 4173
```

Dann im Browser `http://localhost:4173` öffnen.

## Texte austauschen

Alle sichtbaren Texte und Theme-Werte liegen in `config.json` (inklusive `landing`, `whyUs`, `funnel` und `theme`).


Zusätzliche Seiten:
- `landing.html` (Landingpage, JSON-gesteuert)
- `warum-bei-uns.html` ("Warum bei uns arbeiten", JSON-gesteuert mit separater CSS-Datei)

### Landingpage-Sections

In `src/content/landingpage.json` steuerst du die Reihenfolge der Abschnitte über `sections`.

Neu: CTAs können als eigene Section vom Typ `cta` angelegt werden (ein Button pro Section), z. B. mit `action: "start-funnel"`, `"show-info"` oder `"link"`.
