export function parseSupplierExpiresAt(value) {
  if (value == null || value === '') return null
  if (!(value instanceof Date) && typeof value !== 'string') throw new Error('授权到期时间格式不正确')
  if (typeof value === 'string') {
    const parts = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/)
    if (!parts || Number(parts[2]) < 1 || Number(parts[2]) > 12 || Number(parts[3]) < 1
      || Number(parts[3]) > new Date(Date.UTC(Number(parts[1]), Number(parts[2]), 0)).getUTCDate()
      || Number(parts[4]) > 23 || Number(parts[5]) > 59 || Number(parts[6]) > 59) {
      throw new Error('授权到期时间格式不正确，请使用带时区的日期时间')
    }
  }
  const date = value instanceof Date ? value : new Date(value)
  if (!Number.isFinite(date.getTime()) || date.getUTCFullYear() < 1000 || date.getUTCFullYear() > 9999) {
    throw new Error('授权到期时间格式不正确')
  }
  return date.toISOString()
}

