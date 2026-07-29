const DESIGN_KEYS = [
  'pit_primary_color',
  'pit_accent_color',
  'pit_font_family',
  'pit_border_radius',
  'pit_header_style',
]

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const base   = config.public.wpApiBase.replace('/wp/v2', '')
  const creds  = Buffer.from(`${config.wpUser}:${config.wpAppPassword}`).toString('base64')

  const settings = await $fetch<Record<string, string>>(`${base}/wp/v2/settings`, {
    headers: { Authorization: `Basic ${creds}` },
  })

  const defaults: Record<string, string> = {
    pit_primary_color: '#3b82f6',
    pit_accent_color:  '#8b5cf6',
    pit_font_family:   'Inter',
    pit_border_radius: '8',
    pit_header_style:  'transparent',
  }

  const result: Record<string, string> = {}
  for (const key of DESIGN_KEYS) {
    result[key] = settings[key] ?? defaults[key]
  }
  return result
})
