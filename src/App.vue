<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'

const route = useRoute()
const layout = computed(() => (route.meta.layout === 'auth' ? 'auth' : 'main'))
</script>

<template>
  <AuthLayout v-if="layout === 'auth'">
    <RouterView />
  </AuthLayout>
  <MainLayout v-else>
    <RouterView />
  </MainLayout>
  <ToastContainer />
</template>
