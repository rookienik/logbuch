# Operationslogbuch – Setup & Deploy

## Voraussetzungen
- Node.js (nodejs.org → LTS herunterladen und installieren)
- Ein kostenloses GitHub-Konto (github.com)
- Ein kostenloses Vercel-Konto (vercel.com) – mit GitHub einloggen

---

## 1. Projekt einrichten (Terminal auf dem Mac)

```bash
cd ~/Documents
# Diesen Ordner hierher verschieben oder entpacken, dann:
cd logbuch-pwa
npm install
```

## 2. Lokal testen

```bash
npm run dev
```
→ Browser öffnet sich auf http://localhost:5173  
→ App sollte vollständig funktionieren und Daten in localStorage speichern

## 3. Auf GitHub hochladen

```bash
git init
git add .
git commit -m "Initial commit"
```

Dann auf github.com → New repository → Name: `logbuch` → Create  
Den dort angezeigten Befehlen folgen (git remote add origin ... && git push)

## 4. Auf Vercel deployen

```bash
npm install -g vercel
vercel
```

- Login via Browser (GitHub empfohlen)
- Alle Fragen mit Enter bestätigen
- Am Ende erscheint: `✅ Production: https://logbuch-xxxx.vercel.app`

## 5. Auf iPhone installieren

1. Safari öffnen (nicht Chrome!)
2. Deine Vercel-URL aufrufen
3. Teilen-Button (Kasten mit Pfeil nach oben)
4. "Zum Home-Bildschirm" → "Hinzufügen"

Die App erscheint als Icon auf dem Home-Bildschirm, öffnet sich vollbild ohne Browser-Chrome und funktioniert offline.

---

## Daten

Daten werden in `localStorage` des Browsers gespeichert – d.h. lokal auf dem jeweiligen Gerät.  
Für geräteübergreifende Synchronisation (iPhone ↔ Mac) kann später Supabase eingebaut werden.

## Updates deployen

Nach Änderungen am Code:
```bash
git add .
git commit -m "Update"
git push
```
Vercel deployed automatisch innerhalb von ~30 Sekunden.
