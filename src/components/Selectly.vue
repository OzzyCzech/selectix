<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

function findNextSelectableIndex(options, currentIndex, direction) {
  const step = direction === 'down' ? 1 : -1
  let i = currentIndex + step
  while (i >= 0 && i < options.length) {
    if (!options[i].disabled) return i
    i += step
  }
  return currentIndex
}

const props = defineProps({
  modelValue: { type: [String, Number, Array], default: null },
  options: { type: Array, required: true },
  placeholder: { type: String, default: 'Select an Option' },
  placeholderMultiple: { type: String, default: 'Select Some Options' },
  multiple: { type: Boolean, default: false },
  searchable: { type: Boolean, default: true },
  disableSearchThreshold: { type: Number, default: 0 },
  noResultsText: { type: String, default: 'No results match' },
  allowDeselect: { type: Boolean, default: false },
  maxSelectedOptions: { type: Number, default: Infinity },
  width: { type: String, default: '' },
  rtl: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const searchQuery = ref('')
const focusedIndex = ref(-1)
const containerRef = ref(null)
const searchInputRef = ref(null)

const normalizedOptions = computed(() => {
  const flatten = (items, groupLabel = null) => {
    const result = []
    for (const item of items) {
      if (item.options) {
        result.push(...flatten(item.options, item.label))
      } else {
        result.push({
          value: item.value ?? item.label,
          label: item.label ?? item.value,
          disabled: !!item.disabled,
          groupLabel,
        })
      }
    }
    return result
  }
  return flatten(props.options)
})

const groupedOptions = computed(() => {
  const result = []
  for (const item of props.options) {
    if (item.options) {
      result.push({ type: 'group', label: item.label, options: item.options })
    } else {
      if (result.length && result[result.length - 1].type === 'flat') {
        result[result.length - 1].options.push(item)
      } else {
        result.push({ type: 'flat', options: [item] })
      }
    }
  }
  return result
})

const selectedValues = computed({
  get: () => {
    const v = props.modelValue
    return props.multiple ? (Array.isArray(v) ? v : v != null ? [v] : []) : v
  },
  set: (val) => {
    emit('update:modelValue', val)
    emit('change', val)
  },
})

const showSearch = computed(() => {
  if (!props.searchable) return false
  if (props.disableSearchThreshold > 0 && !props.multiple) {
    return normalizedOptions.value.length > props.disableSearchThreshold
  }
  return true
})

const filteredOptions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return normalizedOptions.value
  return normalizedOptions.value.filter((opt) =>
    opt.label.toLowerCase().includes(q)
  )
})

const filteredGrouped = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const match = (opt) => !q || String(opt.label ?? opt.value ?? '').toLowerCase().includes(q)
  return groupedOptions.value
    .map((grp) => {
      if (grp.type === 'group') {
        const opts = grp.options.filter((o) => match(o))
        if (opts.length === 0) return null
        return { ...grp, options: opts }
      }
      const opts = grp.options.filter((o) => match(o))
      if (opts.length === 0) return null
      return { ...grp, options: opts }
    })
    .filter(Boolean)
})

const displayLabel = computed(() => {
  if (props.multiple) {
    const vals = selectedValues.value
    if (!vals.length) return props.placeholderMultiple
    return vals.length === 1
      ? (normalizedOptions.value.find((o) => o.value === vals[0])?.label ?? vals[0])
      : `${vals.length} selected`
  }
  const v = selectedValues.value
  if (v == null || v === '') return props.placeholder
  return normalizedOptions.value.find((o) => o.value === v)?.label ?? v
})

const canSelectMore = computed(() => {
  if (!props.multiple) return true
  return selectedValues.value.length < props.maxSelectedOptions
})

const noResults = computed(() => {
  const q = searchQuery.value.trim()
  return q && filteredOptions.value.length === 0
})

const containerStyle = computed(() => {
  if (!props.width) return {}
  return { width: props.width }
})

function isSelected(opt) {
  const v = opt.value
  if (props.multiple) return selectedValues.value.includes(v)
  return selectedValues.value === v
}

function select(opt) {
  if (opt.disabled) return
  if (props.multiple) {
    const current = [...selectedValues.value]
    const idx = current.indexOf(opt.value)
    if (idx >= 0) {
      current.splice(idx, 1)
    } else {
      if (!canSelectMore.value) return
      current.push(opt.value)
    }
    selectedValues.value = current
  } else {
    selectedValues.value = opt.value
    isOpen.value = false
  }
}

function clearSingle(e) {
  e.stopPropagation()
  selectedValues.value = null
}

function toggleOpen() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
    const opts = filteredOptions.value
    focusedIndex.value = opts.length ? findNextSelectableIndex(opts, -1, 'down') : -1
  }
}

watch(isOpen, (open) => {
  if (open && showSearch.value) {
    nextTick(() => searchInputRef.value?.focus())
  }
})

watch(filteredOptions, (opts) => {
  if (!isOpen.value || !opts.length) return
  if (focusedIndex.value < 0 || focusedIndex.value >= opts.length || opts[focusedIndex.value]?.disabled) {
    focusedIndex.value = findNextSelectableIndex(opts, -1, 'down')
  }
}, { flush: 'sync' })

watch(focusedIndex, (idx) => {
  if (idx < 0 || !containerRef.value) return
  nextTick(() => {
    const el = containerRef.value?.querySelector(`[data-option-index="${idx}"]`)
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  })
})

function handleDropdownKeydown(e) {
  if (e.key === 'Escape') {
    e.preventDefault()
    isOpen.value = false
    searchInputRef.value?.blur()
    return
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    const opts = filteredOptions.value
    if (!opts.length) return
    focusedIndex.value = findNextSelectableIndex(opts, focusedIndex.value, 'down')
    return
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    const opts = filteredOptions.value
    if (!opts.length) return
    focusedIndex.value = findNextSelectableIndex(opts, focusedIndex.value, 'up')
    return
  }
  if (e.key === 'Enter') {
    e.preventDefault()
    const opts = filteredOptions.value
    const idx = focusedIndex.value >= 0 ? focusedIndex.value : 0
    const opt = opts[idx]
    if (opt && !opt.disabled) select(opt)
    return
  }
}

function handleKeydown(e) {
  if (!isOpen.value) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault()
      isOpen.value = true
    }
    return
  }
  handleDropdownKeydown(e)
}

function handleSearchKeydown(e) {
  if (['Escape', 'Enter', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
    handleDropdownKeydown(e)
  }
}

function onClickOutside(e) {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<template>
  <div
    ref="containerRef"
    class="selectly-container inline-block align-middle"
    :style="containerStyle"
    :class="{ 'selectly-rtl': rtl }"
  >
    <div
      class="selectly-trigger relative border border-gray-300 bg-white min-h-[30px] pl-2 pr-6 py-1 cursor-pointer rounded shadow-sm flex items-center justify-between"
      :class="{ 'selectly-open': isOpen }"
      tabindex="0"
      role="combobox"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      @click="toggleOpen"
      @keydown="handleKeydown"
    >
      <span class="selectly-label truncate flex-1">
        <span v-if="multiple && selectedValues.length" class="flex flex-wrap gap-1">
          <span
            v-for="val in selectedValues"
            :key="val"
            class="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-200 text-gray-800 text-sm"
          >
            {{ normalizedOptions.find(o => o.value === val)?.label ?? val }}
          </span>
        </span>
        <span v-else class="text-gray-500">{{ displayLabel }}</span>
      </span>
      <span class="selectly-actions flex items-center gap-0.5 absolute right-2 top-1/2 -translate-y-1/2">
        <button
          v-if="!multiple && allowDeselect && selectedValues != null && selectedValues !== ''"
          type="button"
          class="selectly-deselect w-4 h-4 flex items-center justify-center rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700"
          aria-label="Deselect"
          @click="clearSingle"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
        <span class="selectly-arrow w-4 h-4 flex items-center justify-center text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform" :class="{ 'rotate-180': isOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </span>
    </div>

    <div
      v-show="isOpen"
      class="selectly-drop absolute left-0 right-0 top-full mt-0.5 border border-gray-300 bg-white rounded shadow-lg z-50 max-h-60 flex flex-col"
    >
      <div v-if="showSearch" class="p-1 border-b border-gray-200">
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          class="selectly-search-input w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search..."
          autocomplete="off"
          @click.stop
          @keydown="handleSearchKeydown"
        >
      </div>
      <div class="selectly-results overflow-auto flex-1 py-1">
        <template v-if="noResults">
          <div class="px-3 py-2 text-gray-500 text-sm">
            {{ noResultsText }} "{{ searchQuery }}"
          </div>
        </template>
        <template v-else>
          <template v-for="(group, gi) in filteredGrouped" :key="gi">
            <div v-if="group.type === 'group'" class="selectly-group">
              <div class="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                {{ group.label }}
              </div>
              <button
                v-for="(opt, oi) in group.options"
                :key="opt.value ?? opt.label"
                type="button"
                :data-option-index="filteredOptions.findIndex(o => o.value === (opt.value ?? opt.label))"
                class="selectly-option w-full text-left px-3 py-1.5 text-sm flex items-center gap-2"
                :class="{
                  'bg-blue-50 text-blue-800': isSelected({ value: opt.value ?? opt.label, label: opt.label ?? opt.value, disabled: opt.disabled }),
                  'text-gray-400 cursor-not-allowed': opt.disabled,
                  'hover:bg-gray-100': !opt.disabled,
                  'bg-blue-100': focusedIndex === filteredOptions.findIndex(o => (o.value === (opt.value ?? opt.label))) && !opt.disabled,
                }"
                :disabled="opt.disabled"
                @click.stop="select({ value: opt.value ?? opt.label, label: opt.label ?? opt.value, disabled: !!opt.disabled })"
              >
                <span v-if="multiple" class="w-4 h-4 flex-shrink-0 border rounded flex items-center justify-center" :class="isSelected({ value: opt.value ?? opt.label }) ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'">
                  <svg v-if="isSelected({ value: opt.value ?? opt.label })" class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                </span>
                {{ opt.label ?? opt.value }}
              </button>
            </div>
            <template v-else>
              <button
                v-for="(opt, oi) in group.options"
                :key="opt.value ?? opt.label"
                type="button"
                :data-option-index="filteredOptions.findIndex(o => o.value === (opt.value ?? opt.label))"
                class="selectly-option w-full text-left px-3 py-1.5 text-sm flex items-center gap-2"
                :class="{
                  'bg-blue-50 text-blue-800': isSelected({ value: opt.value ?? opt.label, label: opt.label ?? opt.value, disabled: opt.disabled }),
                  'text-gray-400 cursor-not-allowed': opt.disabled,
                  'hover:bg-gray-100': !opt.disabled,
                  'bg-blue-100': focusedIndex === filteredOptions.findIndex(o => o.value === (opt.value ?? opt.label)) && !opt.disabled,
                }"
                :disabled="opt.disabled"
                @click.stop="select({ value: opt.value ?? opt.label, label: opt.label ?? opt.value, disabled: !!opt.disabled })"
              >
                <span v-if="multiple" class="w-4 h-4 flex-shrink-0 border rounded flex items-center justify-center" :class="isSelected({ value: opt.value ?? opt.label }) ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'">
                  <svg v-if="isSelected({ value: opt.value ?? opt.label })" class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                </span>
                {{ opt.label ?? opt.value }}
              </button>
            </template>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.selectly-container {
  position: relative;
}
.selectly-drop {
  min-width: 100%;
}
.selectly-rtl .selectly-drop {
  right: 0;
  left: auto;
}
</style>
