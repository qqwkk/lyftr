import { createMemoryStorage } from '../testing/memoryStorage'
import { getLanguage, getLocale, hasTranslation, hydrateLanguage, LANGUAGE_KEY, setLanguage, t, tPlural } from './index'

beforeEach(async () => { await hydrateLanguage(createMemoryStorage()) })

test('starts in Russian and restores a saved English preference', async () => {
  expect(getLanguage()).toBe('ru')
  expect(getLocale()).toBe('ru-RU')
  expect(t('Language')).toBe('Язык')
  await hydrateLanguage(createMemoryStorage({ [LANGUAGE_KEY]: 'en' }))
  expect(getLanguage()).toBe('en')
  expect(t('Language')).toBe('Language')
})

test('persists language before changing the interface', async () => {
  const storage = createMemoryStorage()
  await setLanguage('en', storage)
  expect(storage.dump()[LANGUAGE_KEY]).toBe('en')
  await hydrateLanguage(storage)
  expect(getLanguage()).toBe('en')
  await setLanguage('ru', storage)
  expect(t('Interface language')).toBe('Язык интерфейса')
})

test('failed persistence keeps the previous language', async () => {
  const storage = createMemoryStorage()
  storage.set = async () => { throw new Error('Storage unavailable') }
  await expect(setLanguage('en', storage)).rejects.toThrow('Storage unavailable')
  expect(getLanguage()).toBe('ru')
})

test('invalid saved preference uses Russian and unknown text is preserved', async () => {
  await hydrateLanguage(createMemoryStorage({ [LANGUAGE_KEY]: 'invalid' }))
  expect(getLanguage()).toBe('ru')
  expect(t('Custom exercise name')).toBe('Custom exercise name')
  expect(t('Value: {value}', { value: 5 })).toBe('Value: 5')
  expect(t('Value: {value}')).toBe('Value: {value}')
  expect(t('At least {count} characters', { count: 8 })).toBe('Не менее 8 символов')
})

// Counted phrases. Russian picks between three forms where English picks between two,
// which is why these cannot be assembled as noun + "s": `t('exercise') + 's'` rendered
// "3 упражнениеs" on every program card on mobile.
const EXERCISES = '{count} exercise|{count} exercises'

test('agrees a counted noun with the number in Russian', () => {
  expect(tPlural(1, EXERCISES)).toBe('1 упражнение')
  expect(tPlural(2, EXERCISES)).toBe('2 упражнения')
  expect(tPlural(4, EXERCISES)).toBe('4 упражнения')
  expect(tPlural(5, EXERCISES)).toBe('5 упражнений')
  expect(tPlural(0, EXERCISES)).toBe('0 упражнений')
  // 11–14 take the many form even though they end in 1–4, and 21/22 go back to one/few.
  expect(tPlural(11, EXERCISES)).toBe('11 упражнений')
  expect(tPlural(14, EXERCISES)).toBe('14 упражнений')
  expect(tPlural(21, EXERCISES)).toBe('21 упражнение')
  expect(tPlural(22, EXERCISES)).toBe('22 упражнения')
  expect(tPlural(111, EXERCISES)).toBe('111 упражнений')
})

test('falls back to the English pair, not a Russian form, for an untranslated phrase', async () => {
  // The key carries both English forms, so an untranslated phrase still reads correctly —
  // and must not be indexed as if it had three.
  expect(tPlural(1, '{count} widget|{count} widgets')).toBe('1 widget')
  expect(tPlural(3, '{count} widget|{count} widgets')).toBe('3 widgets')
  await hydrateLanguage(createMemoryStorage({ [LANGUAGE_KEY]: 'en' }))
  expect(tPlural(1, EXERCISES)).toBe('1 exercise')
  expect(tPlural(5, EXERCISES)).toBe('5 exercises')
})

test('lets a caller format the count it substitutes', () => {
  // Settings shows a grouped count ("1,024"), but the form still has to be chosen by the
  // number itself — so the count picks the form and the param supplies the text.
  expect(tPlural(1024, 'Refreshed {count} exercise|Refreshed {count} exercises', { count: '1,024' }))
    .toBe('Обновлено 1,024 упражнения')
})

test('knows which keys the dictionary answers, for the per-app coverage guards', () => {
  expect(hasTranslation('Language')).toBe(true)
  expect(hasTranslation(EXERCISES)).toBe(true)
  expect(hasTranslation('A string no screen asks for')).toBe(false)
})
