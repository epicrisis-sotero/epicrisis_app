<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'

const props = defineProps<{ content: string }>()

marked.use({
  renderer: {
    blockquote(quote: string) {
      return `<div class="epi-badge">${quote}</div>`
    },
    heading(text: string, level: number) {
      if (level === 2) return `<h2 class="epi-section">${text}</h2>`
      if (level === 3) return `<h3 class="epi-subsection">${text}</h3>`
      return `<h${level} class="epi-h${level}">${text}</h${level}>`
    },
    hr() {
      return `<hr class="epi-hr" />`
    },
    strong(text: string) {
      return `<strong class="epi-strong">${text}</strong>`
    },
  },
})

const html = computed(() => {
  const result = marked.parse(props.content, { async: false })
  return typeof result === 'string' ? result : ''
})
</script>

<template>
  <article class="epi-document">
    <div v-html="html" />
  </article>
</template>

<style scoped>
/* ──── Document wrapper ──── */
.epi-document {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-size: 0.9375rem;   /* 15px */
  line-height: 1.75;
  color: #1e293b;
  max-width: 100%;
  word-break: break-word;
  overflow-wrap: break-word;
}

/* ──── Estado badge (blockquote → mortalidad) ──── */
.epi-document :deep(.epi-badge) {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-left: 4px solid #0369a1;
  border-radius: 0 6px 6px 0;
  padding: 0.625rem 1rem;
  margin-bottom: 1.75rem;
  font-size: 0.8125rem;
  color: #0c4a6e;
  line-height: 1.6;
}

/* ──── Section header (##) ──── */
.epi-document :deep(.epi-section) {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #0369a1;
  background: #f0f9ff;
  border-left: 3px solid #0ea5e9;
  padding: 0.4rem 0.75rem;
  margin: 2rem 0 1rem 0;
  border-radius: 0 4px 4px 0;
}

/* ──── Subsection header (###) ──── */
.epi-document :deep(.epi-subsection) {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.25rem;
  margin: 1.5rem 0 0.625rem 0;
}

/* ──── Separator ──── */
.epi-document :deep(.epi-hr) {
  border: none;
  border-top: 1px dashed #cbd5e1;
  margin: 2rem 0;
}

/* ──── Paragraph ──── */
.epi-document :deep(p) {
  margin: 0 0 0.875rem 0;
  text-align: left;
}

/* ──── Lists ──── */
.epi-document :deep(ul),
.epi-document :deep(ol) {
  padding-left: 1.5rem;
  margin: 0.375rem 0 1rem 0;
  list-style: none;
}

.epi-document :deep(li) {
  position: relative;
  padding-left: 0.875rem;
  margin-bottom: 0.35rem;
}

.epi-document :deep(li)::before {
  content: '–';
  position: absolute;
  left: -0.25rem;
  color: #94a3b8;
  font-size: 0.875rem;
}

/* ──── Strong / labels ──── */
.epi-document :deep(.epi-strong),
.epi-document :deep(strong) {
  font-weight: 600;
  color: #0f172a;
}

/* ──── Tables ──── */
.epi-document :deep(table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
  margin: 1rem 0;
}

.epi-document :deep(th) {
  background: #f1f5f9;
  color: #475569;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  padding: 0.5rem 0.75rem;
  text-align: left;
  border-bottom: 2px solid #e2e8f0;
}

.epi-document :deep(td) {
  padding: 0.4rem 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: top;
}

.epi-document :deep(tr:hover td) {
  background: #f8fafc;
}

/* ──── Code / siglas / abreviaturas ──── */
.epi-document :deep(code) {
  font-family: 'JetBrains Mono', 'Menlo', monospace;
  font-size: 0.825em;
  background: #f1f5f9;
  padding: 0.1em 0.35em;
  border-radius: 3px;
  color: #0f172a;
}

/* ──── Em (acrónimos, abreviaturas) ──── */
.epi-document :deep(em) {
  font-style: italic;
  color: #475569;
}

/* ──── Selección de texto resaltada ──── */
.epi-document :deep(::selection) {
  background: #bae6fd;
  color: #0c4a6e;
}
</style>
