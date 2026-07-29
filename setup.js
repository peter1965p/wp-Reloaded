#!/usr/bin/env node
/**
 * WP-2026 | V7.8 Setup Wizard
 * by Peter Päffgen
 */

import http from 'http'
import fs   from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = 4000

// ── HTML ─────────────────────────────────────────────────────────────────────
const html = (content, title = 'WP-2026 Setup') => `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: #05070a;
      color: #e5e7eb;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .card {
      background: #0d1117;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 2.5rem;
      width: 100%;
      max-width: 480px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 2rem;
    }
    .logo-icon {
      width: 36px; height: 36px;
      background: #3b82f6;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 16px; color: #fff;
    }
    .logo-text { font-size: 14px; font-weight: 700; color: #fff; }
    .logo-version { font-size: 11px; color: #64748b; margin-top: 1px; }
    h1 { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 0.4rem; }
    .sub { font-size: 13px; color: #64748b; margin-bottom: 2rem; line-height: 1.5; }
    .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 1.5rem 0; }
    .step {
      font-size: 10px; font-weight: 600; letter-spacing: 0.1em;
      text-transform: uppercase; color: #3b82f6; margin-bottom: 1rem;
    }
    label { display: block; font-size: 11px; font-weight: 500; text-transform: uppercase;
            letter-spacing: 0.06em; color: #64748b; margin-bottom: 6px; }
    input {
      width: 100%;
      background: #05070a;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 14px;
      color: #fff;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;
      margin-bottom: 1rem;
    }
    input:focus { border-color: #3b82f6; }
    input::placeholder { color: #374151; }
    .hint { font-size: 11px; color: #4b5563; margin-top: -0.6rem; margin-bottom: 1rem; line-height: 1.5; }
    .btn {
      width: 100%;
      padding: 12px;
      border-radius: 8px;
      border: none;
      font-size: 14px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary {
      background: #3b82f6;
      color: #fff;
    }
    .btn-primary:hover { background: #2563eb; }
    .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
    .alert {
      padding: 12px 14px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 1.2rem;
      line-height: 1.5;
    }
    .alert-err  { background: rgba(239,68,68,0.1);  border: 1px solid rgba(239,68,68,0.3);  color: #fca5a5; }
    .alert-ok   { background: rgba(34,197,94,0.1);  border: 1px solid rgba(34,197,94,0.3);  color: #86efac; }
    .alert-info { background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3); color: #93c5fd; }
    code {
      background: rgba(255,255,255,0.06);
      padding: 2px 7px; border-radius: 4px;
      font-size: 12px; font-family: monospace;
    }
    .success-icon {
      width: 56px; height: 56px;
      background: rgba(34,197,94,0.15);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 24px;
      margin: 0 auto 1.5rem;
    }
    .cmd {
      background: #05070a;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px;
      padding: 14px 16px;
      font-family: monospace;
      font-size: 13px;
      color: #86efac;
      margin: 0.8rem 0;
      text-align: center;
    }
    .spinner {
      display: inline-block; width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      vertical-align: middle; margin-right: 8px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .footer {
      text-align: center;
      font-size: 11px;
      color: #374151;
      margin-top: 2rem;
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>`

// ── Setup Form ────────────────────────────────────────────────────────────────
const formPage = html(`
<div class="card">
  <div class="logo">
    <div class="logo-icon">P</div>
    <div>
      <div class="logo-text">WP-2026 <span style="color:#3b82f6">| V7.8</span></div>
      <div class="logo-version">by Peter Päffgen</div>
    </div>
  </div>

  <h1>Installation</h1>
  <p class="sub">Verbinde WP-2026 mit deiner WordPress-Installation. Du brauchst eine WordPress Application Password.</p>

  <div class="divider"></div>

  <div id="msg"></div>

  <div class="step">Schritt 1 — WordPress-Verbindung</div>

  <label>WordPress-URL</label>
  <input id="wpUrl" type="url" placeholder="https://deine-domain.de" value="http://localhost" />

  <label>Benutzername</label>
  <input id="wpUser" type="text" placeholder="admin" value="admin" />

  <label>Application Password</label>
  <input id="wpPass" type="password" placeholder="xxxx xxxx xxxx xxxx xxxx xxxx" />
  <p class="hint">WP-Admin → Benutzer → Profil → Application Passwords</p>

  <div class="divider"></div>

  <div class="step">Schritt 2 — Frontend-URL</div>

  <label>Frontend-URL (Produktion)</label>
  <input id="siteUrl" type="url" placeholder="https://wp.plexora.eu" value="http://localhost:3001" />
  <p class="hint">Für Cloudflare Pages z. B. <code>https://wp.plexora.eu</code></p>

  <button class="btn btn-primary" id="btn" onclick="install()">Installation starten →</button>

  <div class="footer">WP-2026 | V7.8 · Headless WordPress CMS System</div>
</div>

<script>
async function install() {
  const btn = document.getElementById('btn')
  const msg = document.getElementById('msg')
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
  msg.innerHTML = '<div class="alert alert-info"><span class="spinner"></span> WordPress-Verbindung wird getestet…</div>'

  const res = await fetch('/install', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  const result = await res.json()

  if (!result.ok) {
    msg.innerHTML = '<div class="alert alert-err">' + result.error + '</div>'
    btn.disabled = false
    btn.innerHTML = 'Erneut versuchen →'
    return
  }

  window.location.href = '/success'
}
</script>
`)

// ── Success Page ──────────────────────────────────────────────────────────────
const successPage = html(`
<div class="card" style="text-align:center">
  <div class="logo" style="justify-content:center">
    <div class="logo-icon">P</div>
    <div>
      <div class="logo-text">WP-2026 <span style="color:#3b82f6">| V7.8</span></div>
      <div class="logo-version">by Peter Päffgen</div>
    </div>
  </div>

  <div class="success-icon">✓</div>

  <h1>Installation abgeschlossen!</h1>
  <p class="sub" style="margin-bottom:1.5rem">Alle Konfigurationsdateien wurden erstellt und Abhängigkeiten installiert.</p>

  <div class="alert alert-ok" style="text-align:left;margin-bottom:1.5rem">
    ✓ WordPress-Verbindung erfolgreich getestet<br>
    ✓ <code>admin/.env</code> erstellt<br>
    ✓ <code>frontend/.env</code> erstellt<br>
    ✓ npm packages installiert
  </div>

  <p style="font-size:13px;color:#64748b;margin-bottom:0.5rem">Beide Server starten mit:</p>
  <div class="cmd">npm run dev</div>

  <p style="font-size:13px;color:#64748b;margin:1rem 0 0.5rem">Oder einzeln:</p>
  <div class="cmd">npm run dev:admin &nbsp;&nbsp;&nbsp; # :3000</div>
  <div class="cmd">npm run dev:frontend &nbsp; # :3001</div>

  <div class="footer" style="margin-top:1.5rem">Du kannst dieses Fenster jetzt schließen.</div>
</div>
`)

// ── HTTP Server ───────────────────────────────────────────────────────────────
let setupDone = false

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    return res.end(formPage)
  }

  if (req.method === 'GET' && req.url === '/success') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    return res.end(successPage)
  }

  if (req.method === 'POST' && req.url === '/install') {
    let body = ''
    req.on('data', c => body += c)
    req.on('end', async () => {
      let data
      try { data = JSON.parse(body) } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ ok: false, error: 'Ungültige Eingabe.' }))
      }

      // WordPress-Verbindung testen
      try {
        const testUrl = `${data.wpUrl}/wp-json/wp/v2/users/me`
        const creds   = Buffer.from(`${data.wpUser}:${data.wpPass}`).toString('base64')
        const r = await fetch(testUrl, {
          headers: { Authorization: `Basic ${creds}` },
          signal: AbortSignal.timeout(8000),
        })
        if (!r.ok) throw new Error(`WP API Fehler: HTTP ${r.status} — Benutzername oder Application Password falsch?`)
      } catch (e) {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ ok: false, error: String(e.message || e) }))
      }

      // .env Dateien schreiben
      const adminEnv = [
        `NUXT_PUBLIC_WP_API_BASE=${data.wpUrl}/wp-json/wp/v2`,
        `NUXT_WP_USER=${data.wpUser}`,
        `NUXT_WP_APP_PASSWORD=${data.wpPass}`,
      ].join('\n') + '\n'

      const frontendEnv = [
        `NUXT_PUBLIC_WP_API_BASE=${data.wpUrl}/wp-json/wp/v2`,
        `NUXT_PUBLIC_SITE_URL=${data.siteUrl}`,
      ].join('\n') + '\n'

      fs.writeFileSync(path.join(__dirname, 'admin',    '.env'), adminEnv)
      fs.writeFileSync(path.join(__dirname, 'frontend', '.env'), frontendEnv)

      // npm install
      try {
        console.log('\n📦 Installiere Abhängigkeiten…')
        execSync('npm install', { cwd: __dirname, stdio: 'inherit' })
        console.log('✅ Fertig!\n')
      } catch (e) {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ ok: false, error: 'npm install fehlgeschlagen: ' + e.message }))
      }

      setupDone = true
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true }))

      setTimeout(() => {
        console.log('🎉 Setup abgeschlossen. Server wird beendet.')
        console.log('   Starte jetzt: npm run dev\n')
        server.close()
      }, 2000)
    })
    return
  }

  res.writeHead(404)
  res.end()
})

server.listen(PORT, '127.0.0.1', () => {
  const url = `http://localhost:${PORT}`
  console.log('\n╔══════════════════════════════════════════╗')
  console.log('║     WP-2026 | V7.8  —  Setup Wizard     ║')
  console.log('║          by Peter Päffgen                ║')
  console.log('╠══════════════════════════════════════════╣')
  console.log(`║  Öffne: ${url}              ║`)
  console.log('╚══════════════════════════════════════════╝\n')

  // Browser automatisch öffnen
  try {
    execSync(`xdg-open ${url} 2>/dev/null || open ${url} 2>/dev/null`, { stdio: 'ignore' })
  } catch {}
})
