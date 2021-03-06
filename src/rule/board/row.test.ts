import { BLACK_PATTERNS, RowKind, search, WHITE_PATTERNS } from './row'

test('WhiteFives1', () => {
  const result = search(0b00000, 0b11111, 5, WHITE_PATTERNS[RowKind.five][0])
  expect(result).toMatchObject([0])
})

test('BlackFives1', () => {
  const result = search(0b0111110, 0b0000000, 7, BLACK_PATTERNS[RowKind.five][0])
  expect(result).toMatchObject([1])
})
