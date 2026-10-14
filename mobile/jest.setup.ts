import { hydrateLanguage, LANGUAGE_KEY } from '@lyftr/shared'
import { createMemoryStorage } from '../packages/shared/src/testing/memoryStorage'

beforeEach(async () => {
  await hydrateLanguage(createMemoryStorage({ [LANGUAGE_KEY]: 'en' }))
})
