# Selectly

Searchable select component for **Vue 3** with **Tailwind CSS**.

## Features

- Single and multiple select
- Search / filter with autofocus
- Keyboard navigation (↑↓ arrows, Enter to select, Escape to close)
- Optgroups
- Disabled options
- Placeholder text
- Optional deselect (single select)
- Max selected options (multiple)
- Custom width, RTL support

## Install

```bash
npm install selectly
```

**Peer dependencies:** Vue 3 and Tailwind CSS 4 (or 3). Your project must use Tailwind so the component's styles are applied.

## Usage

### 1. Import the CSS

In your app entry (e.g. `main.js` or `App.vue`):

```js
import 'selectly/style.css'
```

### 2. Use the component

**Option A – Single component**

```vue
<script setup>
import { Selectly } from 'selectly'
import 'selectly/style.css'

const selected = ref('')
const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
]
</script>

<template>
  <Selectly
    v-model="selected"
    :options="options"
    placeholder="Choose..."
  />
</template>
```

**Option B – Global registration**

```js
import { createApp } from 'vue'
import { Selectly, install } from 'selectly'
import 'selectly/style.css'
import App from './App.vue'

const app = createApp(App)
app.use(install) // registers <Selectly> globally
app.mount('#app')
```

Then use `<Selectly>` in any template.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `String \| Number \| Array` | `null` | Selected value(s) |
| `options` | `Array` | required | `[{ value, label, disabled? }]` or `[{ label, options: [...] }]` for groups |
| `placeholder` | `String` | `"Select an Option"` | Single select placeholder |
| `placeholderMultiple` | `String` | `"Select Some Options"` | Multiple select placeholder |
| `multiple` | `Boolean` | `false` | Allow multiple selection |
| `searchable` | `Boolean` | `true` | Show search input |
| `disableSearchThreshold` | `Number` | `0` | Hide search when option count ≤ this (single only) |
| `noResultsText` | `String` | `"No results match"` | Text when search has no results |
| `allowDeselect` | `Boolean` | `false` | Show deselect control (single) |
| `maxSelectedOptions` | `Number` | `Infinity` | Max selections (multiple) |
| `width` | `String` | `""` | e.g. `"95%"` |
| `rtl` | `Boolean` | `false` | Right-to-left |

### Events

- `update:modelValue` – when selection changes (for `v-model`)
- `change` – when selection changes

## Tailwind

The component uses Tailwind utility classes. With **Tailwind 4** and the Vite plugin, your app will pick them up from `node_modules/selectly` if needed. With **Tailwind 3**, add the package to `content` in `tailwind.config.js`:

```js
content: [
  './index.html',
  './src/**/*.{vue,js,ts,jsx,tsx}',
  './node_modules/selectly/**/*.{vue,js}',
],
```

## Development

```bash
npm install
npm run dev        # demo app at http://localhost:5173
npm run build      # build library to dist/
npm run build:demo # build demo app to dist-demo/
npm run preview    # serve built demo (run build:demo first)
```

## License

MIT. See [LICENSE.md](LICENSE.md).
