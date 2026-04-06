export type KaspaHashType = 'block' | 'transaction'

export interface FormatHashOptions {
  truncate?: boolean | number
  labelPosition?: 'prefix' | 'suffix'
  label?: string
}

const LABELS: Record<KaspaHashType, string> = {
  block: 'Block hash',
  transaction: 'Transaction ID',
}

const DEFAULT_TRUNCATE = 12

function truncateHash(hash: string, maxChars: number): string {
  if (hash.length <= maxChars * 2) return hash
  return `${hash.slice(0, maxChars)}…${hash.slice(-maxChars)}`
}

export function formatHash(
  hash: string,
  type: KaspaHashType,
  options: FormatHashOptions = {},
): string {
  const label = options.label ?? LABELS[type]
  const shouldTruncate = options.truncate !== false
  const truncateChars =
    typeof options.truncate === 'number' ? Math.max(1, Math.floor(options.truncate)) : DEFAULT_TRUNCATE
  const formattedHash = shouldTruncate ? truncateHash(hash, truncateChars) : hash
  if (options.labelPosition === 'prefix') {
    return `${label}: ${formattedHash}`
  }
  return `${formattedHash} (${label})`
}
