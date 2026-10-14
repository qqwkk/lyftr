import { hydrateLanguage, LANGUAGE_KEY } from './src/i18n'
import { createMemoryStorage } from './src/testing/memoryStorage'

beforeEach(async () => {
  await hydrateLanguage(createMemoryStorage({ [LANGUAGE_KEY]: 'en' }))
})
