#!/usr/bin/env bash
# WP-Reloaded — Ein-Befehl-Installation für einen frischen Linux-VPS.
# Fragt nur nach der Domain, macht den Rest automatisch (Docker, Zufalls-
# passwörter, HTTPS via Caddy/Let's Encrypt).
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

echo "── WP-Reloaded Setup ─────────────────────────────────────────"

# ── Domain abfragen (oder als erstes Argument übergeben) ───────────────────
DOMAIN="${1:-}"
if [ -z "$DOMAIN" ]; then
  read -rp "Domain (z.B. cms.deine-domain.de, muss bereits per DNS auf diesen Server zeigen): " DOMAIN
fi
if [ -z "$DOMAIN" ]; then
  echo "Fehler: Domain darf nicht leer sein." >&2
  exit 1
fi

# ── Docker installieren, falls nicht vorhanden ──────────────────────────────
if ! command -v docker >/dev/null 2>&1; then
  echo "→ Docker nicht gefunden, installiere über das offizielle Setup-Skript…"
  curl -fsSL https://get.docker.com | sh
fi
if ! docker compose version >/dev/null 2>&1; then
  echo "Fehler: 'docker compose' ist nicht verfügbar. Bitte Docker-Installation prüfen." >&2
  exit 1
fi

# ── .env mit zufälligen Passwörtern erzeugen (nur beim ersten Lauf) ────────
if [ ! -f .env ]; then
  echo "→ Erzeuge .env mit zufälligen Datenbank-Passwörtern…"
  {
    echo "DOMAIN=${DOMAIN}"
    echo "DB_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)"
    echo "DB_ROOT_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)"
  } > .env
else
  # Domain in bestehender .env aktualisieren, Passwörter bleiben unangetastet
  if grep -q '^DOMAIN=' .env; then
    sed -i "s/^DOMAIN=.*/DOMAIN=${DOMAIN}/" .env
  else
    echo "DOMAIN=${DOMAIN}" >> .env
  fi
fi

# ── Stack starten ────────────────────────────────────────────────────────
echo "→ Starte WordPress, MySQL und Caddy (HTTPS)…"
docker compose up -d

cat <<EOF

── Fertig ────────────────────────────────────────────────────────
WordPress läuft unter https://${DOMAIN}
(kann beim allerersten Start 1-2 Minuten dauern, bis Let's Encrypt
das Zertifikat ausgestellt hat)

Nächste Schritte:
1. https://${DOMAIN} öffnen — WordPress zeigt die eigene 5-Minuten-
   Installation (Website-Titel, Admin-Benutzer/-Passwort).
2. Unter Benutzer → Profil → Anwendungspasswörter ein Application
   Password erzeugen.
3. admin/.env und frontend/.env lokal damit befüllen (siehe README,
   Abschnitt "Admin + Frontend deployen") und admin/frontend separat
   deployen (z.B. Cloudflare Pages).
EOF
