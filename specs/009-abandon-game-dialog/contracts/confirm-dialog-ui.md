# UI contract: Memo confirm dialog (009)

## Component

**Name:** `MemoConfirmDialog` (path: `src/components/ui/MemoConfirmDialog.vue`)

## Props (conceptual)

| Prop | Type | Required | Notes |
|------|------|----------|--------|
| `open` | boolean | yes | When true, dialog is teleported and visible |
| `title` | string | yes | Short heading (English) |
| `message` | string | yes | Body copy (may be multi-sentence; from `appCopy`) |
| `confirmLabel` | string | yes | Affirmative action (e.g. **Abandon game**, **Continue**) |
| `cancelLabel` | string | yes | Negative action (e.g. **Cancel**) |
| `variant` | `'danger' \| 'neutral'` | optional | Affirmative button emphasis; abandon may use danger styling |

## Events

| Event | When |
|-------|------|
| `confirm` | User activated affirmative control |
| `cancel` | User activated cancel, clicked backdrop (if enabled), or Escape |

## Accessibility

- Root node: **`role="dialog"`**, **`aria-modal="true"`**
- Title and description elements wired with **`aria-labelledby`** / **`aria-describedby`**
- Escape emits **cancel**

## Test hooks (`data-testid`)

| Test id | Element |
|---------|---------|
| `memo-confirm-dialog` | Root dialog container (panel) |
| `memo-confirm-message` | Body message region |
| `memo-confirm-cancel` | Cancel button |
| `memo-confirm-confirm` | Confirm button |

## Playwright expectations

- When dialog is shown, **`memo-confirm-dialog`** is **visible**.
- **`window.confirm`** is **not** invoked for covered flows (spy or absence of native dialog).
- Confirm → application-specific route/state per user story; Cancel → prior route/state unchanged.
- **Unlock showcase (US2):** Dialog appears for **any** `in_progress` session on Unlock, including **matching** Briefcase settings (**FR-002**).
