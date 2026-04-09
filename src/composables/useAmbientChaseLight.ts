import { computed, onMounted, onUnmounted, ref, type Ref } from 'vue'
import {
  clampPointToRect,
  driftOffset2d,
  springToward2d,
  type Vec2,
} from '@/game/ambientPointerMath'

const CHASE_TAU_MS = 135
const DRIFT_AMPLITUDE_PX = 14
const DRIFT_SEED = 42

/** No pointer movement for this long → mouse spotlight fades (FR-001a). */
export const AMBIENT_MOUSE_IDLE_MS = 400
/** Fade spotlight in after movement resumes (gentle ramp). */
const FADE_IN_MS = 420
/** Fade out after mouse idle. */
const FADE_OUT_MOUSE_MS = 360
/** Fade out after last touch lifts (FR-001b). */
const FADE_OUT_TOUCH_MS = 220

const SPOTLIGHT_ACTIVE_EPS = 0.05

/** Wind stretch 0–1 from smoothed pointer speed (FR-001c). */
const WIND_SPEED_REF_PX_S = 1400
const WIND_VEL_SMOOTH_TAU_MS = 95

export interface UseAmbientChaseLightResult {
  smoothed: Ref<Vec2>
  reducedMotion: Ref<boolean>
  /** 0–1 envelope applied to the spotlight layer (before reduced-motion branch). */
  layerOpacity: Ref<number>
  /** `true` when the spotlight should read as visibly on (E2E contract). */
  spotlightActive: Ref<boolean>
  /** Degrees; long axis of wind ellipse aligns with motion (FR-001c). */
  windDeg: Ref<number>
  /** 0–1 strength of directional stretch (“wind”). */
  windStretch: Ref<number>
}

/**
 * Cloud-chasing spotlight: lagged pursuit + FR-001a mouse idle fade + FR-001b touch-only.
 */
export function useAmbientChaseLight(): UseAmbientChaseLightResult {
  const target = ref<Vec2 | null>(null)
  const smoothed = ref<Vec2>({ x: 0, y: 0 })
  const reducedMotion = ref(false)
  const envelope = ref(0)
  const windDeg = ref(0)
  const windStretch = ref(0)
  let prevSmoothedForWind = { x: Number.NaN, y: Number.NaN }
  const velWind = { x: 0, y: 0 }

  const spotlightActive = computed(
    () =>
      reducedMotion.value ||
      envelope.value > SPOTLIGHT_ACTIVE_EPS,
  )

  const activeTouchPointerIds = new Set<number>()
  let lastMouseMoveTs: number | null = null
  let prevTouchCount = 0
  /** When fading to 0, use shorter fade after touch release. */
  let fadeOutMs = FADE_OUT_MOUSE_MS

  let raf = 0
  let lastTs = 0
  let mq: MediaQueryList | null = null
  let onMqChange: (() => void) | null = null
  let removeWindowListeners: (() => void) | null = null

  function viewportSize(): { w: number; h: number } {
    if (typeof window === 'undefined') {
      return { w: 1, h: 1 }
    }
    return {
      w: Math.max(1, window.innerWidth),
      h: Math.max(1, window.innerHeight),
    }
  }

  function setTarget(clientX: number, clientY: number): void {
    target.value = { x: clientX, y: clientY }
  }

  function envelopeTarget(now: number): number {
    if (reducedMotion.value) {
      return 1
    }
    const touchActive = activeTouchPointerIds.size > 0
    const mouseRecent =
      lastMouseMoveTs !== null && now - lastMouseMoveTs < AMBIENT_MOUSE_IDLE_MS
    return touchActive || mouseRecent ? 1 : 0
  }

  function tick(ts: number): void {
    raf = requestAnimationFrame(tick)
    const dt = lastTs > 0 ? Math.min(64, ts - lastTs) : 16
    lastTs = ts
    const now = performance.now()

    const touchCount = activeTouchPointerIds.size
    const targetEnv = envelopeTarget(now)
    if (targetEnv < envelope.value && prevTouchCount > 0 && touchCount === 0) {
      fadeOutMs = FADE_OUT_TOUCH_MS
    } else if (targetEnv < envelope.value) {
      fadeOutMs = FADE_OUT_MOUSE_MS
    }
    prevTouchCount = touchCount

    const fadeMs =
      targetEnv > envelope.value ? FADE_IN_MS : fadeOutMs
    const alpha = Math.min(1, dt / fadeMs)
    envelope.value += (targetEnv - envelope.value) * alpha
    if (envelope.value < 1e-3) {
      envelope.value = 0
    }
    if (envelope.value > 1 - 1e-3) {
      envelope.value = 1
    }

    const { w, h } = viewportSize()
    const raw = target.value ?? { x: w * 0.5, y: h * 0.5 }
    const clamped = clampPointToRect(raw.x, raw.y, 0, 0, w, h)

    if (reducedMotion.value) {
      smoothed.value = { x: clamped.x, y: clamped.y }
      windStretch.value = 0
      windDeg.value = 0
      prevSmoothedForWind = { x: smoothed.value.x, y: smoothed.value.y }
      return
    }

    const drift = driftOffset2d(DRIFT_SEED, ts, DRIFT_AMPLITUDE_PX)
    const aim = { x: clamped.x + drift.x, y: clamped.y + drift.y }
    smoothed.value = springToward2d(smoothed.value, aim, dt, CHASE_TAU_MS)

    const dts = Math.max(1e-3, dt / 1000)
    if (!Number.isNaN(prevSmoothedForWind.x)) {
      const targetVx = (smoothed.value.x - prevSmoothedForWind.x) / dts
      const targetVy = (smoothed.value.y - prevSmoothedForWind.y) / dts
      const k = 1 - Math.exp(-dt / WIND_VEL_SMOOTH_TAU_MS)
      velWind.x += (targetVx - velWind.x) * k
      velWind.y += (targetVy - velWind.y) * k
      const speed = Math.hypot(velWind.x, velWind.y)
      windStretch.value = Math.min(1, speed / WIND_SPEED_REF_PX_S) * envelope.value
      windDeg.value =
        speed < 8 ? windDeg.value : (Math.atan2(velWind.y, velWind.x) * 180) / Math.PI
    }
    prevSmoothedForWind = { x: smoothed.value.x, y: smoothed.value.y }
  }

  const layerOpacity = computed(() => {
    if (reducedMotion.value) {
      return 0.38
    }
    return envelope.value
  })

  onMounted(() => {
    if (typeof window === 'undefined') {
      return
    }

    mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotion.value = mq.matches
    onMqChange = () => {
      reducedMotion.value = mq?.matches ?? false
    }
    mq.addEventListener('change', onMqChange)

    const { w, h } = viewportSize()
    smoothed.value = { x: w * 0.5, y: h * 0.5 }

    const onPointerMove = (ev: PointerEvent): void => {
      if (ev.pointerType === 'touch') {
        if (activeTouchPointerIds.has(ev.pointerId)) {
          setTarget(ev.clientX, ev.clientY)
        }
        return
      }
      // mouse, pen, or synthetic events with empty pointerType (e.g. test env)
      lastMouseMoveTs = performance.now()
      setTarget(ev.clientX, ev.clientY)
    }

    const onPointerDown = (ev: PointerEvent): void => {
      if (ev.pointerType === 'touch') {
        activeTouchPointerIds.add(ev.pointerId)
        setTarget(ev.clientX, ev.clientY)
      }
    }

    const onPointerUp = (ev: PointerEvent): void => {
      if (ev.pointerType === 'touch') {
        activeTouchPointerIds.delete(ev.pointerId)
      }
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('pointerup', onPointerUp, { passive: true })
    window.addEventListener('pointercancel', onPointerUp, { passive: true })

    removeWindowListeners = () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
    }

    lastTs = 0
    raf = requestAnimationFrame(tick)
  })

  onUnmounted(() => {
    removeWindowListeners?.()
    removeWindowListeners = null
    activeTouchPointerIds.clear()
    if (mq && onMqChange) {
      mq.removeEventListener('change', onMqChange)
    }
    mq = null
    onMqChange = null
    cancelAnimationFrame(raf)
  })

  return { smoothed, reducedMotion, layerOpacity, spotlightActive, windDeg, windStretch }
}
