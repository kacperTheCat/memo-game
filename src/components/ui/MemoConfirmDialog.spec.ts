import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import MemoConfirmDialog from '@/components/ui/MemoConfirmDialog.vue'

describe('MemoConfirmDialog', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  function mountOpen() {
    return mount(MemoConfirmDialog, {
      attachTo: document.body,
      props: {
        open: true,
        title: 'Test title',
        message: 'Test message body.',
        confirmLabel: 'OK',
        cancelLabel: 'Cancel',
      },
    })
  }

  it('renders panel with contract testids when open', async () => {
    const wrapper = mountOpen()
    await flushPromises()
    const panel = document.body.querySelector('[data-testid="memo-confirm-dialog"]')
    expect(panel).toBeTruthy()
    expect(panel?.getAttribute('role')).toBe('dialog')
    expect(panel?.getAttribute('aria-modal')).toBe('true')
    expect(
      document.body.querySelector('[data-testid="memo-confirm-message"]')?.textContent,
    ).toContain('Test message body.')
    expect(document.body.querySelector('[data-testid="memo-confirm-cancel"]')).toBeTruthy()
    expect(document.body.querySelector('[data-testid="memo-confirm-confirm"]')).toBeTruthy()
    wrapper.unmount()
  })

  it('emits confirm and cancel', async () => {
    const wrapper = mountOpen()
    await flushPromises()
    const ok = document.body.querySelector(
      '[data-testid="memo-confirm-confirm"]',
    ) as HTMLButtonElement
    const cancel = document.body.querySelector(
      '[data-testid="memo-confirm-cancel"]',
    ) as HTMLButtonElement
    ok.click()
    expect(wrapper.emitted('confirm')).toHaveLength(1)
    cancel.click()
    expect(wrapper.emitted('cancel')).toHaveLength(1)
    wrapper.unmount()
  })

  it('emits cancel on Escape', async () => {
    const wrapper = mountOpen()
    await flushPromises()
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    )
    expect(wrapper.emitted('cancel')).toHaveLength(1)
    wrapper.unmount()
  })
})
