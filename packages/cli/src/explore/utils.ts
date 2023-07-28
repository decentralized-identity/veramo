import { formatDistanceToNow } from 'date-fns'
import os from 'os'

export function shortDid(did?: string): string {
  if (!did) return ''
  did = did.replace(/\?.*$/, '')
  if (did.slice(0, 7) === 'did:web') {
    return did
  }
  return did.slice(0, did.lastIndexOf(':')) + '..' + did.slice(-4)
}

export function shortDate(date?: string): string {
  if (!date) return ''
  return formatDistanceToNow(new Date(date))
}

// return true if copy worked, false otherwise
export function copyToClipboard(text: string): boolean {
  /**
   * There's probably a better way than spawning. We tried and failed at the following:
   * - screen.copyToClipboard didn't do anything (and is iTerm2-specific, anyway)
   * - clipboardy wouldn't run due to error "Must use import to load ES Module" (even though we used import)
   */
  if (os.platform() === 'darwin') {
    const proc = require('child_process').spawn('pbcopy')
    proc.stdin.write(text)
    proc.stdin.end()
    return true
  } else if (os.platform() === 'win32') {
    require('child_process').spawn('clip').stdin.end(text)
    return true
  }
  return false
}
