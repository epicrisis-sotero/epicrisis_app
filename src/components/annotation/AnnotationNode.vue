<script setup lang="ts">
import { ref, computed, inject, watch } from 'vue'
import type { Ref } from 'vue'
import { useAnnotationStore } from '@/stores/annotation'
import type { FormNode } from '@/constants/formSchema'
import { normalizeFecha } from '@/utils/fecha'

const props = defineProps<{
  node: FormNode
  isReadOnly?: boolean
  depth: number
}>()

const annotationStore = useAnnotationStore()

const state = computed(() => {
  return annotationStore.criteria.find(c => c.criterionName === props.node.key) || {
    criterionName: props.node.key,
    isPresent: null,
    evidenceText: '',
    comments: '',
    difficulty: null,
    difficultyNotes: '',
    llm: null
  }
})

// Expanded state for accordion blocks / mothers
const isExpanded = ref(props.depth === 0) // Expand top level blocks by default
const savedExpandedState = ref(props.depth === 0)

// HU-033: Inject collapse signal from AnnotationTree
const collapseSignal = inject<Ref<number>>('collapseSignal', ref(0))
const isAllCollapsed = inject<Ref<boolean>>('isAllCollapsed', ref(false))

watch(collapseSignal, () => {
  if (props.node.type === 'mother') {
    if (isAllCollapsed.value) {
      // Collapsing: save current state and collapse
      savedExpandedState.value = isExpanded.value
      isExpanded.value = false
    } else {
      // Restoring: bring back saved state
      isExpanded.value = savedExpandedState.value
    }
  }
})

// Check if node is currently active (focused) for capturing text
const isActive = computed(() => {
  if (props.node.type === 'leaf') {
    return annotationStore.activeCriterionName === props.node.key
  }
  if (props.node.type === 'date') {
    return annotationStore.activeMetadataField === props.node.key
  }
  return false
})

const showEvidence = computed(() => {
  return isActive.value || state.value.isPresent !== null || !!state.value.evidenceText
})

// Mother visibility check for children:
// A mother node displays its children only if its state is NOT 'No' and NOT null (unanswered)
const isMotherActive = computed(() => {
  return state.value.isPresent === true || state.value.isPresent === 'unknown'
})

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

function activate() {
  if (props.isReadOnly) return
  if (props.node.type === 'leaf') {
    annotationStore.setActive(props.node.key)
  } else if (props.node.type === 'date' || props.node.type === 'text') {
    annotationStore.setActiveMetadata(props.node.key)
  }
}

function setPresent(value: boolean | null | 'unknown') {
  if (props.isReadOnly) return
  
  // Apply mutually exclusive rules if defined
  if (value === true || value === 'unknown') {
    if (props.node.mutuallyExclusiveWith) {
      for (const siblingKey of props.node.mutuallyExclusiveWith) {
        annotationStore.setIsPresent(siblingKey, null)
      }
    }
    activate()
  }

  annotationStore.setIsPresent(props.node.key, value)
}

function onCommentsInput(e: Event) {
  annotationStore.setComments(props.node.key, (e.target as HTMLTextAreaElement).value)
}

function onDateInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  annotationStore.setEvidence(props.node.key, val)
}

function onDateBlur(e: FocusEvent) {
  const val = (e.target as HTMLInputElement).value
  const norm = normalizeFecha(val)
  annotationStore.setEvidence(props.node.key, norm)
}

function onSelectChange(e: Event) {
  const val = (e.target as HTMLInputElement | HTMLSelectElement).value
  // Save selected choice inside evidenceMetadata
  const currentMeta = (state.value as any).evidenceMetadata || {}
  annotationStore.injectEvidenceToActive(state.value.evidenceText, '') // Clear highlight association
  const newState = annotationStore.criteria.find(c => c.criterionName === props.node.key)
  if (newState) {
    newState.evidenceMetadata = { ...currentMeta, value: val }
  }
}

function onMetadataDateBlur(e: FocusEvent) {
  const val = (e.target as HTMLInputElement).value
  const norm = normalizeFecha(val)
  const currentMeta = (state.value as any).evidenceMetadata || {}
  const newState = annotationStore.criteria.find(c => c.criterionName === props.node.key)
  if (newState) {
    newState.evidenceMetadata = { ...currentMeta, value: norm }
  }
}

function onSuspicionChange(e: Event) {
  const val = (e.target as HTMLSelectElement).value
  const currentMeta = (state.value as any).evidenceMetadata || {}
  const newState = annotationStore.criteria.find(c => c.criterionName === props.node.key)
  if (newState) {
    newState.evidenceMetadata = { ...currentMeta, suspicion: val }
  }
}

// Check if this node is visible based on parent's toggle
const isVisible = computed(() => {
  return true
})
</script>

<template>
  <div v-show="isVisible" class="space-y-1.5 transition-all">
    <!-- ── TYPE: MOTHER ── -->
    <div v-if="node.type === 'mother'" class="border border-gray-100 rounded-lg bg-gray-50/50 overflow-hidden shadow-xs">
      <div 
        class="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100 cursor-pointer hover:bg-gray-100/70 transition-colors"
        @click="toggleExpand"
      >
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <!-- Expand icon -->
          <svg 
            class="w-4 h-4 text-gray-400 transform transition-transform duration-200 flex-shrink-0"
            :class="{ 'rotate-90': isExpanded }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
          </svg>
          <span class="text-xs font-bold text-gray-700 select-none truncate">
            {{ node.label }}
          </span>
        </div>

        <!-- Mother toggle [Sí] [No] -->
        <div class="flex gap-1 flex-shrink-0" @click.stop>
          <button
            :class="[
              'px-2 py-0.5 rounded text-[10px] font-bold transition-colors border',
              state.isPresent === true
                ? 'bg-green-500 text-white border-green-500 shadow-sm'
                : 'bg-white text-gray-500 border-gray-200 hover:bg-green-50',
            ]"
            :disabled="isReadOnly"
            @click="setPresent(state.isPresent === true ? null : true)"
          >Sí</button>
          <button
            :class="[
              'px-2 py-0.5 rounded text-[10px] font-bold transition-colors border',
              state.isPresent === false
                ? 'bg-red-500 text-white border-red-500 shadow-sm'
                : 'bg-white text-gray-500 border-gray-200 hover:bg-red-50',
            ]"
            :disabled="isReadOnly"
            @click="setPresent(state.isPresent === false ? null : false)"
          >No</button>
        </div>
      </div>

      <!-- Mother Children -->
      <div 
        v-show="isExpanded" 
        class="p-2.5 bg-white border-t border-gray-50 space-y-2"
        :style="{ paddingLeft: `${(depth + 1) * 6 + 10}px` }"
      >
        <AnnotationNode
          v-for="child in node.children"
          :key="child.key"
          :node="child"
          :is-read-only="isReadOnly"
          :depth="depth + 1"
        />
      </div>
    </div>

    <!-- ── TYPE: LEAF ── -->
    <div 
      v-else-if="node.type === 'leaf'" 
      :data-criterion="node.key"
      data-capture-zone
      :class="[
        'p-2 rounded-lg border transition-all cursor-pointer',
        isActive ? 'border-brand-400 bg-brand-50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'
      ]"
      @click="activate"
    >
      <div class="flex items-center justify-between gap-2">
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-gray-800 leading-tight">
            {{ node.label }}
          </p>
          <p v-if="node.icd10Hint" class="text-[9px] text-gray-400 font-mono mt-0.5">{{ node.icd10Hint }}</p>
        </div>

        <!-- 3-State Toggle [Sí] [No] [?] -->
        <div class="flex gap-1 flex-shrink-0" @click.stop>
          <button
            :class="[
              'px-2 py-0.5 rounded text-[10px] font-bold transition-colors border',
              state.isPresent === true
                ? 'bg-green-500 text-white border-green-500 shadow-sm'
                : 'bg-white text-gray-500 border-gray-200 hover:bg-green-50',
            ]"
            :disabled="isReadOnly"
            @click="setPresent(state.isPresent === true ? null : true)"
          >Sí</button>
          <button
            :class="[
              'px-2 py-0.5 rounded text-[10px] font-bold transition-colors border',
              state.isPresent === false
                ? 'bg-red-500 text-white border-red-500 shadow-sm'
                : 'bg-white text-gray-500 border-gray-200 hover:bg-red-50',
            ]"
            :disabled="isReadOnly"
            @click="setPresent(state.isPresent === false ? null : false)"
          >No</button>
          <button
            :class="[
              'px-2 py-0.5 rounded text-[10px] font-bold transition-colors border',
              state.isPresent === 'unknown'
                ? 'bg-gray-500 text-white border-gray-500 shadow-sm'
                : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-100',
            ]"
            :disabled="isReadOnly"
            title="No se puede determinar a partir de la epicrisis"
            @click="setPresent(state.isPresent === 'unknown' ? null : 'unknown')"
          >?</button>
        </div>
      </div>

      <!-- Evidence block (if Sí or ? is selected) -->
      <Transition
        enter-active-class="transition-all duration-150 ease-out overflow-hidden"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-40"
        leave-active-class="transition-all duration-100 ease-in overflow-hidden"
        leave-from-class="opacity-100 max-h-40"
        leave-to-class="opacity-0 max-h-0"
      >
        <div v-show="showEvidence" class="mt-2 border-t border-gray-50 pt-2 space-y-1.5" @click.stop>
          
          <!-- Suspicion Dropdown (only for '?') -->
          <div v-if="state.isPresent === 'unknown'" class="flex items-center justify-between gap-2">
            <span class="text-[10px] text-orange-600 font-bold uppercase tracking-wider">Sospecha clínica</span>
            <select 
              :value="(state as any).evidenceMetadata?.suspicion || ''"
              :disabled="isReadOnly"
              class="rounded border border-orange-200 px-2 py-0.5 text-[10px] text-orange-700 bg-orange-50/50 outline-none"
              @change="onSuspicionChange"
            >
              <option value="">— Elegir sospecha —</option>
              <option value="Alto">Alto</option>
              <option value="Bajo">Bajo</option>
              <option value="Indeterminado">Indeterminado</option>
            </select>
          </div>

          <!-- Date value block if leaf is a date check -->
          <div v-if="state.isPresent === true && (node.key.includes('fecha') || node.key.includes('inicio') || node.key.includes('termino') || node.key.includes('realizacion'))" class="flex items-center justify-between gap-2">
            <span class="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Valor Fecha</span>
            <input 
              type="text" 
              placeholder="DD/MM/AAAA"
              :value="(state as any).evidenceMetadata?.value || ''"
              :disabled="isReadOnly"
              class="w-32 rounded border border-gray-200 px-2 py-0.5 text-xs text-gray-700 outline-none focus:border-brand-400 bg-white"
              @input="onSelectChange"
              @blur="onMetadataDateBlur"
            />
          </div>

          <!-- Highlight evidence text -->
          <div class="flex items-center justify-between">
            <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-wider">
              Evidencia (ground truth)
            </label>
            <button
              v-if="state.evidenceText && !isReadOnly"
              class="text-[10px] text-gray-400 hover:text-red-500 transition-colors leading-none"
              title="Limpiar evidencia"
              @click.stop="annotationStore.setEvidence(node.key, '')"
            >✕ limpiar</button>
          </div>
          <div
            :class="[
              'min-h-[28px] rounded border px-2 py-1.5 text-xs font-mono leading-relaxed transition-colors',
              state.evidenceText
                ? 'bg-yellow-50 border-yellow-300 text-gray-800'
                : 'bg-gray-50 border-gray-200 text-gray-400 italic',
            ]"
          >
            {{ state.evidenceText || 'Selecciona texto en el documento y presiona "Capturar"' }}
          </div>

          <!-- Comments (when row is active) -->
          <div v-show="isActive" class="space-y-1.5 pt-1.5 border-t border-gray-100">
            
            <!-- Comment text -->
            <div>
              <label class="block text-[9px] font-medium text-gray-400 mb-0.5 uppercase tracking-wider">
                Comentario {{ state.isPresent === 'unknown' ? '(obligatorio)' : '(opcional)' }}
              </label>
              <textarea
                :value="state.comments"
                :readonly="isReadOnly"
                rows="2"
                placeholder="Indica observaciones sobre la extracción o el estado de duda..."
                class="w-full resize-none rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 placeholder-gray-300 focus:outline-none focus:border-brand-400 bg-white"
                @input="onCommentsInput"
              />
            </div>
          </div>
        </div>
      </Transition>

      <!-- Children of leaves (e.g. subfields under VMI, or habits subfields like carga tabáquica) -->
      <div 
        v-if="node.children && isMotherActive" 
        class="mt-2.5 pl-3 border-l-2 border-brand-200 space-y-2"
        @click.stop
      >
        <AnnotationNode
          v-for="child in node.children"
          :key="child.key"
          :node="child"
          :is-read-only="isReadOnly"
          :depth="depth + 1"
        />
      </div>
    </div>

    <!-- ── TYPE: SELECT (e.g. calidad) ── -->
    <div 
      v-else-if="node.type === 'select'" 
      class="p-2 border border-gray-100 rounded-lg bg-white space-y-2 shadow-xs"
    >
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs font-bold text-gray-700">{{ node.label }}</span>
        <select 
          :value="(state as any).evidenceMetadata?.value || ''"
          :disabled="isReadOnly"
          class="rounded border border-gray-200 px-2.5 py-1 text-xs text-gray-700 bg-white outline-none focus:border-brand-400"
          @change="onSelectChange"
        >
          <option value="">— Seleccionar —</option>
          <option v-for="opt in node.choices" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </div>
    </div>

    <!-- ── TYPE: TEXT (e.g. calidad.comentario) ── -->
    <div 
      v-else-if="node.type === 'text'" 
      data-capture-zone
      class="p-2 border border-gray-100 rounded-lg bg-white space-y-1.5 shadow-xs"
    >
      <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ node.label }}</label>
      <textarea
        :value="state.evidenceText"
        :readonly="isReadOnly"
        rows="3"
        placeholder="Escribe comentarios u observaciones finales aquí..."
        class="w-full resize-none rounded border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700 outline-none focus:border-brand-400 bg-white disabled:bg-gray-50"
        @input="annotationStore.setEvidence(node.key, ($event.target as HTMLTextAreaElement).value)"
        @focus="activate"
      />
    </div>

    <!-- ── TYPE: DATE (Simple Dates) ── -->
    <div 
      v-else-if="node.type === 'date'" 
      data-capture-zone
      class="p-2 border border-gray-100 rounded-lg bg-white space-y-1.5 shadow-xs"
      :class="{ 'border-brand-400 bg-brand-50 shadow-sm': isActive }"
      @click="activate"
    >
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs font-bold text-gray-700">{{ node.label }}</span>
        <input 
          type="text" 
          placeholder="DD/MM/AAAA"
          :value="state.evidenceText"
          :disabled="isReadOnly"
          class="w-32 rounded border border-gray-200 px-2.5 py-1 text-xs text-gray-700 outline-none focus:border-brand-400 bg-white disabled:bg-gray-50"
          @input="onDateInput"
          @blur="onDateBlur"
          @click.stop
        />
      </div>
    </div>
  </div>
</template>
