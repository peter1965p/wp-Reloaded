export interface PluginMenuItem {
  title: string
  page:  string
  icon:  string
}

export default defineEventHandler(async (): Promise<PluginMenuItem[]> => {
  const config  = useRuntimeConfig()
  const wpBase  = config.public.wpApiBase
    .replace('/wp-json/wp/v2', '')
    .replace('/wp/v2', '')

  const menuUrl = `${wpBase}/wp-content/plugins/wp2026-slider/wp2026-admin-menu.php`

  return $fetch<PluginMenuItem[]>(menuUrl).catch(() => [])
})
