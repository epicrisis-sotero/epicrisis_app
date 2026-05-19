<script setup lang="ts">
defineProps<{ message?: string }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 py-12 text-gray-500">
    <div class="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" style="border-width: 3px;" />
    <p v-if="message" class="text-sm">{{ message }}</p>
  </div>
</template>
