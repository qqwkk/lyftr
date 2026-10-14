import { useSyncExternalStore } from 'react'
import type { StorageAdapter } from '../storage'
import { ruWeb } from './ru-web'
import { ruMobile } from './ru-mobile'
import { ruShared } from './ru-shared'
import { ruSettings } from './ru-settings'

export type Language = 'ru' | 'en'
export const LANGUAGE_KEY = 'lyftr_language'
const translations: Record<string, string> = { ...ruWeb, ...ruMobile, ...ruShared, ...ruSettings }
let language: Language = 'ru'
const listeners = new Set<() => void>()

export const getLanguage = (): Language => language
export const getLocale = (): string => language === 'ru' ? 'ru-RU' : 'en-US'

// For each app's i18n coverage guard. A missing key is invisible at runtime — `t`
// returns the English source — so the only thing that catches one is a test.
export const hasTranslation = (text: string): boolean => text in translations

function publishLanguage(next: Language) {
  if (language === next) return
  language = next
  listeners.forEach(listener => listener())
}

export async function hydrateLanguage(storage: StorageAdapter): Promise<void> {
  const saved = await storage.get(LANGUAGE_KEY)
  publishLanguage(saved === 'en' ? 'en' : 'ru')
}

export async function setLanguage(next: Language, storage: StorageAdapter): Promise<void> {
  await storage.set(LANGUAGE_KEY, next)
  publishLanguage(next)
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

export function useLanguage(): Language {
  return useSyncExternalStore(subscribe, getLanguage, getLanguage)
}

function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    params[key] === undefined ? match : String(params[key]),
  )
}

export function t(text: string, params?: Record<string, string | number>): string {
  return interpolate(language === 'ru' ? translations[text] ?? text : text, params)
}

// Russian agrees a noun with the number in three forms where English has two, so a
// count phrase cannot be built by appending an "s" to a translated noun — that is how
// `{t('exercise')}{n === 1 ? '' : 's'}` rendered "3 упражнениеs".
//
// The key carries both English forms, `singular|plural`; a Russian entry carries three,
// `one|few|many` ("1 упражнение", "2 упражнения", "5 упражнений"). `{count}` is filled
// in from the number, so a form may put it anywhere the language needs it.
const ruPluralForm = (n: number): 0 | 1 | 2 => {
  const hundreds = Math.abs(n) % 100
  const tens = hundreds % 10
  if (hundreds >= 11 && hundreds <= 14) return 2
  if (tens === 1) return 0
  if (tens >= 2 && tens <= 4) return 1
  return 2
}

export function tPlural(count: number, forms: string, params?: Record<string, string | number>): string {
  const translated = language === 'ru' ? translations[forms] : undefined
  const variants = (translated ?? forms).split('|')
  const index = translated ? ruPluralForm(count) : count === 1 ? 0 : 1
  return interpolate(variants[Math.min(index, variants.length - 1)], { count, ...params })
}
