<script setup>
import { ref } from 'vue'
import Selectix from './components/Selectix.vue'

const countrySingle = ref('')
const countryMultiple = ref([])
const bearSingle = ref('Sloth Bear')
const bearMultiple = ref(['Sloth Bear', 'Polar Bear'])
const bearDeselect = ref('Sloth Bear')
const bearNoSearch = ref('Polar Bear')
const bearNoResults = ref('')
const bearWidth = ref('American Black Bear')
const bearWidthMulti = ref(['Giant Panda'])
const teamSingle = ref('')
const teamMultiple = ref([])

const countries = [
  'United States', 'United Kingdom', 'Afghanistan', 'Albania', 'Algeria', 'Australia', 'Austria',
  'Belgium', 'Brazil', 'Canada', 'China', 'Czech Republic', 'Denmark', 'Finland', 'France',
  'Germany', 'Greece', 'India', 'Italy', 'Japan', 'Mexico', 'Netherlands', 'Norway', 'Poland',
  'Portugal', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom', 'Viet Nam', 'Zimbabwe',
].map(c => ({ value: c, label: c }))

const bears = [
  { value: 'American Black Bear', label: 'American Black Bear' },
  { value: 'Asiatic Black Bear', label: 'Asiatic Black Bear' },
  { value: 'Brown Bear', label: 'Brown Bear' },
  { value: 'Giant Panda', label: 'Giant Panda' },
  { value: 'Sloth Bear', label: 'Sloth Bear' },
  { value: 'Sun Bear', label: 'Sun Bear', disabled: true },
  { value: 'Polar Bear', label: 'Polar Bear' },
  { value: 'Spectacled Bear', label: 'Spectacled Bear', disabled: true },
]

const footballTeams = [
  { label: 'NFC EAST', options: [
    { value: 'Dallas Cowboys', label: 'Dallas Cowboys' },
    { value: 'New York Giants', label: 'New York Giants' },
    { value: 'Philadelphia Eagles', label: 'Philadelphia Eagles' },
    { value: 'Washington Redskins', label: 'Washington Redskins' },
  ]},
  { label: 'NFC NORTH', options: [
    { value: 'Chicago Bears', label: 'Chicago Bears' },
    { value: 'Detroit Lions', label: 'Detroit Lions' },
    { value: 'Green Bay Packers', label: 'Green Bay Packers' },
    { value: 'Minnesota Vikings', label: 'Minnesota Vikings' },
  ]},
  { label: 'AFC EAST', options: [
    { value: 'Buffalo Bills', label: 'Buffalo Bills' },
    { value: 'Miami Dolphins', label: 'Miami Dolphins' },
    { value: 'New England Patriots', label: 'New England Patriots' },
    { value: 'New York Jets', label: 'New York Jets' },
  ]},
  { label: 'AFC NORTH', options: [
    { value: 'Baltimore Ravens', label: 'Baltimore Ravens' },
    { value: 'Cincinnati Bengals', label: 'Cincinnati Bengals' },
    { value: 'Cleveland Browns', label: 'Cleveland Browns' },
    { value: 'Pittsburgh Steelers', label: 'Pittsburgh Steelers' },
  ]},
]
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-800">
    <div class="max-w-4xl mx-auto px-6 py-10">
      <header class="mb-10">
        <h1 class="text-3xl font-bold text-gray-900">Selectix <span class="text-gray-500 font-normal text-xl">(Vue.js & Tailwind)</span></h1>
        <p class="mt-2 text-gray-600">A Vue 3 component that makes long, unwieldy select boxes more user-friendly.</p>
      </header>

      <section class="space-y-8">
        <div>
          <h2 class="text-xl font-semibold mb-4">Standard single select</h2>
          <div class="flex gap-8 flex-wrap">
            <div class="w-72">
              <label class="block text-sm font-medium text-gray-600 mb-1">Choose a country</label>
              <Selectix
                v-model="countrySingle"
                :options="countries"
                placeholder="Choose a Country..."
              />
            </div>
          </div>
        </div>

        <div>
          <h2 class="text-xl font-semibold mb-4">Multiple select</h2>
          <div class="w-72">
            <label class="block text-sm font-medium text-gray-600 mb-1">Choose countries</label>
            <Selectix
              v-model="countryMultiple"
              :options="countries"
              placeholder="Choose a Country..."
              multiple
            />
          </div>
        </div>

        <div>
          <h2 class="text-xl font-semibold mb-4">Optgroup support</h2>
          <div class="flex gap-8 flex-wrap">
            <div class="w-72">
              <label class="block text-sm font-medium text-gray-600 mb-1">Single with groups</label>
              <Selectix
                v-model="teamSingle"
                :options="footballTeams"
                placeholder="Your Favorite Football Team"
              />
            </div>
            <div class="w-72">
              <label class="block text-sm font-medium text-gray-600 mb-1">Multiple with groups</label>
              <Selectix
                v-model="teamMultiple"
                :options="footballTeams"
                placeholder="Your Favorite Football Team"
                multiple
              />
            </div>
          </div>
        </div>

        <div>
          <h2 class="text-xl font-semibold mb-4">Selected & disabled options</h2>
          <div class="flex gap-8 flex-wrap">
            <div class="w-72">
              <label class="block text-sm font-medium text-gray-600 mb-1">Single</label>
              <Selectix
                v-model="bearSingle"
                :options="bears"
                placeholder="Your Favorite Type of Bear"
              />
            </div>
            <div class="w-72">
              <label class="block text-sm font-medium text-gray-600 mb-1">Multiple</label>
              <Selectix
                v-model="bearMultiple"
                :options="bears"
                placeholder="Your Favorite Types of Bear"
                multiple
              />
            </div>
          </div>
        </div>

        <div>
          <h2 class="text-xl font-semibold mb-4">Hide search (disable_search_threshold: 10)</h2>
          <div class="w-72">
            <Selectix
              v-model="bearNoSearch"
              :options="bears"
              placeholder="Your Favorite Type of Bear"
              :disable-search-threshold="10"
            />
          </div>
        </div>

        <div>
          <h2 class="text-xl font-semibold mb-4">Custom "No results" text</h2>
          <div class="w-72">
            <Selectix
              v-model="bearNoResults"
              :options="bears"
              placeholder="Type 'C' to view"
              no-results-text="Oops, nothing found!"
            />
          </div>
        </div>

        <div>
          <h2 class="text-xl font-semibold mb-4">Allow deselect (single)</h2>
          <div class="w-72">
            <Selectix
              v-model="bearDeselect"
              :options="bears"
              placeholder="Your Favorite Type of Bear"
              allow-deselect
            />
          </div>
        </div>

        <div>
          <h2 class="text-xl font-semibold mb-4">Custom width (95%)</h2>
          <div class="flex gap-8 flex-wrap">
            <div class="flex-1 min-w-0 max-w-md">
              <label class="block text-sm font-medium text-gray-600 mb-1">Single</label>
              <Selectix
                v-model="bearWidth"
                :options="bears"
                placeholder="Your Favorite Types of Bear"
                width="95%"
              />
            </div>
            <div class="flex-1 min-w-0 max-w-md">
              <label class="block text-sm font-medium text-gray-600 mb-1">Multiple</label>
              <Selectix
                v-model="bearWidthMulti"
                :options="bears"
                placeholder="Your Favorite Types of Bear"
                multiple
                width="95%"
              />
            </div>
          </div>
        </div>
      </section>

      <footer class="mt-16 pt-8 border-t border-gray-200 text-gray-500 text-sm">
        Selectix – searchable select component with Vue 3 and Tailwind CSS.
      </footer>
    </div>
  </div>
</template>
