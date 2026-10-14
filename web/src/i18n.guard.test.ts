import { describe, it, expect } from 'vitest'
import { join } from 'path'
import { hasTranslation } from '@lyftr/shared'
import { translationKeys } from '../../packages/shared/src/testing/i18nKeys'

// A `t('…')` with no Russian entry is the one i18n bug that cannot show itself: the key
// IS the English copy, so the screen renders perfectly readable English and every other
// test passes. This is the only thing standing between "we added a screen" and "that
// screen is English for Russian users".
//
// It runs in web's vitest suite rather than packages/shared's jest, because CI gates
// `shared:test` on the mobile paths filter — a web-only change never runs it. The mobile
// half of the same guard lives in mobile/src/lib/i18nCoverage.guard.test.ts.
//
// Keys assembled at runtime (`t(label)` over a nav array, `t(MEAL_LABELS[meal])`) are
// invisible to a source scan and stay the author's responsibility.
describe('Russian coverage', () => {
  it('translates every literal key the web app asks for', () => {
    const keys = translationKeys([join(__dirname)])
    const missing = [...keys]
      .filter(([key]) => !hasTranslation(key))
      .map(([key, file]) => `${file.replace(/.*web[\\/]src[\\/]/, 'web/src/')}: ${JSON.stringify(key)}`)
    expect(missing).toEqual([])
  })
})
