import { onMounted, onUnmounted, toRef, watch } from 'vue'
import { useAnnotationStore } from '@/stores/annotation'

export function useTextSelection(containerRef: { value: HTMLElement | null }) {
  const store = useAnnotationStore()

  function updatePersistentHighlight() {
    if (!('highlights' in CSS)) return;
    
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || !selection.toString().trim()) return

    const range = selection.getRangeAt(0)
    const isInside = containerRef.value && containerRef.value.contains(range.commonAncestorContainer)
    
    if (isInside) {
      // @ts-ignore
      CSS.highlights.clear()
      // @ts-ignore
      const highlight = new Highlight(range.cloneRange())
      // @ts-ignore
      CSS.highlights.set('epicrisis-selection', highlight)
    }
  }

  function clearPersistentHighlight() {
    if ('highlights' in CSS) {
      // @ts-ignore
      CSS.highlights.clear()
    }
  }

  watch(() => store.hasSelection, (hasSelection) => {
    if (!hasSelection) {
      clearPersistentHighlight()
    }
  })

  function onSelectionChange() {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const text = selection.toString().trim()
    if (!text) return

    if (containerRef.value) {
      const range = selection.getRangeAt(0)
      const isInside = containerRef.value.contains(range.commonAncestorContainer)
      if (isInside) {
        store.selectedText = text
        store.hasSelection = true
      }
    }
  }

  function onMouseUp(e: MouseEvent) {
    const selection = window.getSelection()
    const text = selection?.toString().trim()

    const isClickInside = containerRef.value && containerRef.value.contains(e.target as Node)
    
    if (isClickInside && !text) {
      store.selectedText = ''
      store.hasSelection = false
      clearPersistentHighlight()
    } else if (isClickInside && text) {
      updatePersistentHighlight()
    }
  }

  function captureAndReturn(): string {
    const text = store.selectedText
    store.clearGlobalSelection() // This sets hasSelection to false, which triggers the watcher to clear highlights
    return text
  }

  onMounted(() => {
    document.addEventListener('selectionchange', onSelectionChange)
    document.addEventListener('mouseup', onMouseUp)
  })

  onUnmounted(() => {
    document.removeEventListener('selectionchange', onSelectionChange)
    document.removeEventListener('mouseup', onMouseUp)
    clearPersistentHighlight()
  })

  return { 
    selectedText: toRef(store, 'selectedText'), 
    hasSelection: toRef(store, 'hasSelection'), 
    clearSelection: store.clearGlobalSelection, 
    captureAndReturn 
  }
}
