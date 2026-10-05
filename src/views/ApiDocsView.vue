<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api, ApiError } from '@/services/api'
import BaseLoader from '@/components/ui/BaseLoader.vue'

// Swagger se sirve desde el propio frontend, no navegando al túnel.
// Motivo: una navegación de pestaña no puede llevar cabeceras, y el plan
// gratuito de ngrok intercepta toda navegación de navegador para mostrar su
// aviso — así que la página de Swagger del backend nunca llegaba a cargar.
// Aquí la especificación se trae por XHR (que sí lleva Authorization y el
// header que salta ese aviso) y se renderiza en este mismo origen.
const container = ref<HTMLDivElement | null>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const spec = await api.get<Record<string, unknown>>('/research/openapi.json')

    const [{ default: SwaggerUIBundle }] = await Promise.all([
      import('swagger-ui-dist/swagger-ui-bundle.js'),
      import('swagger-ui-dist/swagger-ui.css'),
    ])

    SwaggerUIBundle({
      spec,
      domNode: container.value,
      // Las respuestas de la cohorte traen miles de evidencias y el
      // highlighter recursivo de Swagger desborda la pila con esos JSON.
      syntaxHighlight: { activated: false },
      defaultModelExpandDepth: 0,
      defaultModelRendering: 'model',
      persistAuthorization: false,
      tryItOutEnabled: true,
      // "Try it out" sale desde el navegador hacia el túnel: necesita el token
      // y el header que evita la página de aviso de ngrok.
      requestInterceptor: (req: { headers: Record<string, string> }) => {
        const token = localStorage.getItem('auth_token')
        if (token) req.headers['Authorization'] = `Bearer ${token}`
        req.headers['ngrok-skip-browser-warning'] = 'true'
        return req
      },
    })
  } catch (e) {
    error.value = e instanceof ApiError && e.status === 401
      ? 'La sesión expiró. Cierra sesión, vuelve a entrar y reintenta.'
      : e instanceof ApiError && e.status === 403
        ? 'Solo los administradores pueden ver la documentación de la API.'
        : e instanceof Error ? e.message : 'No se pudo cargar la documentación.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-full bg-white">
    <div v-if="loading" class="flex items-center justify-center py-20">
      <BaseLoader message="Cargando documentación de la API…" />
    </div>
    <div v-else-if="error" class="max-w-xl mx-auto mt-16 rounded-lg border border-red-200 bg-red-50 p-4">
      <p class="text-sm font-semibold text-red-700">No se pudo abrir la documentación</p>
      <p class="mt-1 text-sm text-red-600">{{ error }}</p>
    </div>
    <div ref="container" data-testid="swagger-container" />
  </div>
</template>
