import { digest, equal, failure } from './protocol.mjs'

// Called only inside the activation transaction, after checking the new code.
export function recoverAuthorization(state, target, previous, now) {
  const source = state.grants[previous?.grantId]
  if (!source || source.id === target.id || !previous.credential || !source.credentialHash
    || !equal(digest(previous.credential), source.credentialHash)
    || source.instanceId !== previous.instanceId || source.domain !== previous.domain
    || source.domain !== target.domain) throw failure('RECOVERY_BINDING_MISMATCH', '旧实例凭据或部署地址不匹配，不能接续原授权', 403)
  if (source.status === 'enabled' && !source.deletedAt && (!source.expiresAt || Date.parse(source.expiresAt) > now)) throw failure('PREVIOUS_LICENSE_ACTIVE', '原授权仍有效，请使用续期或部署迁移', 409)
  if (source.recoveredBy) throw failure('PREVIOUS_LICENSE_RECOVERED', '原授权已接续到其他授权，请刷新并核对当前连接', 409)
  const usage = (grant, kind) => Number(grant.initialUsage?.[kind] || 0) + Object.values(state.resources).filter(r => r.grantId === grant.id && r.kind === kind).length
  const inheritedUsage = Object.fromEntries(['projects', 'builds'].map(kind => [kind, usage(source, kind)]))
  for (const kind of ['projects', 'builds']) {
    const initial = Math.max(Number(source.initialUsage?.[kind] || 0), Number(target.initialUsage?.[kind] || 0))
    for (const [key, row] of Object.entries(state.resources)) {
      if (row.grantId !== source.id || row.kind !== kind) continue
      const next = JSON.stringify([target.id, kind, row.resourceId]), existing = state.resources[next]
      if (existing && !existing.imported) throw failure('RECOVERY_RESOURCE_CONFLICT', '新旧授权资源发生冲突，请联系授权人员核对', 409)
      state.resources[next] = { ...row, grantId: target.id, rootId: target.id, organizationId: target.id }
      delete state.resources[key]
    }
    target.initialUsage[kind] = initial
  }
  target.businessId = source.businessId || source.id
  target.previousLicenseIds = [...new Set([...(source.previousLicenseIds || []), source.id])]
  for (const [hash, grantId] of Object.entries(state.credentials)) if (grantId === source.id) delete state.credentials[hash]
  for (const code of Object.values(state.codes)) if (code.grantId === source.id && code.status === 'unused') code.status = 'revoked'
  for (const notice of Object.values(state.notices)) if (notice.grantId === source.id && !notice.deliveredAt) notice.cancelledAt = now
  source.status = 'revoked'
  source.deletedAt ||= now
  source.version += 1
  source.recoveredBy = target.id
  source.recoveredAt = now
  source.recoveredUsage = inheritedUsage
  return source.id
}
