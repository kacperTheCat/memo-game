<script setup lang="ts">
import { computed } from 'vue'
import { useAmbientChaseLight } from '@/composables/game/useAmbientChaseLight'

defineOptions({ name: 'MemoAmbientSpotlight' })

const {
  smoothed,
  reducedMotion,
  layerOpacity,
  spotlightActive,
  windDeg,
  windStretch,
} = useAmbientChaseLight()

const vpAttrs = computed(() => {
  const w =
    typeof window !== 'undefined' ? Math.max(1, window.innerWidth) : 1
  const h =
    typeof window !== 'undefined' ? Math.max(1, window.innerHeight) : 1
  const { x, y } = smoothed.value
  const xp = Math.round(Math.min(100, Math.max(0, (x / w) * 100)))
  const yp = Math.round(Math.min(100, Math.max(0, (y / h) * 100)))
  return { xp, yp }
})

/** Transform + paint: wind elongates along velocity (FR-001c). */
const blobShellStyle = computed(() => {
  const { xp, yp } = vpAttrs.value
  const rm = reducedMotion.value
  const stretch = rm ? 0 : windStretch.value
  const rot = rm ? 0 : windDeg.value
  const sx = 1 + 0.42 * stretch
  const sy = 1 - 0.26 * stretch
  return {
    position: 'absolute' as const,
    left: `${xp}%`,
    top: `${yp}%`,
    width: '1px',
    height: '1px',
    transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${sx}, ${sy})`,
  }
})

const blobPaintStyle = computed(() => {
  const rm = reducedMotion.value
  const inner = rm ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.16)'
  return {
    position: 'absolute' as const,
    left: '-44vmin',
    top: '-44vmin',
    width: '88vmin',
    height: '88vmin',
    background: `radial-gradient(ellipse 50% 48% at 50% 50%, ${inner} 0%, rgba(255,255,255,0.05) 38%, transparent 68%)`,
  }
})

const rootStyle = computed(() => ({
  opacity: layerOpacity.value,
}))
</script>

<template>
  <div
    data-testid="ambient-spotlight"
    :data-ambient-spotlight-active="spotlightActive ? 'true' : 'false'"
    :data-memo-spotlight-vp-x="String(vpAttrs.xp)"
    :data-memo-spotlight-vp-y="String(vpAttrs.yp)"
    class="pointer-events-none fixed inset-0 z-[1] overflow-hidden transition-none"
    aria-hidden="true"
    :style="rootStyle"
  >
    <div :style="blobShellStyle">
      <div :style="blobPaintStyle" />
    </div>
  </div>
</template>
