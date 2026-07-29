<script setup lang="ts">
function decodeHtml(str: string): string {
  return (str ?? '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
}

interface Slide {
  id: number
  title: { rendered: string }
  status: string
  slide_data: { subtitle: string; button_text: string; button_link: string; image_url: string }
  featured_image_url: string | null
}

const props = defineProps<{ slides: Slide[] }>()

const current  = ref(0)
const animDir  = ref<'left' | 'right'>('right')
let   timer: ReturnType<typeof setInterval> | null = null

function go(index: number, dir: 'left' | 'right' = 'right') {
  animDir.value = dir
  current.value = (index + props.slides.length) % props.slides.length
}

function next() { go(current.value + 1, 'right') }
function prev() { go(current.value - 1, 'left')  }

function startTimer() { timer = setInterval(next, 5000) }
function stopTimer()  { if (timer) clearInterval(timer) }

onMounted(startTimer)
onUnmounted(stopTimer)

const slide = computed(() => props.slides[current.value])
const bg    = computed(() => slide.value?.featured_image_url || slide.value?.slide_data?.image_url || '')
</script>

<template>
  <div
    v-if="slides.length"
    class="relative overflow-hidden bg-pit-dark"
    style="height: clamp(300px, 38vw, 480px)"
    @mouseenter="stopTimer"
    @mouseleave="startTimer"
  >
    <!-- Slides -->
    <TransitionGroup name="slider" tag="div" class="relative w-full h-full">
      <div
        v-for="(s, i) in slides"
        v-show="i === current"
        :key="s.id"
        class="absolute inset-0"
      >
        <!-- Background -->
        <div
          v-if="s.featured_image_url || s.slide_data?.image_url"
          class="absolute inset-0 bg-cover bg-center"
          :style="{ backgroundImage: `url(${s.featured_image_url || s.slide_data?.image_url})` }"
        />
        <div v-else class="absolute inset-0 bg-gradient-to-br from-pit-dark via-[#0d1117] to-[#1a2035]" />

        <!-- Overlay -->
        <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <!-- Content -->
        <div class="relative h-full flex items-center">
          <div class="max-w-6xl mx-auto px-6 sm:px-12 w-full">
            <div class="max-w-xl">
              <h2 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4 drop-shadow-lg">
                {{ decodeHtml(s.title.rendered) }}
              </h2>
              <p v-if="s.slide_data?.subtitle" class="text-base sm:text-lg text-white/70 mb-8 leading-relaxed">
                {{ s.slide_data.subtitle }}
              </p>
              <a
                v-if="s.slide_data?.button_text && s.slide_data?.button_link"
                :href="s.slide_data.button_link"
                class="pit-btn-primary"
              >
                {{ s.slide_data.button_text }}
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </TransitionGroup>

    <!-- Pfeile -->
    <button
      v-if="slides.length > 1"
      @click="prev"
      class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 flex items-center justify-center text-white transition-all backdrop-blur-sm z-10"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
      </svg>
    </button>
    <button
      v-if="slides.length > 1"
      @click="next"
      class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 flex items-center justify-center text-white transition-all backdrop-blur-sm z-10"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
      </svg>
    </button>

    <!-- Dots -->
    <div v-if="slides.length > 1" class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
      <button
        v-for="(s, i) in slides"
        :key="s.id"
        @click="go(i)"
        class="rounded-full transition-all duration-300"
        :class="i === current
          ? 'w-6 h-2 bg-white'
          : 'w-2 h-2 bg-white/30 hover:bg-white/60'"
      />
    </div>

    <!-- Slide counter -->
    <div class="absolute bottom-6 right-6 text-xs text-white/40 z-10 tabular-nums">
      {{ current + 1 }} / {{ slides.length }}
    </div>
  </div>
</template>

<style scoped>
.slider-enter-active,
.slider-leave-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
  position: absolute;
  inset: 0;
}
.slider-enter-from { opacity: 0; transform: translateX(40px); }
.slider-leave-to   { opacity: 0; transform: translateX(-40px); }
</style>
