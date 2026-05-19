<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { EpicrisisListItem } from '@/stores/epicrisis'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps<{ epicrisis: EpicrisisListItem }>()
const router = useRouter()

const maskedId = computed(() => 
  props.epicrisis.patientId 
    ? `EPC-${String(props.epicrisis.id).padStart(5, '0')} (${props.epicrisis.patientId})`
    : `EPC-${String(props.epicrisis.id).padStart(5, '0')}`
)

const statusConfig = computed(() => {
  const s = props.epicrisis.status
  if (s === 'pending') return { label: 'Pendiente', classes: 'bg-yellow-100 text-yellow-800' }
  if (s === 'in_review') return { label: 'En Revisión', classes: 'bg-blue-100 text-blue-800' }
  return { label: 'Revisada', classes: 'bg-green-100 text-green-800' }
})

const buttonLabel = computed(() =>
  props.epicrisis.status === 'in_review' ? 'Continuar Anotación' : 'Comenzar Anotación'
)

function navigate() {
  router.push({ name: 'annotate', params: { id: props.epicrisis.id } })
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:border-brand-300 hover:shadow-sm transition-all">
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-1">
        <span class="font-mono text-sm font-semibold text-gray-900">{{ maskedId }}</span>
        <span :class="['px-2 py-0.5 rounded-full text-xs font-medium', statusConfig.classes]">
          {{ statusConfig.label }}
        </span>
      </div>
      <p class="text-xs text-gray-400">
        {{ new Date(epicrisis.createdAt).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' }) }}
      </p>
    </div>

    <BaseButton
      v-if="epicrisis.status !== 'reviewed'"
      size="sm"
      @click="navigate"
    >
      {{ buttonLabel }}
    </BaseButton>

    <BaseButton
      v-else
      size="sm"
      variant="ghost"
      @click="navigate"
    >
      Ver
    </BaseButton>
  </div>
</template>
