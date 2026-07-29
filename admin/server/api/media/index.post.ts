export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const credentials = Buffer.from(`${config.wpUser}:${config.wpAppPassword}`).toString('base64')

  const formData = await readMultipartFormData(event)
  if (!formData?.length) throw createError({ statusCode: 400, message: 'Keine Datei' })

  const file = formData[0]!
  const filename = file.filename ?? 'upload'

  return $fetch(`${config.public.wpApiBase}/media`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type': file.type ?? 'application/octet-stream',
    },
    body: file.data,
  })
})
