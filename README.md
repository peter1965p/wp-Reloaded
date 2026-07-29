# WP-Reloaded

**WordPress. Aber ohne den Teil, der nervt.**

WP-Reloaded ist echtes, unverändertes WordPress im Kern – Content-Verwaltung, Datenbank, REST-API, das komplette Plugin-Ökosystem bleiben, wie sie sind. Was verschwindet, ist alles, was WordPress nach außen und innen wie WordPress aussehen lässt: kein PHP-Templating, kein wp-admin, kein Theme-System im klassischen Sinn.

Stattdessen: ein komplett eigenständiger Admin- und Frontend-Layer, gebaut mit Nuxt, Vue, TypeScript und Tailwind.

## Was das bedeutet

- **Backend:** Original WordPress-Core (PHP, MySQL/MariaDB) – unverändert, voll kompatibel zum gesamten WordPress-Plugin-Verzeichnis.
- **Admin (`/admin`):** Eigenständiges Verwaltungs-Interface, das wp-admin vollständig ersetzt. Kommuniziert ausschließlich über die WordPress-API.
- **Frontend (`/frontend`):** Die öffentliche Website – kein PHP-Theme, sondern ein eigenständiges Nuxt-Frontend.
- **Kommunikation:** Admin und Frontend sprechen nur über definierte API-Schnittstellen mit dem WordPress-Backend, nicht direkt miteinander.
- **Plugins:** Volle Kompatibilität zum offiziellen WordPress.org-Plugin-Katalog – Installation direkt aus dem Admin-Interface heraus, wie gewohnt, nur eben nicht in wp-admin.
- **Setup:** Ein Installer (`setup.js`) übernimmt Ersteinrichtung und Datenbank-Konfiguration, wie man es von einer klassischen WordPress-Installation kennt.

## Warum

Keine neuen Plugins, keine Zusatz-APIs, kein Extra-Werkzeug aus dem WordPress-Ökosystem. WP-Reloaded nutzt ausschließlich das, was WordPress seit Jahren eingebaut mitbringt: die reguläre REST-API. Mehr war nicht nötig.

WordPress von Grund auf neu gedacht, nicht neu erfunden: Der Kern bleibt, weil er robust ist. Alles, was WordPress alt, langsam und angestaubt wirken lässt, ist ersetzt – durch etwas, das WordPress selbst nie gebaut hat.

Kein neues CMS. Kein Fork. WordPress, neu zusammengesteckt.

---

**Stack:** WordPress (PHP/MySQL) · Nuxt 4 · Vue 3 · TypeScript · Tailwind CSS

**Autor:** Peter Päffgen — [Päffgen IT](https://paeffgen-it.de)
