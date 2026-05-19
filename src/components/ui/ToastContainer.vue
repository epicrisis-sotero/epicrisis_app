<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, dismiss } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <TransitionGroup
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border pointer-events-auto max-w-sm text-sm font-medium"
          :class="{
            'bg-brand-50 border-brand-200 text-brand-800': toast.type === 'info',
            'bg-green-50 border-green-200 text-green-800': toast.type === 'success',
            'bg-yellow-50 border-yellow-200 text-yellow-800': toast.type === 'warning',
          }"
        >
          <span class="flex-1">{{ toast.message }}</span>
          <button
            class="opacity-60 hover:opacity-100 transition-opacity"
            @click="dismiss(toast.id)"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
