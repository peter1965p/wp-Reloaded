export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const base   = config.public.wpApiBase.replace('/wp/v2', '')
  const creds  = Buffer.from(`${config.wpUser}:${config.wpAppPassword}`).toString('base64')

  const cookies = await $fetch<{ name: string; value: string }[]>(
    `${base}/wp2026/v1/admin-cookie`,
    { headers: { Authorization: `Basic ${creds}` } }
  )

  // WP Auth-Cookies an den Browser weitergeben (localhost — kein Port im Cookie-Domain)
  for (const c of cookies) {
    setCookie(event, c.name, c.value, {
      path:     '/',
      maxAge:   2 * 60 * 60,
      httpOnly: false,
      sameSite: 'lax',
    })
  }

  return { ok: true }
})
