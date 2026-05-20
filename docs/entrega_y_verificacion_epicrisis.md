# Documento de Arquitectura, Entrega y Verificación: Datos e Infraestructura de Epicrisis AI

Este documento detalla de manera formal los desafíos de red, base de datos y sincronización a los que nos enfrentamos en el desarrollo de la plataforma **Epicrisis AI**, las decisiones de diseño adoptadas para resolverlos y el estado actual de verificación del sistema con 275 registros.

---

## 1. Desafíos y Problemáticas Enfrentadas

Durante la integración de la plataforma Epicrisis AI, nos enfrentamos a tres problemas críticos que afectaban la seguridad, la conectividad y la consistencia de los datos clínicos:

### A. El Conflicto de Red: Contenido Mixto (Mixed Content) y localhost
* **El síntoma**: La interfaz cliente desplegada de manera segura en la nube (Vercel, usando HTTPS) no lograba realizar peticiones al backend local Express que corría en `http://localhost:3001` en el Mac Studio.
* **La causa**: Los navegadores modernos bloquean por seguridad cualquier petición desde una página HTTPS segura hacia recursos HTTP inseguros (Mixed Content). Adicionalmente, el navegador de un usuario final externo no puede resolver `localhost` hacia la máquina de desarrollo privada (Mac Studio), debido a que ésta se encuentra detrás del cortafuegos y el direccionamiento NAT de la red local.

### B. Desajuste de Identificadores de Pacientes (ID Mismatch)
* **El síntoma**: Al cargar los datos en la base de datos, los registros clínicos no mostraban sus correspondientes PDFs.
* **La causa**: El conjunto de datos de prueba original de 27 pacientes (`seed_data_pdfs.json`) utilizaba un hash generado a partir de nombres de prueba. Por otro lado, la base de datos del proyecto real maneja 275 registros clínicos definitivos (`seed_data.json`) cuyas identidades anonimizadas y hashes no coinciden con los 27 archivos PDF estáticos iniciales en el directorio `uploads/`.

### C. Almacenamiento Inconsistente de Archivos de Epicrisis
* **El síntoma**: Almacenar archivos PDF sueltos en el sistema de archivos local dificultaba el control de versiones de los datos y presentaba un alto riesgo de desvinculación si se eliminaban archivos o si la base de datos se migraba a otro entorno.

---

## 2. Decisiones de Diseño y Solución Arquitectónica

Para abordar estos problemas con robustez y profesionalismo, se implementaron las siguientes soluciones técnicas:

### A. Túnel Reverso SSH y VPS como Puente de Red
En lugar de depender de servicios de terceros (como Ngrok) que introducen latencias y dependencias comerciales, optamos por utilizar un Servidor Virtual Privado (VPS) propio de Hostinger (`2.24.69.49`) como puente seguro:

1. **Túnel SSH Reverso**: El Mac Studio inicia y mantiene una conexión persistente cifrada hacia el VPS:
   ```bash
   ssh -N -R 3001:localhost:3001 root@2.24.69.49
   ```
   Esto mapea el puerto `3001` del VPS directamente al puerto `3001` local de la máquina de desarrollo.
2. **Pasarela HTTPS con Nginx y DNS dinámico**: El VPS cuenta con Nginx configurado para escuchar peticiones HTTPS seguras bajo el dominio dinámico `epicrisis.2.24.69.49.nip.io` y redirigirlas internamente al túnel SSH. De esta forma, el frontend de Vercel realiza peticiones HTTPS válidas que se resuelven de forma transparente en el backend del Mac Studio local.

### B. Consistencia de Archivos Mediante Almacenamiento Binario (`bytea`)
Para asegurar la atomicidad del registro clínico y su archivo adjunto, modificamos el esquema de PostgreSQL para soportar una columna de tipo binario:

* **Esquema de Base de Datos**: La tabla `epicrisis` incluye la columna `pdf_data` con formato `bytea` de PostgreSQL.
* **Carga de Datos Automática**: Al procesar la pipeline o realizar cargas, el script lee el PDF de manera binaria (`Buffer`) y lo inserta en la misma transacción SQL en la que guarda los textos clínicos.
* **Endpoint Dinámico de Servicio**: Se desarrolló un endpoint inteligente en Express `/uploads/:id` que consulta la base de datos en busca de los bytes del PDF y los sirve directamente. Si no están en la base de datos, utiliza un mecanismo de contingencia (*fallback*) que busca en la carpeta física de desarrollo `uploads/`.

---

## 3. Estado de la Entrega y Hito de Verificación

El estado actual del proyecto es estable y verificado con las siguientes acciones concluidas:

### A. Creación y Registro de Skills (Habilidades) del Repositorio
* **Definición de Skill**: Se documentó formalmente la habilidad en [SKILL.md](file:///Users/fabianortega/src/proyecto_sotero_ihealth/skills/epicrisis-db-tunnel/SKILL.md) y se creó su espejo de persistencia en `.claude/skills/epicrisis-db-tunnel/SKILL.md`.
* **Registro LaTeX**: Se actualizó el archivo de compilación [skills_del_repositorio.tex](file:///Users/fabianortega/src/proyecto_sotero_ihealth/documentación/semanas/semana_1/skills/skills_del_repositorio/skills_del_repositorio.tex) para reflejar esta arquitectura formal en el reporte final de la Semana 1. *(Nota: La compilación a PDF se omitió localmente al no contar con un motor de LaTeX en esta máquina).*

### B. Depreciación de Datos de Prueba y Carga de Producción (275 Registros)
* **Limpieza de Datos**: Se descartaron y eliminaron de la base de datos las 27 epicrisis de prueba iniciales de los pacientes ficticios.
* **Carga de Datos Definitivos**: La base de datos local `epicrisis_dev` fue poblada de manera exitosa con **275 registros clínicos reales** a partir de `seed_data.json`.
* **Prueba de Interfaz**: Mediante navegación automatizada, verificamos que la aplicación web (conectada a través del túnel de red de Hostinger) muestra las **275 epicrisis** en el Panel de Administración bajo la pestaña "Matriz de Hallazgos" con sus identificadores correctos.
