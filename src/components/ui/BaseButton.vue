<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}>()
</script>

<template>
  <button
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed',
      size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-5 py-3 text-base' : 'px-4 py-2 text-sm',
      variant === 'secondary' ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300'
        : variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-400'
        : variant === 'ghost' ? 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-300'
        : 'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-400',
    ]"
  >
    <span v-if="loading" class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
    <slot />
  </button>
</template>
