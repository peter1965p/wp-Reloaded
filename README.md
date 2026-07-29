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

## Warum ??? 

WordPress 7.0 hat mit WPGraphQL als offiziellem Plugin, der Abilities-API und dem MCP-Adapter die Bausteine für echtes Headless-WordPress geliefert – aber kein fertiges, sofort nutzbares Ergebnis daraus gebaut. WP-Reloaded ist genau das: die Bausteine zusammengesetzt zu einem System, das nach außen nicht mehr wie eine WordPress-Installation aussieht oder sich so anfühlt, aber im Kern eines bleibt.

Kein neues CMS. Kein Fork. WordPress, neu zusammengesteckt.

---

**Stack:** WordPress (PHP/MySQL) · Nuxt 4 · Vue 3 · TypeScript · Tailwind CSS

**Autor:** Peter Päffgen — https://paeffgen-it.de
