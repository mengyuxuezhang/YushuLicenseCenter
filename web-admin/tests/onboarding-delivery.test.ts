import { createApp, h, nextTick } from 'vue'
import { expect, it, vi } from 'vitest'
import OnboardingDelivery from '../src/license-center/OnboardingDelivery.vue'

it('copies complete delivery without a file workflow and provides keyboard fallback', async () => {
  const copy = vi.fn().mockResolvedValue(undefined)
  vi.stubGlobal('navigator', { clipboard: { writeText: copy } })
  const host = document.createElement('div'), app = createApp({ render: () => h(OnboardingDelivery, { delivery: { text: 'YUSHU1.fictional', expiresAt: Date.now() + 60000 } }) })
  app.mount(host); await nextTick()
  try {
    const button = [...host.querySelectorAll('button')].find(b => b.textContent === '复制接入信息')!
    button.click(); await nextTick(); await nextTick()
    expect(copy).toHaveBeenCalledWith('YUSHU1.fictional')
    expect(host.textContent).toContain('已复制')
    copy.mockRejectedValueOnce(Error('unavailable'))
    button.click(); await nextTick(); await nextTick()
    expect(host.textContent).toContain('Ctrl+C')
    expect(host.querySelector('input[type="file"]')).toBeNull()
  } finally { app.unmount(); vi.unstubAllGlobals() }
})
