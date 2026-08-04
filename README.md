# WP-Reloaded

**WordPress. Aber ohne den Teil, der nervt.**

WP-Reloaded ist echtes, unverändertes WordPress im Kern – Content-Verwaltung, Datenbank, REST-API, das komplette Plugin-Ökosystem bleiben, wie sie sind. Was verschwindet, ist alles, was WordPress nach außen und innen wie WordPress aussehen lässt: kein PHP-Templating, kein wp-admin, kein Theme-System im klassischen Sinn.

Stattdessen: ein komplett eigenständiger Admin- und Frontend-Layer, gebaut mit Nuxt, Vue, TypeScript und Tailwind.

## Was das bedeutet

- **Backend:** Original WordPress-Core (PHP, MySQL/MariaDB) – unverändert, voll kompatibel zum gesamten WordPress-Plugin-Verzeichnis.
- **Admin (`/admin`):** Eigenständiges Verwaltungs-Interface, das wp-admin vollständig ersetzt. Kommuniziert ausschließlich über die WordPress-API.
- **Frontend (`/frontend`):** Die öffentliche Website – kein PHP-Theme, sondern ein eigenständiges Nuxt-Frontend.
- **Kommunikation:** Admin und Frontend sprechen nur über definierte API-Schnittstellen mit dem WordPress-Backend, nicht direkt miteinander — und zwar über ihre **eigenen** Server-Routen, nicht per direktem Browser-Fetch (Details unten unter [Architektur](#architektur)).
- **Plugins:** Volle Kompatibilität zum offiziellen WordPress.org-Plugin-Katalog – Installation direkt aus dem Admin-Interface heraus, wie gewohnt, nur eben nicht in wp-admin.
- **Setup:** Ein Installer (`setup.js`) übernimmt Ersteinrichtung und Datenbank-Konfiguration, wie man es von einer klassischen WordPress-Installation kennt.

## Warum

Keine neuen Plugins, keine Zusatz-APIs, kein Extra-Werkzeug aus dem WordPress-Ökosystem. WP-Reloaded nutzt ausschließlich das, was WordPress seit Jahren eingebaut mitbringt: die reguläre REST-API. Mehr war nicht nötig.

WordPress von Grund auf neu gedacht, nicht neu erfunden: Der Kern bleibt, weil er robust ist. Alles, was WordPress alt, langsam und angestaubt wirken lässt, ist ersetzt – durch etwas, das WordPress selbst nie gebaut hat.

Kein neues CMS. Kein Fork. WordPress, neu zusammengesteckt.

---

**Stack:** WordPress (PHP/MySQL) · Nuxt 4 · Vue 3 · TypeScript · Tailwind CSS

**Autor:** Peter Päffgen — [Päffgen IT](https://paeffgen-it.de)

---

## Architektur

Drei unabhängige Teile in einem Monorepo:

- **`wordpress/`** — normale WordPress-Installation (PHP), liefert nur noch die REST-API.
- **`admin/`** — Nuxt-Dashboard, spricht mit WordPress über einen serverseitigen Proxy (WP Application Password, Basic Auth) — die Zugangsdaten verlassen nie den Server.
- **`frontend/`** — die öffentliche Website (Nuxt), liest Inhalte ebenfalls über einen serverseitigen Proxy statt direkt aus dem Browser.

**Warum der Proxy wichtig ist:** Im Produktivbetrieb laufen WordPress und die Nuxt-Apps auf unterschiedlichen Domains (WordPress auf einem eigenen PHP-Webserver, `admin`/`frontend` z.B. auf Cloudflare Pages). Ein direkter `fetch()` aus dem Browser zu einer fremden Domain wird von Cross-Origin-Regeln (CORS) blockiert, sobald WordPress diese Domain nicht explizit erlaubt. Beide Nuxt-Apps rufen WordPress deshalb ausschließlich über ihre **eigenen** Server-Routen (`server/api/*`) auf — der Browser spricht immer nur mit der eigenen Domain, der Nuxt-Server redet im Hintergrund mit WordPress. Kein CORS-Setup auf der WordPress-Seite nötig, und die WP-Zugangsdaten sind nie im Browser sichtbar.

## Voraussetzungen

- Node.js ≥ 20
- PHP ≥ 8.1
- MySQL oder MariaDB (laufend, mit einer Datenbank für WordPress)

## Setup (lokale Entwicklung)

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

Die drei Teile werden **getrennt** deployt und können auf komplett unterschiedlichen Servern/Anbietern laufen.

### Variante A — WordPress auf einem echten Webserver (Apache/Nginx)

1. **Dateien hochladen.** Kompletten Inhalt von `wordpress/` (inkl. `wp-content/plugins/wp2026-slider/`) per `rsync`/`scp`/SFTP auf den Webserver kopieren, z.B. nach `/var/www/cms.deine-domain.de/`.

   ```bash
   rsync -avz --exclude wp-config.php wordpress/ user@server:/var/www/cms.deine-domain.de/
   ```

2. **Datenbank anlegen** (per SSH auf dem Server, oder über das Hosting-Panel/phpMyAdmin):

   ```bash
   mysql -u root -p -e "CREATE DATABASE wordpress CHARACTER SET utf8mb4; \
     CREATE USER 'wordpress'@'localhost' IDENTIFIED BY 'EIN-SICHERES-PASSWORT'; \
     GRANT ALL PRIVILEGES ON wordpress.* TO 'wordpress'@'localhost'; FLUSH PRIVILEGES;"
   ```

3. **`wp-config.php` auf dem Server erzeugen** — entweder den lokal per Setup-Assistent erzeugten Inhalt übernehmen (DB-Zugangsdaten anpassen), oder auf dem Server selbst `wordpress/wp-config-sample.php` nach `wp-config.php` kopieren und die `DB_*`-Konstanten eintragen.

4. **Vhost einrichten**, Document Root zeigt auf den hochgeladenen Ordner. Nginx-Beispiel (mit PHP-FPM):

   ```nginx
   server {
       listen 443 ssl http2;
       server_name cms.deine-domain.de;
       root /var/www/cms.deine-domain.de;
       index index.php;

       location / {
           try_files $uri $uri/ /index.php?$args;
       }
       location ~ \.php$ {
           fastcgi_pass unix:/run/php/php8.3-fpm.sock;
           fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
           include fastcgi_params;
       }
       location ~ /\.ht { deny all; }
   }
   ```

   Apache-Äquivalent: `DocumentRoot` auf denselben Ordner, `AllowOverride All` (WordPress liefert eine eigene `.htaccess` für die Permalink-Rewrites), `mod_php` oder PHP-FPM via `mod_proxy_fcgi`.

5. **HTTPS aktivieren** (z.B. `certbot --nginx -d cms.deine-domain.de`) — WP Application Passwords funktionieren nur über HTTPS oder `localhost`.

6. Im WP-Adminbereich einmal unter **Einstellungen → Permalinks** speichern, damit `/wp-json/...` sauber geroutet wird, und unter **Benutzer → Profil → Anwendungspasswörter** das Application Password für `admin`/`frontend` erzeugen.

### Variante B — Managed/Shared Hosting (z.B. All-Inkl, IONOS, Strato)

Genau wie eine normale WordPress-Installation: Dateien aus `wordpress/` per FTP/SFTP in das Webspace-Verzeichnis hochladen, Datenbank im Hosting-Panel anlegen, `wp-config.php` mit den vom Hoster vergebenen DB-Zugangsdaten befüllen. Kein SSH/Root-Zugriff nötig — funktioniert überall dort, wo normales WordPress auch läuft.

### Admin + Frontend deployen

Beides sind normale Nuxt-Apps — Build via `npm run build:admin` / `npm run build:frontend`, Deploy z.B. auf Cloudflare Pages, Vercel oder einem eigenen Node-Server (`node .output/server/index.mjs`). Beim Deploy müssen die Environment-Variablen auf die **echte** WordPress-URL zeigen statt auf `localhost`:

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
