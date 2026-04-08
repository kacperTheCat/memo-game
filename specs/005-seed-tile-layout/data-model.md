# Data model: deterministic game seed

**Spec**: [`spec.md`](./spec.md) | **Plan**: [`plan.md`](./plan.md) | **Branch**: `005-seed-tile-layout`  
**Extends**: `specs/004-game-core-logic/data-model.md` (runtime cells, snapshots unchanged)

## Stateless deal arguments

**Deal layout** for a **new** shuffled round is determined only by:

| Argument | Source | Rules |
|----------|--------|--------|
| **`difficulty`** | `GameSettings.difficulty` at navigation time | Existing **`easy` \| `medium` \| `hard`**. |
| **`seedNine`** | Parsed from Briefcase field, carried on navigation | **`null`** ⇒ non-deterministic deal (**`Math.random`**). **`string`** with **`/^\d{9}$/`** ⇒ deterministic deal for that difficulty. |

**Pure API** (see [`contracts/seed-deal.contract.md`](./contracts/seed-deal.contract.md)):

- **`parseNineDigitSeedOrNull(raw: string): string | null`** — strip non-digits; if exactly **9** digits remain, return them; else **`null`**.
- **`rngForDealInit(difficulty: Difficulty, seedNine: string | null): () => number`** — if **`seedNine`** valid, **`createSeededRngForDeal(seedNine, difficulty)`**; else **`Math.random`**.

No separate **pending-deal** entity: args are **passed into** these functions at the call site.

---

## Navigation: `history.state.memoDealInit`

When routing **Briefcase → `/game`**, the app sets **Vue Router / History** state (not `localStorage`):

| Field | Type | Meaning |
|-------|------|--------|
| **`memoDealInit.seedNine`** | `string \| null` | Result of **`parseNineDigitSeedOrNull(briefcaseSeedRaw)`** at click time. |

**Rules**:

- **`GameCanvasShell`** (or a tiny composable it uses) **reads `memoDealInit` once** when starting a **new** deal (no in-progress snapshot). Then **clears** it (e.g. **`router.replace`** without the payload) so reload/back does not accidentally reuse the same init.
- **Direct `/game`** load with **no** `memoDealInit` ⇒ treat as **`seedNine: null`**.
- **Snapshot restore** ⇒ **ignore** `memoDealInit` for that load path; do not re-derive layout from seed.

---

## Pinia: `GameSettings` extensions

Existing: **`difficulty: Difficulty`**.

| Field | Type | Rules |
|-------|------|--------|
| **`briefcaseSeedRaw`** | `string` | **Live** contents of the Briefcase seed field (masked **`xxx-xxx-xxx`** in UI; may include hyphens). Used only so **`BriefcaseView.vue`** and **`BriefcaseViewPage.vue`** (header **Play**) both read the same value inside **`useBriefcaseNavigateToGame`**. **Not** the same as **`seedNine`** until passed through **`parseNineDigitSeedOrNull`**. **FR-005a**: canonical digit count **never** exceeds **nine** (mask + input handler enforce cap). |

**Do not persist** `briefcaseSeedRaw` to **`localStorage`** for v1 unless product adds a “remember seed” feature.

---

## `GameSession` extension (**FR-006a** / **FR-014** parity)

Extend **`GameSession`** (see **`specs/004-game-core-logic/data-model.md`**) with:

| Field | Type | Rules |
|-------|------|--------|
| **`dealBriefcaseSeedRaw`** | `string` | Copy of **`GameSettings.briefcaseSeedRaw`** at the instant the **in-progress** round **began** (when **`beginSession`** / first deal for that session is created from a path that knows the Briefcase field). Rounds started **without** Briefcase context (e.g. direct **`/game`**, **win** continuation, **abandon** restart from **`GameView`**) use **`''`**. |

**Briefcase → `/game` navigation** when **`gameSession.status === 'in_progress'`**:

- If **`settings.difficulty !== gameSession.difficulty`** → existing **FR-014** confirm (**English** copy may be extended or shared).
- **Else if** **`settings.briefcaseSeedRaw !== gameSession.dealBriefcaseSeedRaw`** → **same** confirm / finalize / reset / navigate sequence (**FR-006a**).
- **Else** → navigate without prompt.

**Snapshot**: **`dealBriefcaseSeedRaw`** is part of **`session`** inside **`SessionSnapshot`** so restore + Briefcase comparison stay consistent after reload.

---

## Canonical value: `NineDigitSeed`

| Concept | Definition |
|---------|------------|
| **Complete seed** | Ordered sequence **d₁…d₉** where each **dᵢ** is digit **0–9**. String form **`nine`** is **`d₁d₂…d₉`** (length 9). |
| **UI display** | **`xxx-xxx-xxx`** with hyphens after positions 3 and 6 when ≥1 digit present; hyphens are **not** part of **`nine`** — parser strips them. |

---

## Relationship to `MemoryState` / `SessionSnapshot`

- **Snapshot** stores **per-cell `identityIndex`** after shuffle; restoring **never** recomputes shuffle from Briefcase seed or **`memoDealInit`**.
- **Completed / abandoned** sessions do not need to store seed for **005** (future stats may add optional field—out of scope).

---

## Pure logic contract (see `contracts/`)

**Input**: **`difficulty`**, **`seedNine`**, and **`buildGridCells`** output order.  
**Output**: permuted **identity indices** (same multiset, deterministic when **`seedNine`** is non-null).

Documented in [`contracts/seed-deal.contract.md`](./contracts/seed-deal.contract.md).
