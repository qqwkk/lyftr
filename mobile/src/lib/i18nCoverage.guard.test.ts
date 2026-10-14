import { join } from 'path'
import { hasTranslation } from '@lyftr/shared'
import { translationKeys } from '../../../packages/shared/src/testing/i18nKeys'

// The mobile half of the Russian coverage guard — see web/src/i18n.guard.test.ts for why
// the check is duplicated per app rather than living in packages/shared: each app's CI job
// is gated by its own paths filter, so only the app's own suite is guaranteed to run when
// that app gains a screen.
//
// A key with no Russian entry renders its English source and breaks nothing, so nothing
// else can catch it. Runtime-assembled keys (`t(MEAL_LABELS[meal])`, `t(o.label)`) are
// invisible to a source scan and stay the author's responsibility.
const MOBILE = join(__dirname, '..', '..')

it('translates every literal key the mobile app asks for', () => {
  const keys = translationKeys([join(MOBILE, 'src'), join(MOBILE, 'app')])
  const missing = [...keys]
    .filter(([key]) => !hasTranslation(key))
    .map(([key, file]) => `${file.replace(/.*mobile[\\/]/, 'mobile/')}: ${JSON.stringify(key)}`)
  expect(missing).toEqual([])
})
