# Resumen de Cambios: Estabilidad, Barra de Progreso y Captura de Fechas

Este documento resume los cambios realizados en la sesión para limpiar la base de datos, automatizar despliegues y corregir errores en el guardado de epicrisis.

## 1. Purga del Campo JSON Antiguo
Se decidió abandonar el uso del campo JSON `clinical_data` en la tabla `epicrisis` y enfocarse exclusivamente en el modelo relacional.

*   **Base de Datos:** Se eliminó la columna `clinical_data` de la tabla `epicrisis` mediante un comando SQL directo.
*   **Esquema (`db/schema.ts`):** Se eliminó la definición comentada de `clinicalData` y la interfaz duplicada `ClinicalData`.
*   **Limpieza:** Se borraron los scripts `migrate_clinical_data.ts` y `validate_migration.ts` que ya no eran necesarios.

## 2. Automatización en GitHub Actions
Se configuró el pipeline de CI/CD para que actualice la base de datos automáticamente.

*   **Archivo:** `.github/workflows/ci.yml`
*   **Cambio:** Se agregó el paso `Push DB Schema` que corre `npm run db:push` en cada push a la rama `main`.
*   **Requisito:** Se debe configurar el Secret `DATABASE_URL` en GitHub.

*   **Problema:** El endpoint intentaba usar `db.transaction` y filtrado incompleto. El driver HTTP serverless **no soporta transacciones**, lo que causaba un Error 500 al intentar guardar.
*   **Solución:** 
    *   Se eliminó el bloque de transacción y se cambió a operaciones secuenciales.
    *   Se excluyó `epicrisisId` del objeto de actualización en `onConflictDoUpdate`.
    *   Se implementó un filtro robusto usando `getTableColumns` para ignorar basura enviada desde el frontend.

## 4. Barra de Progreso y Validación de Completitud
Se mejoró la experiencia del anotador para asegurar que no se envíen datos incompletos.

*   **Alcance Expandido:** La barra de progreso pasó de contar solo 15 comorbilidades a contar **32 ítems críticos** (15 comorbilidades, 4 fechas clínicas y 13 campos clínicos obligatorios como VMI, DVA, etc.).
*   **Validación de Envío:** El botón "Enviar anotación" ahora se habilita únicamente cuando el progreso llega al 100%, garantizando que todo el Ground Truth necesario ha sido revisado.

## 5. Mejoras en UI: Fechas y Captura de Evidencia
Se facilitó la entrada de datos manuales para reducir la carga cognitiva del usuario.

*   **Selectores Nativos:** Los campos de fecha ahora utilizan `type="date"`, permitiendo usar el calendario nativo del sistema.
*   **Captura por Selección:** Se habilitó el sistema de "Captura" para fechas y para el comentario final. Ahora el usuario puede seleccionar una fecha en el texto de la epicrisis y "capturarla" directamente en el campo activo, igual que con las comorbilidades.
*   **Resaltado de Campo Activo:** Los campos de fecha y comentarios muestran un resaltado visual cuando están listos para recibir una captura de texto.

## 4. Script de Prueba (Cascade)
*   **Archivo:** `scripts/test_cascade.ts`
*   **Función:** Crea un registro de prueba, se pausa para permitir verificación visual en Neon/App, y luego lo borra para validar que el `ON DELETE CASCADE` funcione correctamente en las tablas relacionadas.

---
*Documento actualizado por Antigravity (AI Assistant) el 13 de Mayo de 2026.*
