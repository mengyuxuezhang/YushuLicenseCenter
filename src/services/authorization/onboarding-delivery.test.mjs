import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { memoryStateStore } from '../../repositories/authorization-state.mjs'
import { createLicenseCenter, emptyCenterState } from './center.mjs'
import { verifyClaims } from './protocol.mjs'

export function onboardingFixture() {
  const pair = crypto.generateKeyPairSync('ed25519')
  const publicKeys = { test: pair.publicKey.export({ type: 'spki', format: 'pem' }) }
  const store = memoryStateStore(emptyCenterState())
  const center = createLicenseCenter({ store, privateKey: pair.privateKey, publicKeys, keyId: 'test', credentialKey: crypto.randomBytes(48), centerUrl: 'https://license.example.test' })
  return { center, store, publicKeys }
}
test('copyable onboarding binds identity and instance, revokes old delivery and never stores plaintext codes', async () => {
  const { center, store, publicKeys } = onboardingFixture()
  await center.issue({ id: 'fictional-agent', name: '示例代理', domain: 'https://agent.example.test', packageId: 'standard', modelMode: 'custom', expiresAt: null }, 'operator')
  const first = await center.onboardingInfo('fictional-agent', 'operator')
  const second = await center.onboardingInfo('fictional-agent', 'operator')
  const decode = value => JSON.parse(Buffer.from(value.text.slice(7), 'base64url'))
  const old = decode(first), packet = decode(second)
  const claims = verifyClaims(packet.proof, { keys: publicKeys, audience: 'authorization-onboarding', instanceId: packet.instanceId })
  assert.equal(claims.sub, 'fictional-agent')
  assert.equal(packet.modelMode, 'custom')
  assert.deepEqual(center.onboardingKeys().publicKeys, publicKeys)
  assert(!JSON.stringify(await store.read()).includes(packet.activationCode))
  await assert.rejects(center.activate({ code: old.activationCode, instanceId: old.instanceId, domain: old.publicUrl, requestId: 'old' }), { code: 'INVALID_CODE' })
  await assert.rejects(center.activate({ code: packet.activationCode, instanceId: 'wrong-instance', domain: packet.publicUrl, requestId: 'wrong' }), { code: 'BINDING_MISMATCH' })
  const input = { code: packet.activationCode, instanceId: packet.instanceId, domain: packet.publicUrl, requestId: 'valid' }
  const activated = await center.activate(input)
  assert.equal((await center.activate(input)).credential, activated.credential)
  await assert.rejects(center.onboardingInfo('fictional-agent', 'operator'), { code: 'ALREADY_ACTIVATED' })
})
