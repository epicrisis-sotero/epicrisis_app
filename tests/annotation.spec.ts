import { test, expect } from '@playwright/test';

test.describe('Anotación de Comorbilidades', () => {
  test('permite anotar comorbilidades y capturar evidencia', async ({ page }) => {

    // 1. Mocking: Simular que el usuario ya inició sesión
    await page.route('**/api/auth', async route => {
      if (route.request().method() === 'GET') {
        const json = { user: { id: 1, email: 'tester@epicrisis.cl', role: 'annotator', termsAcceptedAt: '2026-05-05T00:00:00Z' } };
        await route.fulfill({ json });
      } else {
        route.continue();
      }
    });

    // 2. Mocking: Simular la epicrisis a anotar
    // Nota: el API retorna `sections` (no `contentMarkdown`, eliminado en c37fbce)
    await page.route('**/api/epicrisis?id=999', async route => {
      const json = {
        epicrisis: {
          id: 999,
          patientId: 'TEST999',
          pdfPath: null,
          status: 'pending',
          assigneeId: 1,
          clinicalData: null,
          llmPredictions: null,
          sections: [
            {
              sectionName: 'resumen_clinico',
              label: 'Resumen Clínico',
              // SectionedViewer convierte "Label: valor" en <strong>Label:</strong> valor
              content: 'Paciente masculino de 65 años con diagnóstico previo de Hipertensión Arterial severa.\n\nHipertensión: Arterial severa. Diagnóstico confirmado por laboratorio.',
              position: 1,
            },
          ],
        },
      };
      await route.fulfill({ json });
    });

    await page.route('**/api/lock', async route => {
      await route.fulfill({ json: { ok: true } });
    });

    // 3. Mocking: Simular que no hay anotaciones previas
    await page.route('**/api/annotations?epicrisisId=999', async route => {
      await route.fulfill({ json: { annotations: [] } });
    });

    // 4. Ir a la vista de anotación directamente
    await page.goto('/annotate/999');

    // Comprobar que cargó la UI con el texto de la sección
    await expect(page.getByText('Paciente masculino de 65 años')).toBeVisible();

    // 5. Interactuar: Marcar como "Sí" el primer criterio
    await page.getByRole('button', { name: 'Sí' }).first().click();

    // Comprobar avance en el progreso — total incluye criterios + datos clínicos + fechas
    // Usamos regex en vez de texto exacto para no acoplarnos al total concreto
    await expect(page.getByText(/^1\/\d+/).first()).toBeVisible();

    // 6. Interactuar: Simular selección de texto en el panel del documento
    // SectionedViewer renderiza "Hipertensión: ..." como <strong>Hipertensión:</strong>
    await page.locator('strong').first().dblclick();

    // 7. Verificar Selección Persistente (Virtual Highlighting)
    // Hacemos clic "afuera" (en el contenedor derecho) para intentar borrar la selección nativa
    await page.locator('.rounded-lg.border').first().click();

    // Verificamos que la API de CSS Highlights mantenga nuestro texto resaltado
    const hasHighlight = await page.evaluate(() => {
      // @ts-ignore
      return CSS.highlights && CSS.highlights.has('epicrisis-selection');
    });
    expect(hasHighlight).toBeTruthy();

    // 8. Hacer clic en "Capturar evidencia"
    await page.getByRole('button', { name: /Capturar evidencia/i }).click();

    // 9. Verificar que el Virtual Highlight se limpió después de capturar
    const isHighlightCleared = await page.evaluate(() => {
      // @ts-ignore
      return CSS.highlights && !CSS.highlights.has('epicrisis-selection');
    });
    expect(isHighlightCleared).toBeTruthy();

    // 10. Verificar que la evidencia se guardó en la caja amarilla del criterio activo
    await expect(page.locator('.bg-yellow-50').first()).toContainText('Hipertensión');
  });
});
