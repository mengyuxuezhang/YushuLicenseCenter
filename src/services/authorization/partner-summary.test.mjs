import test from 'node:test'
import assert from 'node:assert/strict'
import express from 'express'
import { memoryStateStore } from '../../repositories/authorization-state.mjs'
import {
  registerPartnerSummary,
  summarySignature,
  PARTNER_SUMMARY_PATH as path,
} from './partner-summary.mjs'
test('专用摘要只返回白名单字段，验签和防重放', async () => {
  const secret = 'test-only-' + 's'.repeat(32),
    store = memoryStateStore({
      grants: {
        g1: {
          id: 'g1',
          name: '虚构授权',
          status: 'enabled',
          modelMode: 'fixed',
          expiresAt: null,
          packageId: 'basic',
          credentialHash: 'secret',
          domain: 'private.invalid',
        },
      },
      packages: {},
    })
  const app = express()
  app.use(
    express.json({
      verify(req, _res, bytes) {
        req.rawBody = bytes.toString('utf8')
      },
    })
  )
  registerPartnerSummary(app, { store, enabled: true, secret })
  app.use((e, _q, r, _n) =>
    r.status(e.statusCode || 400).json({ code: e.code })
  )
  const server = app.listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  try {
    const body = JSON.stringify({ grantIds: ['g1', 'missing'] }),
      timestamp = Date.now(),
      nonce = 'test-nonce-1947-123456'
    const headers = {
      'content-type': 'application/json',
      'x-partner-source': 'partner-center',
      'x-partner-time': String(timestamp),
      'x-partner-nonce': nonce,
      'x-partner-signature': summarySignature(secret, {
        source: 'partner-center',
        method: 'POST',
        path,
        timestamp,
        nonce,
        body,
      }),
    }
    const url = `http://127.0.0.1:${server.address().port}${path}`
    const response = await fetch(url, { method: 'POST', headers, body })
    assert.equal(response.status, 200)
    const result = await response.json()
    assert.equal(result.data.length, 1)
    assert(!JSON.stringify(result).includes('credentialHash'))
    assert(!JSON.stringify(result).includes('private.invalid'))
    assert.equal(
      (await fetch(url, { method: 'POST', headers, body })).status,
      409
    )
    assert.equal(
      (
        await fetch(url, {
          method: 'POST',
          headers: { ...headers, 'x-partner-signature': '0'.repeat(64) },
          body,
        })
      ).status,
      401
    )
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

test('摘要接入默认关闭，不接受运营会话代替专用服务凭据', async () => {
  const app = express()
  app.use(express.json())
  registerPartnerSummary(app, {
    store: memoryStateStore({ grants: {}, packages: {} }),
  })
  app.use((e, _q, r, _n) =>
    r.status(e.statusCode || 400).json({ code: e.code })
  )
  const server = app.listen(0, '127.0.0.1')
  await new Promise((r) => server.once('listening', r))
  try {
    const res = await fetch(
      `http://127.0.0.1:${server.address().port}${path}`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: 'Bearer fictional-operator-session',
        },
        body: '{"grantIds":[]}',
      }
    )
    assert.equal(res.status, 503)
  } finally {
    await new Promise((r) => server.close(r))
  }
})
