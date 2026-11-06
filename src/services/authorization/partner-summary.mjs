import { createHmac, createHash, timingSafeEqual } from 'node:crypto'
import { failure } from './protocol.mjs'
export const PARTNER_SUMMARY_PATH = '/api/license-center/v1/partner/summary'
export function summarySignature(
  secret,
  { source, method, path, timestamp, nonce, body }
) {
  return createHmac('sha256', secret)
    .update(
      [
        'v1',
        source,
        method,
        path,
        timestamp,
        nonce,
        createHash('sha256').update(body).digest('hex'),
      ].join('\n')
    )
    .digest('hex')
}
// Dedicated read-only credential: no operator session or license signing key.
export function registerPartnerSummary(
  app,
  { store, enabled = false, secret, now = Date.now }
) {
  app.post(PARTNER_SUMMARY_PATH, async (req, res, next) => {
    try {
      if (!enabled || typeof secret !== 'string' || secret.length < 32)
        throw failure('PARTNER_SUMMARY_UNAVAILABLE', '摘要接入未配置', 503)
      const source = req.headers['x-partner-source'],
        timestamp = Number(req.headers['x-partner-time']),
        nonce = req.headers['x-partner-nonce'],
        signature = req.headers['x-partner-signature']
      if (
        source !== 'partner-center' ||
        !Number.isSafeInteger(timestamp) ||
        Math.abs(now() - timestamp) > 300000 ||
        typeof nonce !== 'string' ||
        !/^[a-zA-Z0-9_-]{16,80}$/.test(nonce) ||
        typeof signature !== 'string' ||
        !/^[a-f0-9]{64}$/.test(signature)
      )
        throw failure('PARTNER_AUTH_FAILED', '服务凭据无效', 401)
      const expected = summarySignature(secret, {
        source,
        timestamp,
        nonce,
        method: req.method,
        path: req.originalUrl,
        body: req.rawBody || '',
      })
      if (
        !timingSafeEqual(
          Buffer.from(signature, 'hex'),
          Buffer.from(expected, 'hex')
        )
      )
        throw failure('PARTNER_AUTH_FAILED', '服务凭据无效', 401)
      const ids = req.body.grantIds
      if (
        !Array.isArray(ids) ||
        ids.length > 100 ||
        ids.some((id) => typeof id !== 'string' || !id || id.length > 120)
      )
        throw failure('INVALID_GRANT_IDS', '授权编号格式不正确')
      const data = await store.transaction((state) => {
        state.partnerSummaryNonces = (state.partnerSummaryNonces || []).filter(
          (n) => n.expiresAt > now()
        )
        if (state.partnerSummaryNonces.some((n) => n.nonce === nonce))
          throw failure('PARTNER_REPLAY', '请求已使用', 409)
        state.partnerSummaryNonces.push({ nonce, expiresAt: now() + 600000 })
        return [...new Set(ids)].flatMap((id) => {
          const g = state.grants[id]
          if (!g) return []
          return [
            {
              id: g.id,
              name: g.name,
              status:
                g.expiresAt && Date.parse(g.expiresAt) <= now()
                  ? 'expired'
                  : g.status,
              modelMode: g.modelMode,
              expiresAt: g.expiresAt,
              packageName:
                state.packages[`${g.packageId}:${g.packageVersion}`]?.name ||
                g.packageId,
            },
          ]
        })
      })
      res.json({ success: true, data })
    } catch (error) {
      next(error)
    }
  })
}
