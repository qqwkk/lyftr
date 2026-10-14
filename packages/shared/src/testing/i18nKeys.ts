import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

// Shared by both apps' i18n coverage guards. The dictionary is keyed by the English
// source string, which means a new `t('…')` is silently untranslated: it renders the
// English back and nothing fails. One copy here, two callers, because each app's guard
// has to run in the CI job its own paths filter gates — a web-only change never runs
// `shared:test`, and a mobile-only change never runs web's vitest suite.

const SKIP = new Set(['node_modules', '.expo', 'android', 'ios', 'dist', 'build'])

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name.startsWith('.') || SKIP.has(e.name)) return []
    const p = join(dir, e.name)
    if (e.isDirectory()) return walk(p)
    return /\.tsx?$/.test(e.name) && !e.name.includes('.test.') && !e.name.endsWith('.d.ts') ? [p] : []
  })

// `t('x')`, `translate('x')` (the alias a file with its own `t` has to use) and
// tPlural's second argument. The negative lookbehind keeps `.t(` and `somet(` out.
const CALLS = [
  /(?<![\w.$])(?:t|translate)\(\s*(['"])((?:\\.|(?!\1)[^\\])*)\1/g,
  /(?<![\w.$])tPlural\(\s*[^,]+,\s*(['"])((?:\\.|(?!\1)[^\\])*)\1/g,
]

// A comment quoting a key is not a call site, so comments have to go — but a line-based
// `replace(/\/\/.*/, '')` cannot do it here: half the keys in this app ARE urls
// ("Include http:// or https://"), and blanking from the first `//` chops the string
// open and lets the next regex run through the rest of the file. Measured: it reported
// four keys that were really one key plus thirty lines of code.
//
// So this walks the source instead, blanking comments while leaving string contents
// alone. Blanking rather than deleting keeps every offset where it was.
const withoutComments = (src: string): string => {
  const out = src.split('')
  const blank = (from: number, to: number) => {
    for (let k = from; k < to; k++) if (out[k] !== '\n' && out[k] !== '\r') out[k] = ' '
  }
  let i = 0
  while (i < src.length) {
    const c = src[i]
    if (c === '/' && src[i + 1] === '/') {
      let j = i
      while (j < src.length && src[j] !== '\n') j++
      blank(i, j)
      i = j
    } else if (c === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2)
      const j = end < 0 ? src.length : end + 2
      blank(i, j)
      i = j
    } else if (c === "'" || c === '"' || c === '`') {
      let j = i + 1
      while (j < src.length && src[j] !== c) {
        if (src[j] === '\\') j++
        else if (c !== '`' && src[j] === '\n') break // an unterminated quote is not a string
        j++
      }
      i = j + 1
    } else {
      i++
    }
  }
  return out.join('')
}

/** Every literal translation key the given source trees ask for, with where it came from. */
export const translationKeys = (roots: string[]): Map<string, string> => {
  const found = new Map<string, string>()
  for (const root of roots) {
    for (const file of walk(root)) {
      const code = withoutComments(readFileSync(file, 'utf8'))
      for (const re of CALLS) {
        re.lastIndex = 0
        let m: RegExpExecArray | null
        while ((m = re.exec(code))) {
          const key = m[2].replace(/\\'/g, "'").replace(/\\"/g, '"')
          if (!found.has(key)) found.set(key, file)
        }
      }
    }
  }
  return found
}
