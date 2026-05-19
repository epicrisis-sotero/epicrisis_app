import { test, expect } from '@playwright/test';

test.describe('Autenticación y Login', () => {
  test('la página de login carga correctamente', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Vite App|Epicrisis/i);

    // Check that the brand text is visible anywhere on the page
    await expect(page.getByText('EPICRISIS AI').first()).toBeVisible();

    // Check that the form inputs exist
    await expect(page.getByLabel(/Correo Institucional/i)).toBeVisible();
    await expect(page.getByLabel(/Contraseña/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /ENTRAR AL PANEL/i })).toBeVisible();
  });

  test('muestra error con credenciales inválidas', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/Correo Institucional/i).fill('admin@epicrisis.cl');
    await page.getByLabel(/Contraseña/i).fill('contraseña_incorrecta_123');
    
    await page.getByRole('button', { name: /ENTRAR AL PANEL/i }).click();

    // Verify error message appears (could be 'Credenciales inválidas' or similar)
    await expect(page.getByText(/inválid|incorrect|error/i).first()).toBeVisible({ timeout: 10000 });
  });
});

