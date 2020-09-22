import { formatDistanceToNow } from 'date-fns'

export function shortDid(did?: string): string {
  if (!did) return ''
  if (did.slice(0, 7) === 'did:web') {
    return did
  }
  return did.slice(0, did.lastIndexOf(':')) + '..' + did.slice(-4)
}

export function shortDate(date?: string): string {
  if (!date) return ''
  return formatDistanceToNow(new Date(date))
}
