import crypto from 'node:crypto'
import { domain, digest, failure, secret, signClaims } from './protocol.mjs'

export function createOnboardingDelivery({ store, signing, publicKeys, centerUrl, now, audit }) {
  publicKeys = Object.fromEntries(Object.entries(publicKeys).map(([id, key]) => [id, typeof key === 'string' ? key : key.export({ type: 'spki', format: 'pem' })]))
  return {
    publicKeys() { return { centerUrl: domain(centerUrl), publicKeys, authorizationRecovery: 1 } },
    issue(id, actor) { return store.transaction(state => {
      const grant = state.grants[id]
      if (!grant || grant.deletedAt || grant.status !== 'enabled' || grant.expiresAt && Date.parse(grant.expiresAt) <= now()) throw failure('LICENSE_INACTIVE', '授权不可用于接入', 403)
      if (Number.isFinite(grant.activatedAt)) throw failure('ALREADY_ACTIVATED', '已激活授权请使用续期或部署迁移，不要重新激活', 409)
      const origin = domain(grant.domain), url = domain(centerUrl), instanceId = crypto.randomUUID(), code = secret(), issuedAt = now()
      const expiresAt = Math.min(issuedAt + 7 * 24 * 3600000, grant.expiresAt ? Date.parse(grant.expiresAt) : Infinity)
      for (const entry of Object.values(state.codes)) if (entry.grantId === id && entry.status === 'unused') entry.status = 'revoked'
      state.codes[digest(code)] = { grantId: id, status: 'unused', expiresAt, expectedInstanceId: instanceId }
      const payload = { format: 'yushu-authorization-connection', version: 1, licenseId: id, name: grant.name, centerUrl: url, publicKeys, instanceId, publicUrl: origin, activationCode: code, modelMode: grant.modelMode, expiresAt }
      payload.proof = signClaims({ aud: 'authorization-onboarding', sub: id, instanceId, origin, centerUrl: url, codeDigest: digest(code), modelMode: grant.modelMode, iat: issuedAt, exp: expiresAt }, signing)
      audit(state, actor, 'onboarding_generated', id, issuedAt)
      return { text: 'YUSHU1.' + Buffer.from(JSON.stringify(payload)).toString('base64url'), expiresAt, licenseId: id }
    }) },
  }
}
