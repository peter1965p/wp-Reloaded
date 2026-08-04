#!/usr/bin/env node
/**
 * WP-2026 | V7.8 Setup Wizard
 * by Peter Päffgen
 */

import http   from 'http'
import fs     from 'fs'
import path   from 'path'
import crypto from 'crypto'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT      = 4000
const WP_DIR    = path.join(__dirname, 'wordpress')

// ── HTML-Shell ────────────────────────────────────────────────────────────────
const shell = (body) => `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>WP-2026 Setup</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" />
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',system-ui,sans-serif;background:#05070a;color:#e5e7eb;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem}
    .card{background:#0d1117;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:2.5rem;width:100%;max-width:520px}
    .logo{display:flex;align-items:center;gap:10px;margin-bottom:1.8rem}
    .logo-icon{width:36px;height:36px;background:#3b82f6;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;color:#fff}
    .logo-text{font-size:14px;font-weight:700;color:#fff}
    .logo-ver{font-size:11px;color:#64748b;margin-top:1px}
    .steps{display:flex;margin-bottom:2rem}
    .step-item{flex:1;position:relative}
    .step-item:not(:last-child)::after{content:'';position:absolute;top:13px;left:calc(50% + 14px);right:calc(-50% + 14px);height:1px;background:rgba(255,255,255,.08)}
    .step-dot{width:26px;height:26px;border-radius:50%;border:2px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:#64748b;margin:0 auto 6px;position:relative;z-index:1;background:#0d1117}
    .step-dot.active{border-color:#3b82f6;color:#3b82f6}
    .step-dot.done{border-color:#22c55e;background:#22c55e;color:#fff}
    .step-label{text-align:center;font-size:10px;color:#64748b}
    .step-label.active{color:#3b82f6}
    h1{font-size:18px;font-weight:700;color:#fff;margin-bottom:.35rem}
    .sub{font-size:13px;color:#64748b;margin-bottom:1.6rem;line-height:1.5}
    .divider{height:1px;background:rgba(255,255,255,.06);margin:1.4rem 0}
    label{display:block;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.06em;color:#64748b;margin-bottom:6px}
    input{width:100%;background:#05070a;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:10px 14px;font-size:14px;color:#fff;font-family:inherit;outline:none;transition:border-color .2s;margin-bottom:1rem}
    input:focus{border-color:#3b82f6}
    input::placeholder{color:#374151}
    .row{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}
    .hint{font-size:11px;color:#4b5563;margin-top:-.6rem;margin-bottom:1rem;line-height:1.5}
    .btn{width:100%;padding:12px;border-radius:8px;border:none;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .2s}
    .btn-primary{background:#3b82f6;color:#fff}
    .btn-primary:hover{background:#2563eb}
    .btn-primary:disabled{opacity:.4;cursor:not-allowed}
    .alert{padding:12px 14px;border-radius:8px;font-size:13px;margin-bottom:1.2rem;line-height:1.5}
    .alert-err{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#fca5a5}
    .alert-ok{background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.3);color:#86efac}
    .alert-info{background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.3);color:#93c5fd}
    code{background:rgba(255,255,255,.06);padding:2px 7px;border-radius:4px;font-size:12px;font-family:monospace}
    .cmd{background:#05070a;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:14px 16px;font-family:monospace;font-size:13px;color:#86efac;margin:.8rem 0;text-align:center}
    .checklist{list-style:none;margin-bottom:1.5rem;text-align:left}
    .checklist li{font-size:13px;color:#86efac;padding:3px 0}
    .success-icon{width:56px;height:56px;background:rgba(34,197,94,.15);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 1.5rem}
    .spinner{display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite;vertical-align:middle;margin-right:8px}
    @keyframes spin{to{transform:rotate(360deg)}}
    .footer{text-align:center;font-size:11px;color:#374151;margin-top:1.8rem}
  </style>
</head>
<body>${body}</body>
</html>`

const logo = `
<div class="logo">
  <div class="logo-icon">P</div>
  <div>
    <div class="logo-text">WP-2026 <span style="color:#3b82f6">| V7.8</span></div>
    <div class="logo-ver">by Peter Päffgen</div>
  </div>
</div>`

const stepper = (active) => `
<div class="steps">${[
  {n:1,l:'Datenbank'},
  {n:2,l:'WordPress'},
  {n:3,l:'Fertig'},
].map(s => `
  <div class="step-item">
    <div class="step-dot ${s.n < active ? 'done' : s.n === active ? 'active' : ''}">${s.n < active ? '✓' : s.n}</div>
    <div class="step-label ${s.n === active ? 'active' : ''}">${s.l}</div>
  </div>`).join('')}
</div>`

// ── Seite 1: Datenbank ────────────────────────────────────────────────────────
const page1 = shell(`
<div class="card">
  ${logo}${stepper(1)}
  <h1>Datenbankverbindung</h1>
  <p class="sub">WP-2026 erstellt die <code>wp-config.php</code> automatisch — du musst nichts manuell konfigurieren.</p>
  <div id="msg"></div>
  <div class="row">
    <div><label>Datenbank-Host</label><input id="dbHost" value="localhost" /></div>
    <div><label>Datenbank-Name</label><input id="dbName" value="wordpress" /></div>
  </div>
  <div class="row">
    <div><label>Benutzername</label><input id="dbUser" value="root" /></div>
    <div><label>Passwort</label><input id="dbPass" type="password" placeholder="(leer lassen falls kein Passwort)" /></div>
  </div>
  <label>Tabellen-Prefix</label>
  <input id="dbPrefix" value="wp_" />
  <p class="hint">Für mehr Sicherheit z. B. <code>pit_</code> statt <code>wp_</code></p>
  <button class="btn btn-primary" id="btn" onclick="go()">Verbindung prüfen & weiter →</button>
  <div class="footer">WP-2026 | V7.8 · Headless WordPress CMS</div>
</div>
<script>
async function go() {
  const btn = document.getElementById('btn'), msg = document.getElementById('msg')
  const data = {
    dbHost:   document.getElementById('dbHost').value.trim(),
    dbName:   document.getElementById('dbName').value.trim(),
    dbUser:   document.getElementById('dbUser').value.trim(),
    dbPass:   document.getElementById('dbPass').value,
    dbPrefix: document.getElementById('dbPrefix').value.trim() || 'wp_',
  }
  if (!data.dbHost || !data.dbName || !data.dbUser) {
    msg.innerHTML = '<div class="alert alert-err">Bitte Host, Datenbankname und Benutzername ausfüllen.</div>'
    return
  }
  btn.disabled = true
  btn.innerHTML = '<span class="spinner"></span> Verbindung wird geprüft…'
  msg.innerHTML = '<div class="alert alert-info"><span class="spinner"></span> Datenbankverbindung wird getestet…</div>'
  const res = await fetch('/step1', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) })
  const r   = await res.json()
  if (!r.ok) {
    msg.innerHTML = '<div class="alert alert-err">' + r.error + '</div>'
    btn.disabled = false; btn.innerHTML = 'Erneut versuchen →'; return
  }
  window.location.href = '/step2'
}
</script>`)

// ── Seite 2: WP-Verbindung ────────────────────────────────────────────────────
const page2 = shell(`
<div class="card">
  ${logo}${stepper(2)}
  <h1>WordPress-Verbindung</h1>
  <p class="sub"><code>wp-config.php</code> wurde erstellt ✓ — verbinde jetzt das CMS mit deiner WordPress-Installation.</p>
  <div id="msg"></div>
  <label>WordPress-URL</label>
  <input id="wpUrl" type="url" value="http://localhost" />
  <label>WP-Benutzername</label>
  <input id="wpUser" value="admin" />
  <label>Application Password</label>
  <input id="wpPass" type="password" placeholder="xxxx xxxx xxxx xxxx xxxx xxxx" />
  <p class="hint">WP-Admin → Benutzer → Profil → Application Passwords</p>
  <div class="divider"></div>
  <label>Frontend-URL (Produktion)</label>
  <input id="siteUrl" type="url" value="http://localhost:3001" />
  <p class="hint">Für Cloudflare Pages z. B. <code>https://wp.plexora.eu</code></p>
  <button class="btn btn-primary" id="btn" onclick="go()">Installation abschließen →</button>
  <div class="footer">WP-2026 | V7.8 · Headless WordPress CMS</div>
</div>
<script>
async function go() {
  const btn = document.getElementById('btn'), msg = document.getElementById('msg')
  const data = {
    wpUrl:   document.getElementById('wpUrl').value.trim().replace(/\\/$/, ''),
    wpUser:  document.getElementById('wpUser').value.trim(),
    wpPass:  document.getElementById('wpPass').value.trim(),
    siteUrl: document.getElementById('siteUrl').value.trim().replace(/\\/$/, ''),
  }
  if (!data.wpUrl || !data.wpUser || !data.wpPass) {
    msg.innerHTML = '<div class="alert alert-err">Bitte alle Felder ausfüllen.</div>'
    return
  }
  btn.disabled = true
  btn.innerHTML = '<span class="spinner"></span> Verbindung wird geprüft…'
  msg.innerHTML = '<div class="alert alert-info"><span class="spinner"></span> WordPress API wird getestet…</div>'
  const res = await fetch('/step2', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) })
  const r   = await res.json()
  if (!r.ok) {
    msg.innerHTML = '<div class="alert alert-err">' + r.error + '</div>'
    btn.disabled = false; btn.innerHTML = 'Erneut versuchen →'; return
  }
  window.location.href = '/success'
}
</script>`)

// ── Erfolgsseite ──────────────────────────────────────────────────────────────
const pageDone = shell(`
<div class="card" style="text-align:center">
  <div class="logo" style="justify-content:center">
    <div class="logo-icon">P</div>
    <div><div class="logo-text">WP-2026 <span style="color:#3b82f6">| V7.8</span></div><div class="logo-ver">by Peter Päffgen</div></div>
  </div>
  ${stepper(3)}
  <div class="success-icon">✓</div>
  <h1>Installation abgeschlossen!</h1>
  <p class="sub" style="margin-bottom:1.5rem">WP-2026 ist vollständig eingerichtet und einsatzbereit.</p>
  <ul class="checklist">
    <li>✓ Datenbankverbindung erfolgreich</li>
    <li>✓ <code>wordpress/wp-config.php</code> automatisch erstellt</li>
    <li>✓ Geheime Keys generiert</li>
    <li>✓ WordPress API-Verbindung getestet</li>
    <li>✓ <code>admin/.env</code> erstellt</li>
    <li>✓ <code>frontend/.env</code> erstellt</li>
    <li>✓ npm packages installiert</li>
  </ul>
  <p style="font-size:13px;color:#64748b;margin-bottom:.5rem">Beide Server starten mit:</p>
  <div class="cmd">npm run dev</div>
  <div class="footer" style="margin-top:1.5rem">Du kannst dieses Fenster jetzt schließen.</div>
</div>`)

// ── wp-config.php generieren ──────────────────────────────────────────────────
function generateWpConfig(db) {
  const salt = () => crypto.randomBytes(48).toString('base64').slice(0, 64)
  return `<?php
/**
 * WordPress-Konfigurationsdatei
 * Generiert von WP-2026 | V7.8 Setup — by Peter Päffgen
 */

define( 'DB_NAME',     '${db.dbName}' );
define( 'DB_USER',     '${db.dbUser}' );
define( 'DB_PASSWORD', '${db.dbPass}' );
define( 'DB_HOST',     '${db.dbHost}' );
define( 'DB_CHARSET',  'utf8mb4' );
define( 'DB_COLLATE',  '' );

define( 'AUTH_KEY',         '${salt()}' );
define( 'SECURE_AUTH_KEY',  '${salt()}' );
define( 'LOGGED_IN_KEY',    '${salt()}' );
define( 'NONCE_KEY',        '${salt()}' );
define( 'AUTH_SALT',        '${salt()}' );
define( 'SECURE_AUTH_SALT', '${salt()}' );
define( 'LOGGED_IN_SALT',   '${salt()}' );
define( 'NONCE_SALT',       '${salt()}' );

$table_prefix = '${db.dbPrefix}';

define( 'WP_DEBUG',     false );
define( 'WP_DEBUG_LOG', false );

if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', __DIR__ . '/' );
}
require_once ABSPATH . 'wp-settings.php';
`
}

// ── DB testen via mysql CLI ───────────────────────────────────────────────────
function testDbConnection(db) {
  try {
    const passArg = db.dbPass ? `-p${db.dbPass}` : ''
    execSync(
      `mysql -h ${db.dbHost} -u ${db.dbUser} ${passArg} -e "USE \`${db.dbName}\`;" 2>&1`,
      { timeout: 8000 }
    )
    return { ok: true }
  } catch (e) {
    const out = (e.stdout?.toString() || e.stderr?.toString() || e.message || '').trim()
    return { ok: false, error: out.split('\n').pop() || 'Verbindung fehlgeschlagen' }
  }
}

// ── HTTP-Server ───────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const html = (code, content) => { res.writeHead(code, {'Content-Type':'text/html;charset=utf-8'}); res.end(content) }
  const json = (data)          => { res.writeHead(200,  {'Content-Type':'application/json'});        res.end(JSON.stringify(data)) }
  const body = () => new Promise(resolve => { let b = ''; req.on('data', c => b += c); req.on('end', () => resolve(b)) })

  if (req.method === 'GET') {
    if (req.url === '/')        return html(200, page1)
    if (req.url === '/step2')   return html(200, page2)
    if (req.url === '/success') return html(200, pageDone)
    return res.writeHead(404).end()
  }

  if (req.method === 'POST') {
    const data = JSON.parse(await body())

    // Schritt 1 — DB prüfen + wp-config.php schreiben
    if (req.url === '/step1') {
      const test = testDbConnection(data)
      if (!test.ok) return json({ ok: false, error: `Datenbankfehler: ${test.error}` })

      try {
        fs.writeFileSync(path.join(WP_DIR, 'wp-config.php'), generateWpConfig(data))
        console.log('✅ wp-config.php erstellt')
        return json({ ok: true })
      } catch (e) {
        return json({ ok: false, error: 'wp-config.php konnte nicht geschrieben werden: ' + e.message })
      }
    }

    // Schritt 2 — WP-API prüfen + .env Dateien schreiben
    if (req.url === '/step2') {
      try {
        const creds = Buffer.from(`${data.wpUser}:${data.wpPass}`).toString('base64')
        const r = await fetch(`${data.wpUrl}/wp-json/wp/v2/users/me`, {
          headers: { Authorization: `Basic ${creds}` },
          signal: AbortSignal.timeout(8000),
        })
        if (!r.ok) throw new Error(`HTTP ${r.status} — Benutzername oder Application Password falsch?`)
      } catch (e) {
        return json({ ok: false, error: String(e.message || e) })
      }

      const wpContentPath = path.join(__dirname, 'wordpress', 'wp-content')
      fs.writeFileSync(path.join(__dirname, 'admin', '.env'),
        `NUXT_PUBLIC_WP_API_BASE=${data.wpUrl}/wp-json/wp/v2\n` +
        `NUXT_WP_USER=${data.wpUser}\n` +
        `NUXT_WP_APP_PASSWORD=${data.wpPass}\n` +
        `NUXT_WP_CONTENT_PATH=${wpContentPath}\n`
      )
      fs.writeFileSync(path.join(__dirname, 'frontend', '.env'),
        `NUXT_WP_API_BASE=${data.wpUrl}/wp-json/wp/v2\n` +
        `NUXT_PUBLIC_SITE_URL=${data.siteUrl}\n`
      )

      try {
        console.log('\n📦 Installiere Abhängigkeiten…')
        execSync('npm install', { cwd: __dirname, stdio: 'inherit' })
        console.log('✅ Fertig!\n')
      } catch (e) {
        return json({ ok: false, error: 'npm install fehlgeschlagen: ' + e.message })
      }

      json({ ok: true })
      setTimeout(() => {
        console.log('🎉 Setup abgeschlossen. Starte: npm run dev\n')
        server.close()
      }, 2000)
      return
    }
  }
})

server.listen(PORT, '127.0.0.1', () => {
  const url = `http://localhost:${PORT}`
  console.log('\n╔══════════════════════════════════════════╗')
  console.log('║     WP-2026 | V7.8  —  Setup Wizard     ║')
  console.log('║          by Peter Päffgen                ║')
  console.log('╠══════════════════════════════════════════╣')
  console.log(`║  Öffne: ${url}              ║`)
  console.log('╚══════════════════════════════════════════╝\n')
  try { execSync(`xdg-open ${url} 2>/dev/null || open ${url} 2>/dev/null`, { stdio: 'ignore' }) } catch {}
})
