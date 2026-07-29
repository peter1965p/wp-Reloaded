import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

interface ThemeJson {
  settings?: {
    color?: {
      palette?: { name: string; slug: string; color: string }[]
      duotone?: unknown[]
    }
    typography?: {
      fontFamilies?: { name: string; slug: string; fontFamily: string }[]
      fontSizes?: { name: string; slug: string; size: string }[]
    }
    border?: {
      radius?: string
    }
    spacing?: Record<string, unknown>
  }
}

interface AnalyzeResult {
  ok: boolean
  source: 'theme.json' | 'style.css' | 'none'
  themeName: string
  colors: string[]
  fonts: string[]
  borderRadius: string | null
  tokens: {
    pit_primary_color?: string
    pit_accent_color?: string
    pit_font_family?: string
    pit_border_radius?: string
  }
}

// Filtert Schwarz/Weiß/Grau raus — wir wollen echte Farben
function isRealColor(hex: string): boolean {
  const h = hex.replace('#', '')
  if (h.length !== 6) return false
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const saturation = max === 0 ? 0 : (max - min) / max
  return saturation > 0.15 && max > 30 && max < 245
}

// Ersten Font-Namen aus Font-Family-String extrahieren
function extractFontName(fontFamily: string): string {
  return fontFamily.split(',')[0].trim().replace(/['"]/g, '')
}

export default defineEventHandler(async (event): Promise<AnalyzeResult> => {
  const config    = useRuntimeConfig()
  const stylesheet = getRouterParam(event, 'theme')!
  const wpContent  = config.wpContentPath || ''
  const themeDir   = join(wpContent, 'themes', stylesheet)

  const result: AnalyzeResult = {
    ok: false,
    source: 'none',
    themeName: stylesheet,
    colors: [],
    fonts: [],
    borderRadius: null,
    tokens: {},
  }

  if (!existsSync(themeDir)) {
    return { ...result, ok: false }
  }

  // ── theme.json (Block-Themes / FSE) ──────────────────────────────────────
  const themeJsonPath = join(themeDir, 'theme.json')
  if (existsSync(themeJsonPath)) {
    try {
      const raw: ThemeJson = JSON.parse(readFileSync(themeJsonPath, 'utf-8'))
      result.source = 'theme.json'

      // Farben
      const palette = raw.settings?.color?.palette ?? []
      const realColors = palette.map(p => p.color).filter(isRealColor)
      result.colors = realColors.slice(0, 8)

      // Fonts
      const fontFamilies = raw.settings?.typography?.fontFamilies ?? []
      result.fonts = fontFamilies.map(f => extractFontName(f.fontFamily)).filter(Boolean)

      // Border Radius
      if (raw.settings?.border?.radius) {
        result.borderRadius = raw.settings.border.radius.replace(/[^0-9]/g, '') || null
      }

      // Tokens mappen
      if (realColors[0]) result.tokens.pit_primary_color = realColors[0]
      if (realColors[1]) result.tokens.pit_accent_color  = realColors[1]
      if (result.fonts[0])       result.tokens.pit_font_family   = result.fonts[0]
      if (result.borderRadius)   result.tokens.pit_border_radius = result.borderRadius

      result.ok = true
      return result
    } catch { /* weiter zu CSS-Fallback */ }
  }

  // ── style.css Fallback (klassische Themes) ────────────────────────────────
  const cssPath = join(themeDir, 'style.css')
  if (existsSync(cssPath)) {
    try {
      const css = readFileSync(cssPath, 'utf-8')
      result.source = 'style.css'

      // Theme Name aus Header
      const nameMatch = css.match(/Theme Name:\s*(.+)/i)
      if (nameMatch) result.themeName = nameMatch[1].trim()

      // CSS Custom Properties für Farben (WP-Standard: --wp--preset--color--*)
      const wpColorRx = /--wp--preset--color--[\w-]+:\s*(#[0-9a-fA-F]{6})/g
      const wpColors: string[] = []
      let m: RegExpExecArray | null
      while ((m = wpColorRx.exec(css)) !== null) wpColors.push(m[1])

      // Generische CSS-Variablen als Fallback
      const cssVarRx = /--(?:primary|accent|main|brand|color-primary|color-accent)[\w-]*:\s*(#[0-9a-fA-F]{6})/gi
      const cssVarColors: string[] = []
      while ((m = cssVarRx.exec(css)) !== null) cssVarColors.push(m[1])

      const allColors = [...new Set([...cssVarColors, ...wpColors])].filter(isRealColor)
      result.colors = allColors.slice(0, 8)

      // Font-Family aus CSS
      const fontRx = /font-family:\s*['"]?([A-Za-z][A-Za-z0-9 ]+)['"]?(?:\s*,|\s*;)/g
      const fonts: string[] = []
      while ((m = fontRx.exec(css)) !== null) {
        const name = m[1].trim()
        if (name && !['serif', 'sans-serif', 'monospace', 'inherit', 'initial'].includes(name.toLowerCase())) {
          fonts.push(name)
        }
      }
      result.fonts = [...new Set(fonts)].slice(0, 4)

      // Tokens
      if (result.colors[0]) result.tokens.pit_primary_color = result.colors[0]
      if (result.colors[1]) result.tokens.pit_accent_color  = result.colors[1]
      if (result.fonts[0])  result.tokens.pit_font_family   = result.fonts[0]

      result.ok = result.colors.length > 0 || result.fonts.length > 0
      return result
    } catch { /* leer */ }
  }

  return result
})
