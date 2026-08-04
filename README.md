# WP-2026 | Headless WordPress CMS

Ein Monorepo aus drei Teilen:

- **`wordpress/`** — normale WordPress-Installation (PHP), liefert nur noch die REST-API, kein eigenes Theme/Frontend.
- **`admin/`** — Nuxt-Dashboard zum Verwalten von Beiträgen, Seiten, Slider usw. Spricht mit WordPress über einen serverseitigen Proxy (WP Application Password, Basic Auth) — die Zugangsdaten verlassen nie den Server.
- **`frontend/`** — die öffentliche Website (Nuxt), liest Inhalte ebenfalls über einen serverseitigen Proxy statt direkt aus dem Browser.

**Warum der Proxy wichtig ist:** Im Produktivbetrieb laufen WordPress und die Nuxt-Apps auf unterschiedlichen Domains (z.B. WordPress auf einem eigenen PHP-Webserver, `admin`/`frontend` auf Cloudflare Pages). Ein direkter `fetch()` aus dem Browser zu einer fremden Domain wird von Cross-Origin-Regeln (CORS) blockiert, sobald WordPress diese Domain nicht explizit erlaubt. Beide Nuxt-Apps rufen WordPress deshalb ausschließlich über ihre **eigenen** Server-Routen (`server/api/*`) auf — der Browser spricht immer nur mit der eigenen Domain, der Nuxt-Server redet im Hintergrund mit WordPress. Kein CORS-Setup auf der WordPress-Seite nötig, und die WP-Zugangsdaten (Application Password) sind nie im Browser sichtbar.

## Voraussetzungen

- Node.js ≥ 20
- PHP ≥ 8.1
- MySQL oder MariaDB (laufend, mit einer Datenbank für WordPress)

## Setup

Auf **Linux/macOS** und **Windows** identisch (alles läuft über `npm`/`node`, nichts Shell-spezifisches):

```bash
git clone git@github.com:peter1965p/wp-Reloaded.git
cd wp-Reloaded
npm run setup
```

`npm run setup` startet einen Setup-Assistenten im Browser (`http://localhost:4000`):

1. Datenbank-Zugangsdaten eingeben → `wordpress/wp-config.php` wird automatisch erstellt.
2. WordPress-Adresse + Application Password eingeben (in WP unter *Benutzer → Profil → Anwendungspasswörter* erzeugen) → `admin/.env` und `frontend/.env` werden automatisch geschrieben, `npm install` läuft automatisch mit durch.

Danach ist alles startbereit.

## Entwicklung starten

**PHP-Server für WordPress** (identischer Befehl auf Linux, macOS und Windows — `php` muss im `PATH` sein):

```bash
cd wordpress
php -S localhost:8000
```

**Admin + Frontend** (aus dem Projekt-Root, beide gleichzeitig):

```bash
npm run dev
```

- WordPress: http://localhost:8000
- Admin: http://localhost:3000
- Frontend: http://localhost:3001

Nur einzeln starten: `npm run dev:admin` bzw. `npm run dev:frontend`.

> Unter Windows: Falls `php` nicht erkannt wird, PHP-Installationsordner (z.B. `C:\php`) zum `PATH` hinzufügen, oder stattdessen mit [Laragon](https://laragon.org/) / [XAMPP](https://www.apachefriends.org/) arbeiten und dort den vhost auf `wordpress/` zeigen lassen statt den eingebauten PHP-Server zu nutzen.

## Produktivbetrieb

Die drei Teile werden **getrennt** deployt:

### WordPress

Klassisch auf einem PHP-Webserver (Apache/Nginx + PHP-FPM + MySQL) — eigene Domain, z.B. `cms.deine-domain.de`. Kein besonderer Kniff nötig, das ist eine normale WordPress-Installation. Wichtig:

- HTTPS aktivieren (WP Application Passwords funktionieren nur über HTTPS oder `localhost`).
- Unter *Einstellungen → Permalinks* einmal speichern, damit `/wp-json/...` sauber geroutet wird.

### Admin + Frontend

Beides sind normale Nuxt-Apps — Build via `npm run build:admin` / `npm run build:frontend`, Deploy z.B. auf Cloudflare Pages, Vercel oder einem eigenen Node-Server. Beim Deploy müssen die Environment-Variablen auf die **echte** WordPress-URL zeigen statt auf `localhost`:

| Variable | Wo | Bedeutung |
|---|---|---|
| `NUXT_PUBLIC_WP_API_BASE` | `admin` | `https://cms.deine-domain.de/wp-json/wp/v2` |
| `NUXT_WP_USER` | `admin` | WordPress-Benutzername (Application Password gehört zu diesem User) |
| `NUXT_WP_APP_PASSWORD` | `admin` | Das erzeugte Application Password |
| `NUXT_WP_CONTENT_PATH` | `admin` | Lokaler Pfad zu `wp-content` — nur relevant, wenn `admin` auf demselben Server wie WordPress läuft; sonst leer lassen |
| `NUXT_WP_API_BASE` | `frontend` | `https://cms.deine-domain.de/wp-json/wp/v2` (server-only, nie im Browser sichtbar) |
| `NUXT_PUBLIC_SITE_URL` | `frontend` | Die eigene öffentliche URL des Frontends, für SEO/Canonical-Links |

Das ist die einzige manuelle Anpassung pro Umgebung — eine "automatische" Erkennung der WordPress-Domain ist nicht möglich, da beide Systeme unabhängig voneinander gehostet werden und es keine gemeinsame Quelle gibt, aus der sich das ableiten ließe. Der Proxy-Ansatz sorgt aber dafür, dass danach nichts weiter konfiguriert werden muss (kein CORS, kein zusätzlicher API-Key).

## Ordnerstruktur

```
wp-2026/
├── wordpress/        WordPress-Core + eigenes Plugin (wp2026-slider)
├── admin/             Nuxt-Dashboard (Port 3000)
├── frontend/           Nuxt-Website (Port 3001)
└── setup.js           Setup-Assistent (npm run setup)
```
