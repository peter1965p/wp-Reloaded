<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Placeholder.configure({ placeholder: 'Inhalt schreiben…' }),
    Link.configure({ openOnClick: false }),
  ],
  editorProps: {
    attributes: { class: 'outline-none min-h-[300px] text-slate-300 prose prose-invert prose-sm max-w-none' },
  },
  onUpdate: ({ editor }) => emit('update:modelValue', editor.getHTML()),
})

watch(() => props.modelValue, (val) => {
  if (editor.value && editor.value.getHTML() !== val) {
    editor.value.commands.setContent(val, false)
  }
})

onBeforeUnmount(() => editor.value?.destroy())

type Level = 1 | 2 | 3

const tools = [
  { label: 'B',  title: 'Fett',       action: () => editor.value?.chain().focus().toggleBold().run(),            active: () => editor.value?.isActive('bold') },
  { label: 'I',  title: 'Kursiv',     action: () => editor.value?.chain().focus().toggleItalic().run(),          active: () => editor.value?.isActive('italic') },
  { label: 'H1', title: 'Überschrift 1', action: () => editor.value?.chain().focus().toggleHeading({ level: 1 as Level }).run(), active: () => editor.value?.isActive('heading', { level: 1 }) },
  { label: 'H2', title: 'Überschrift 2', action: () => editor.value?.chain().focus().toggleHeading({ level: 2 as Level }).run(), active: () => editor.value?.isActive('heading', { level: 2 }) },
  { label: '—',  title: 'Trennlinie', action: () => editor.value?.chain().focus().setHorizontalRule().run(),     active: () => false },
  { label: '❝',  title: 'Zitat',      action: () => editor.value?.chain().focus().toggleBlockquote().run(),      active: () => editor.value?.isActive('blockquote') },
  { label: '⌫',  title: 'Rückgängig', action: () => editor.value?.chain().focus().undo().run(),                  active: () => false },
  { label: '↻',  title: 'Wiederholen',action: () => editor.value?.chain().focus().redo().run(),                  active: () => false },
]
</script>

<template>
  <div class="bg-[#0d1117] border border-white/10 rounded-[6px] overflow-hidden">
    <!-- Toolbar -->
    <div class="flex items-center gap-1 px-3 py-2 border-b border-white/10 flex-wrap">
      <button
        v-for="tool in tools"
        :key="tool.label"
        :title="tool.title"
        type="button"
        @click="tool.action()"
        class="px-2.5 py-1 text-xs font-mono rounded transition-colors"
        :class="tool.active()
          ? 'bg-blue-500/20 text-blue-400'
          : 'text-slate-400 hover:text-white hover:bg-white/5'"
      >
        {{ tool.label }}
      </button>
    </div>
    <!-- Editor -->
    <div class="px-5 py-4">
      <EditorContent :editor="editor" />
    </div>
  </div>
</template>

<style>
.tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: #475569;
  float: left;
  pointer-events: none;
  height: 0;
}
</style>
