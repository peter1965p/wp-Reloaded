export interface PluginMenuItem {
  title: string
  page:  string
  icon:  string
}

export default defineEventHandler(async (): Promise<PluginMenuItem[]> => {
  const config = useRuntimeConfig()
  const base   = config.public.wpApiBase.replace('/wp/v2', '')
  const creds  = Buffer.from(`${config.wpUser}:${config.wpAppPassword}`).toString('base64')

  return $fetch<PluginMenuItem[]>(`${base}/wp2026/v1/admin-menu`, {
    headers: { Authorization: `Basic ${creds}` },
  }).catch(() => [])
})
