import { afterEach, beforeEach, expect, test } from 'bun:test'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { emojibaseResponse } from '@/test/emojibase'
import { EmojiPicker } from './EmojiPicker'

const realFetch = globalThis.fetch

beforeEach(() => {
  globalThis.fetch = (async (input: RequestInfo | URL) => emojibaseResponse(input) ?? new Response(null, { status: 404 })) as typeof fetch
})

afterEach(() => {
  globalThis.fetch = realFetch
})

test('a click on an emoji gives its character', async () => {
  const picked: string[] = []
  const view = render(<EmojiPicker onPick={(emoji) => picked.push(emoji)} />)
  await userEvent.click(await view.findByRole('gridcell', { name: 'Grinning face' }, { timeout: 4000 }))
  expect(picked).toEqual(['😀'])
})

test('a Shift-click asks to pick several, a plain click does not', async () => {
  const picks: boolean[] = []
  const view = render(<EmojiPicker onPick={(_, { several }) => picks.push(several)} />)
  const cell = await view.findByRole('gridcell', { name: 'Grinning face' }, { timeout: 4000 })
  const user = userEvent.setup()
  await user.keyboard('{Shift>}')
  await user.click(cell)
  await user.keyboard('{/Shift}')
  await user.click(cell)
  expect(picks).toEqual([true, false])
})
