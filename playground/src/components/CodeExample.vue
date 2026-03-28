<script setup lang="ts">
import { ref, computed } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const props = defineProps<{ code: string; title?: string }>()
const open = ref(false)

// Token types and their colors
const COLORS = {
  comment:  '#64748b',
  string:   '#86efac',
  keyword:  '#c084fc',
  builtin:  '#60a5fa',
  number:   '#fb923c',
  call:     '#fde68a',
  type:     '#67e8f9',
  operator: '#94a3b8',
  plain:    '#e2e8f0',
}

const KEYWORDS = new Set([
  'import','export','from','as','const','let','var','await','async',
  'return','new','function','class','extends','implements','interface',
  'type','enum','namespace','declare','abstract','static','readonly',
  'of','in','for','while','if','else','try','catch','finally','throw',
  'typeof','instanceof','void','keyof','satisfies',
])

const BUILTINS = new Set([
  'true','false','null','undefined','string','number','boolean',
  'bigint','symbol','object','never','any','unknown','console','Math',
  'Array','Object','Promise','Map','Set','BigInt',
])

// Tokenize a line into [{text, color}] spans
function tokenizeLine(line: string): Array<{ text: string; color: string }> {
  const spans: Array<{ text: string; color: string }> = []
  let i = 0

  function push(text: string, color: string) {
    if (!text) return
    const last = spans[spans.length - 1]
    if (last && last.color === color) last.text += text
    else spans.push({ text, color })
  }

  while (i < line.length) {
    // Line comment
    if (line[i] === '/' && line[i + 1] === '/') {
      push(line.slice(i), COLORS.comment)
      break
    }

    // String (single or double quote)
    if (line[i] === "'" || line[i] === '"') {
      const q = line[i]
      let j = i + 1
      while (j < line.length && line[j] !== q) {
        if (line[j] === '\\') j++
        j++
      }
      push(line.slice(i, j + 1), COLORS.string)
      i = j + 1
      continue
    }

    // Template literal (backtick)
    if (line[i] === '`') {
      let j = i + 1
      while (j < line.length && line[j] !== '`') {
        if (line[j] === '\\') j++
        j++
      }
      push(line.slice(i, j + 1), COLORS.string)
      i = j + 1
      continue
    }

    // Identifier or keyword
    if (/[a-zA-Z_$]/.test(line[i])) {
      let j = i + 1
      while (j < line.length && /[\w$]/.test(line[j])) j++
      const word = line.slice(i, j)

      const isCall = line[j] === '('
      const isType = /^[A-Z][a-zA-Z0-9]*$/.test(word)

      let color: string
      if (KEYWORDS.has(word))       color = COLORS.keyword
      else if (BUILTINS.has(word))  color = COLORS.builtin
      else if (isCall)              color = COLORS.call
      else if (isType)              color = COLORS.type
      else                          color = COLORS.plain

      push(word, color)
      i = j
      continue
    }

    // Number
    if (/\d/.test(line[i]) || (line[i] === '.' && /\d/.test(line[i + 1] ?? ''))) {
      let j = i
      while (j < line.length && /[\d._n]/.test(line[j])) j++
      push(line.slice(i, j), COLORS.number)
      i = j
      continue
    }

    // Operator / punctuation
    if (/[=<>!&|+\-*/%^~?:.,;[\]{}()]/.test(line[i])) {
      push(line[i], COLORS.operator)
      i++
      continue
    }

    push(line[i], COLORS.plain)
    i++
  }

  return spans
}

const highlighted = computed(() =>
  props.code.split('\n').map(tokenizeLine)
)
</script>

<template>
  <Card class="mt-4">
    <CardContent class="p-0">
      <Button
        variant="ghost"
        class="w-full justify-between rounded-b-none px-4 py-3 font-sans text-sm"
        @click="open = !open"
      >
        <span>{{ title ?? 'Code Example' }}</span>
        <span class="text-xs text-muted-foreground">{{ open ? '▲ hide' : '▼ show' }}</span>
      </Button>
      <div v-if="open" class="border-t border-border">
        <pre class="overflow-x-auto rounded-b-lg bg-[#0a0f1a] p-4 text-[13px] leading-relaxed font-mono m-0"><code><template v-for="(line, li) in highlighted" :key="li"><template v-for="(span, si) in line" :key="si"><span :style="{ color: span.color }">{{ span.text }}</span></template>{{ li < highlighted.length - 1 ? '\n' : '' }}</template></code></pre>
      </div>
    </CardContent>
  </Card>
</template>
