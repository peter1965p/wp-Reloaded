# WP-Reloaded — Projektkontext für Claude Code

WordPress als reines Backend (REST-API), Admin und Frontend komplett eigenständig als Nuxt-Apps gebaut — kein wp-admin, kein PHP-Templating im Frontend. Details/Pitch siehe `README.md`.

## Struktur

- `wordpress/` — normale WP-Installation (PHP/MySQL), liefert nur `/wp-json/...`. Core ist gitignored, nur `wp-content/plugins/wp2026-slider/` (eigenes Plugin) ist getrackt.
- `admin/` — Nuxt-Dashboard (Port 3000). Ersetzt wp-admin komplett.
- `frontend/` — öffentliche Website (Nuxt, Port 3001).
- `setup.js` — Setup-Assistent (`npm run setup`, startet Browser-Wizard auf Port 4000), schreibt `wordpress/wp-config.php` und beide `.env`-Dateien.

## Kritisches Architekturmuster: Server-Proxy statt direktem Client-Fetch

**Beide** Nuxt-Apps rufen WordPress ausschließlich über eigene `server/api/*`-Routen auf, nie per `$fetch` direkt im Client-Code. Grund: WordPress läuft in Produktion auf einer anderen Domain als admin/frontend (z.B. WordPress auf eigenem Webserver, Nuxt-Apps auf Cloudflare Pages) — ein Browser-Fetch zu einer fremden Domain würde an CORS scheitern, sobald WordPress diese Domain nicht kennt. Über den Server-Proxy spricht der Browser immer nur mit der eigenen Domain.

- `admin/server/api/*` — bestehendes Muster, Basic Auth mit `config.wpUser`/`config.wpAppPassword` (WP Application Password), z.B. `admin/server/api/post/[id].put.ts`.
- `frontend/server/api/*` — `posts.get.ts`, `pages.get.ts`, `slides.get.ts`, `slider-status.get.ts`, reiner Query-Passthrough zu `config.wpApiBase`, kein Auth nötig (nur öffentliche/veröffentlichte Inhalte).

**Wenn hier neue WordPress-Datenfelder oder -Endpunkte gebraucht werden: immer eine neue `server/api/*`-Route anlegen, niemals `config.public.wpApiBase` (admin) bzw. `config.wpApiBase` (frontend) direkt aus einer `.vue`-Datei heraus fetchen.** Ausnahme in `admin`: reine `<a href>`/`<iframe src>`-Links auf die echte WP-Domain (z.B. `wp-admin`-Notausgang, eingebettete Plugin-Einstellungsseiten) sind unproblematisch, weil Navigation/iframe-Einbettung nicht denselben CORS-Regeln wie `fetch()` unterliegt.

## Env-Vars

- `admin`: `NUXT_PUBLIC_WP_API_BASE`, `NUXT_WP_USER`, `NUXT_WP_APP_PASSWORD`, `NUXT_WP_CONTENT_PATH` — bewusst `PUBLIC`, weil `admin`s Client-Code die URL für die genannten direkten Links/iframes braucht.
- `frontend`: `NUXT_WP_API_BASE` (**ohne** `PUBLIC` — server-only, damit die echte WP-URL nie im Client-Bundle landet), `NUXT_PUBLIC_SITE_URL`.

`.env` ist gitignored, `.env.example` je Workspace zeigt die erwartete Struktur.

## Dev-Befehle

```bash
cd wordpress && php -S localhost:8000     # WordPress
npm run dev                                # admin (3000) + frontend (3001) gleichzeitig
```

Volle Setup-/Deploy-Anleitung (Linux + Windows, echter Webserver vs. Shared Hosting): siehe `README.md`.

## Screenshots

`screenshots/` — Bilder für die README, siehe dortige `README.md` im Ordner.
