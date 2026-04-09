# Data model: 010 Styles improvements

No **persistent** entities or **localStorage** changes. All state is **ephemeral UI presentation** scoped to component instances or composables.

## Runtime presentation state (conceptual)

| Concept | Owner | Fields / behavior | Persistence |
|--------|--------|-------------------|-------------|
| **Spotlight target** | Home / Briefcase page / Win debrief | Raw pointer `(clientX, clientY)` while input active; clamped to viewport | None |
| **Spotlight smoothed** | Same | Smoothed center `(sx, sy)` chasing target with lag + optional noise offset | None |
| **Spotlight visibility** | Same | **Opacity or envelope 0–1**: mouse full while moving, decays after idle; touch full only while `touches.length > 0` (or equivalent) | None |
| **Spotlight input mode** | Same | Derived: `mouse` path vs `touch` path (PointerEvent `pointerType` + touch list) | None |
| **Grain phase** | `HubGrainLayer` (or variant) | CSS animation time or `background-position` offset | None |
| **Briefcase ambience blobs** | `BriefcaseViewPage` backdrop | 1–3 blobs: position, scale, border-radius targets + smoothed values | None |
| **Card gradient focal point** | `GameCanvasShell` + draw | Normalized pointer vs each **revealed** face rect → lerped gradient params | None |
| **Operation Complete stagger** | `WinDebriefPanel` | Enter generation counter / per-char visible flags or CSS delay indices | None |

## Relationships

- **Spotlight** and **yellow ambience** share the **same backdrop stack** on Briefcase (both under `z-10` content).
- **Game gradient** depends on **global pointer** position and **per-cell** geometry from existing `cellRectsForGrid` / hit-test layout.

## Validation rules

- All coordinates clamped to view bounds; when spotlight is **off** (idle / no touch), smoothed position may still sit at last aim or center—**opacity**, not position, defines visibility (FR-001a/b).
- When `prefers-reduced-motion`, smoothed state may snap to target or bypass rAF-driven wander.

## State transitions

| Event | Transition |
|-------|------------|
| Mouse move | Update target; reset idle timer; ramp **visibility** toward **on** |
| Mouse idle (timer) | Ramp **visibility** toward **off** (fade) |
| Touch start / move | Update target from primary touch; **visibility on** |
| Touch end (no remaining touches) | Ramp **visibility** toward **off**; do **not** keep “last touch” glow |
| Route enter / debrief show | Reset Operation Complete stagger generation |
| `prefers-reduced-motion` change | Tear down or simplify animations (matchMedia listener) |
