import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { hydrateLanguage, setLanguage, LANGUAGE_KEY } from '@lyftr/shared'
import { createMemoryStorage } from '../../packages/shared/src/testing/memoryStorage'
import ConfirmSheet from './components/ui/ConfirmSheet'

// The coverage guard proves the dictionary answers every key. This proves the other half:
// that a screen actually asks it — the wiring from a stored preference, through
// hydrateLanguage, to rendered Russian. Both halves can pass alone and still ship an
// English app, because a component that never calls t() has no missing keys to find.
//
// ConfirmSheet is the subject because its Cancel label is a *default parameter*: that is
// the shape that cannot be translated by the caller, so if defaults were still English
// this is where it would show.
describe('rendering in Russian', () => {
  beforeEach(async () => {
    await hydrateLanguage(createMemoryStorage({ [LANGUAGE_KEY]: 'ru' }))
  })

  it('renders Russian copy, including a label that comes from a default parameter', () => {
    render(
      <ConfirmSheet
        open
        title="Удалить программу?"
        message="«PPL» будет удалено навсегда."
        confirmLabel="Удалить"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Отмена' })).toBeTruthy()
  })

  it('follows a language change without a reload', async () => {
    const onCancel = vi.fn()
    const storage = createMemoryStorage({ [LANGUAGE_KEY]: 'ru' })
    const { rerender } = render(
      <ConfirmSheet open title="t" message="m" confirmLabel="c" onConfirm={vi.fn()} onCancel={onCancel} />,
    )
    expect(screen.getByRole('button', { name: 'Отмена' })).toBeTruthy()

    await setLanguage('en', storage)
    // A re-render is what the language store triggers in the real app (App.tsx subscribes
    // via useLanguage, and re-rendering the root re-renders the tree).
    rerender(
      <ConfirmSheet open title="t" message="m" confirmLabel="c" onConfirm={vi.fn()} onCancel={onCancel} />,
    )
    const cancel = screen.getByRole('button', { name: 'Cancel' })
    fireEvent.click(cancel)
    expect(onCancel).toHaveBeenCalled()
  })
})
