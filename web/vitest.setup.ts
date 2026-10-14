import { afterEach, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { hydrateLanguage, LANGUAGE_KEY } from '@lyftr/shared'
import { createMemoryStorage } from '../packages/shared/src/testing/memoryStorage'

// Existing component assertions use English; language behavior has its own tests.
beforeEach(async () => {
  await hydrateLanguage(createMemoryStorage({ [LANGUAGE_KEY]: 'en' }))
})

// Unmount anything rendered via Testing Library after each test, so mounted
// hooks/components don't leak across cases (a leaked hook keeps reacting to
// shared store updates and skews call counts).
afterEach(() => {
  cleanup()
})
