<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import BriefcaseView from '@/components/briefcase/BriefcaseView.vue'
import MemoAmbientSpotlight from '@/components/ambient/MemoAmbientSpotlight.vue'
import HubGrainLayer from '@/components/layout/HubGrainLayer.vue'
import {
  randomBlobTarget,
  springScalar,
  type BlobTarget,
} from '@/game/briefcaseAmbienceTargets'

defineOptions({ name: 'BriefcaseViewPage' })

const blobA = ref<BlobTarget>(randomBlobTarget(Math.random))
const blobB = ref<BlobTarget>(randomBlobTarget(Math.random))
const targetA = ref<BlobTarget>(randomBlobTarget(Math.random))
const targetB = ref<BlobTarget>(randomBlobTarget(Math.random))

const reducedMotion = ref(false)
let raf = 0
let lastTs = 0
let nextRerollAt = 0
let mq: MediaQueryList | null = null
let onMq: (() => void) | null = null

const TAU_MS = 2200
const REROLL_MS_MIN = 2800
const REROLL_MS_MAX = 6200

function lerpBlob(
  cur: BlobTarget,
  tgt: BlobTarget,
  dt: number,
): BlobTarget {
  return {
    x: springScalar(cur.x, tgt.x, dt, TAU_MS),
    y: springScalar(cur.y, tgt.y, dt, TAU_MS),
    scale: springScalar(cur.scale, tgt.scale, dt, TAU_MS),
    radiusPct: springScalar(cur.radiusPct, tgt.radiusPct, dt, TAU_MS),
  }
}

function tick(ts: number): void {
  raf = requestAnimationFrame(tick)
  const dt = lastTs > 0 ? Math.min(80, ts - lastTs) : 16
  lastTs = ts

  if (reducedMotion.value) {
    return
  }

  if (ts >= nextRerollAt) {
    targetA.value = randomBlobTarget(Math.random)
    targetB.value = randomBlobTarget(Math.random)
    nextRerollAt =
      ts + REROLL_MS_MIN + Math.random() * (REROLL_MS_MAX - REROLL_MS_MIN)
  }

  blobA.value = lerpBlob(blobA.value, targetA.value, dt)
  blobB.value = lerpBlob(blobB.value, targetB.value, dt)
}

onMounted(() => {
  if (typeof window === 'undefined') {
    return
  }
  mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = mq.matches
  onMq = () => {
    reducedMotion.value = mq?.matches ?? false
  }
  mq.addEventListener('change', onMq)

  nextRerollAt = performance.now() + 1500
  lastTs = 0
  raf = requestAnimationFrame(tick)
})

onUnmounted(() => {
  if (mq && onMq) {
    mq.removeEventListener('change', onMq)
  }
  cancelAnimationFrame(raf)
})

function blobStyle(b: BlobTarget, tint: 'gold' | 'violet'): Record<string, string> {
  const bg =
    tint === 'gold'
      ? 'rgba(228, 168, 52, 0.14)'
      : 'rgba(109, 40, 217, 0.12)'
  const w = 22 * b.scale
  const h = 20 * b.scale
  return {
    left: `${b.x * 100}%`,
    top: `${b.y * 100}%`,
    width: `${w}vmin`,
    height: `${h}vmin`,
    marginLeft: `-${w * 0.5}vmin`,
    marginTop: `-${h * 0.5}vmin`,
    borderRadius: `${b.radiusPct}% ${100 - b.radiusPct}% ${b.radiusPct * 0.7}% ${(100 - b.radiusPct) * 0.85}% / ${(100 - b.radiusPct) * 0.9}% ${b.radiusPct}% ${(100 - b.radiusPct) * 0.75}% ${b.radiusPct * 0.8}%`,
    background: bg,
    filter: 'blur(72px)',
    opacity: '1',
  }
}
</script>

<template>
  <div
    data-testid="briefcase-view"
    class="relative isolate flex min-h-screen min-w-[320px] flex-col px-4 py-8 text-memo-text"
  >
    <div
      data-testid="briefcase-backdrop"
      class="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      <HubGrainLayer />
      <div
        class="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <MemoAmbientSpotlight />
      </div>
      <div
        data-testid="briefcase-ambience-blobs"
        class="absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          class="absolute motion-reduce:hidden"
          :style="blobStyle(blobA, 'gold')"
        />
        <div
          class="absolute motion-reduce:hidden"
          :style="blobStyle(blobB, 'violet')"
        />
        <div
          class="absolute left-1/3 top-1/3 hidden h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-memo-accent/10 blur-[100px] motion-reduce:block"
        />
        <div
          class="absolute bottom-1/4 right-1/4 hidden h-80 w-80 translate-x-1/4 translate-y-1/4 rounded-full bg-purple-900/10 blur-[100px] motion-reduce:block"
        />
      </div>
    </div>
    <div class="relative z-10 mx-auto flex w-full max-w-[480px] flex-col">
      <BriefcaseView />
    </div>
  </div>
</template>
