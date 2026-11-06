import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { createLicenseCenter, emptyCenterState } from './center.mjs'
import { memoryStateStore } from '../../repositories/authorization-state.mjs'
import { verifyClaims } from './protocol.mjs'

async function fixture() {
  const pair = crypto.generateKeyPairSync('ed25519'), keys = { test: pair.publicKey }, store = memoryStateStore(emptyCenterState())
  const center = createLicenseCenter({ store, privateKey: pair.privateKey, publicKeys: keys, keyId: 'test', credentialKey: crypto.randomBytes(48) })
  const issue = (id, domain = 'https://agent.example.test') => center.issue({ id, name: '示例代理', packageId: 'standard', modelMode: 'custom', domain, expiresAt: null, ...(id === 'old' ? { initialUsage: { projects: 2, builds: 4 }, initialResourceIds: { projects: ['project-a'], builds: ['build-a'] } } : {}) }, 'operator')
  const old = await issue('old')
  const binding = { grantId: 'old', instanceId: 'old-instance', domain: old.grant.domain }
  const active = await center.activate({ code: old.code, instanceId: binding.instanceId, domain: binding.domain, requestId: 'old-request' })
  binding.credential = active.credential
  return { center, store, keys, issue, binding }
}
test('deleted authorization can be reauthorized while preserving business identity, resource reservations and cumulative usage', async () => {
  const f = await fixture(), next = await f.issue('new'), before = await f.store.read()
  const input = { code: next.code, instanceId: 'new-instance', domain: next.grant.domain, requestId: 'new-request', previousBinding: f.binding }
  await assert.rejects(f.center.activate(input), { code: 'PREVIOUS_LICENSE_ACTIVE' })
  await f.center.deleteGrant('old', { expectedVersion: 1 }, 'operator')
  const active = await f.center.activate(input)
  const grant = verifyClaims(active.certificate, { keys: f.keys, audience: 'deployment', instanceId: input.instanceId })
  assert.equal(grant.id, 'new'); assert.equal(grant.businessId, 'old'); assert.deepEqual(grant.previousLicenseIds, ['old'])
  assert.equal((await f.center.activate(input)).credential, active.credential)
  const entry = (await f.center.list()).grants.find(g => g.id === 'new')
  assert.deepEqual(entry.usage, { projects: 2, builds: 4 })
  const state = await f.store.read()
  assert.equal(state.resources[JSON.stringify(['new', 'projects', 'project-a'])].reservationId, before.resources[JSON.stringify(['old', 'projects', 'project-a'])].reservationId)
  await assert.rejects(f.center.refresh(f.binding.credential), { code: 'INSTANCE_UNAUTHORIZED' })
  const another = await f.issue('other')
  await assert.rejects(f.center.activate({ ...input, code: another.code, requestId: 'other' }), { code: 'PREVIOUS_LICENSE_RECOVERED' })
})
test('recovery rejects missing ownership, mismatched domain and resource conflicts atomically', async () => {
  const f = await fixture(); await f.center.deleteGrant('old', { expectedVersion: 1 }, 'operator')
  const next = await f.issue('new'), other = await f.issue('other-domain', 'https://other.example.test')
  const input = { code: next.code, instanceId: 'new-instance', domain: next.grant.domain, requestId: 'recovery', previousBinding: f.binding }
  for (const patch of [{ credential: 'invalid' }, { instanceId: 'other' }, { domain: 'https://other.example.test' }]) {
    await assert.rejects(f.center.activate({ ...input, previousBinding: { ...f.binding, ...patch } }), { code: 'RECOVERY_BINDING_MISMATCH' })
  }
  await assert.rejects(f.center.activate({ ...input, code: other.code, domain: other.grant.domain }), { code: 'RECOVERY_BINDING_MISMATCH' })
  await f.store.transaction(state => { state.resources[JSON.stringify(['new', 'builds', 'build-a'])] = { grantId: 'new', kind: 'builds', resourceId: 'build-a' } })
  const before = await f.store.read()
  await assert.rejects(f.center.activate(input), { code: 'RECOVERY_RESOURCE_CONFLICT' })
  assert.deepEqual(await f.store.read(), before)
})

test('successive recovery retains the original business identity and cannot reset quota consumption', async () => {
  const f = await fixture()
  const standard = (await f.center.list()).packages.find(p => p.id === 'standard')
  await f.center.updatePackage('standard', { ...standard, expectedVersion: standard.version, quotas: { ...standard.quotas, builds: { mode: 'limited', value: 4 } } }, 'operator')
  const old = (await f.center.list()).grants.find(g => g.id === 'old')
  await f.center.deleteGrant('old', { expectedVersion: old.version }, 'operator')
  const next = await f.issue('new')
  const active = await f.center.activate({ code: next.code, instanceId: 'new-instance', domain: next.grant.domain, requestId: 'new', previousBinding: f.binding })
  await f.center.deleteGrant('new', { expectedVersion: 1 }, 'operator')
  const last = await f.issue('last')
  const result = await f.center.activate({ code: last.code, instanceId: 'last-instance', domain: last.grant.domain, requestId: 'last', previousBinding: { grantId: 'new', instanceId: 'new-instance', credential: active.credential, domain: next.grant.domain } })
  const grant = verifyClaims(result.certificate, { keys: f.keys, audience: 'deployment' })
  assert.equal(grant.businessId, 'old'); assert.deepEqual(grant.previousLicenseIds, ['old', 'new'])
  const token = (await f.center.serviceToken(result.credential, 'official-build')).token
  await assert.rejects(f.center.resource(token, { action: 'reserve', kind: 'builds', resourceId: 'new-build' }), { code: 'QUOTA_EXHAUSTED' })
})

test('recovery deduplicates imported resource IDs without discarding unindexed historical consumption', async () => {
  const f = await fixture(); await f.center.deleteGrant('old', { expectedVersion: 1 }, 'operator')
  const next = await f.center.issue({ id: 'new', name: '示例代理', domain: f.binding.domain, packageId: 'standard', modelMode: 'custom', expiresAt: null, initialUsage: { projects: 2, builds: 2 }, initialResourceIds: { projects: ['project-a', 'project-b'], builds: ['build-a', 'build-b'] } }, 'operator')
  await f.center.activate({ code: next.code, instanceId: 'new-instance', domain: next.grant.domain, requestId: 'new', previousBinding: f.binding })
  const grant = (await f.center.list()).grants.find(g => g.id === 'new')
  assert.deepEqual(grant.usage, { projects: 3, builds: 5 })
  assert.deepEqual((await f.store.read()).grants.old.recoveredUsage, { projects: 2, builds: 4 })
})
