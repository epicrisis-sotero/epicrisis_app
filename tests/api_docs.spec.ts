import { test, expect } from '@playwright/test'

// Verifica el arreglo de la documentación: Swagger se renderiza en el propio
// origen del frontend. Antes se navegaba al túnel de ngrok, que intercepta las
// navegaciones de navegador y servía su página de aviso en vez de Swagger.
const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBlcGljcmlzaXMuY2wiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3OTEyMTQxMTUsImV4cCI6MTc5MTIxNTAxNX0.wRZiJUdMTu5x_kpYPGrA1Z7pvWuC9AVDic8GON5GFSo'

test('la ruta /documentacion-api renderiza Swagger UI sin pasar por el túnel', async ({ page }) => {
  await page.addInitScript(t => localStorage.setItem('auth_token', t as string), TOKEN)

  const fallos: string[] = []
  page.on('console', m => { if (m.type() === 'error') fallos.push(m.text()) })

  await page.goto('/documentacion-api')

  // el contenedor de Swagger debe poblarse
  await expect(page.locator('.swagger-ui')).toBeVisible({ timeout: 30000 })
  // y mostrar el título del spec que entrega el backend
  await expect(page.getByText('Epicrisis Research API').first()).toBeVisible({ timeout: 15000 })
  // las dos rutas del spec
  await expect(page.getByText('/api/research/cases').first()).toBeVisible({ timeout: 15000 })

  // no debe aparecer nada de la página de aviso de ngrok
  const html = await page.content()
  expect(html).not.toContain('You are about to visit')
  expect(html).not.toContain('ERR_NGROK')

  console.log('errores de consola:', fallos.length ? fallos.slice(0, 3) : 'ninguno')
})
