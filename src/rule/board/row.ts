export type Stones = number // stones as bits, e.g. 0b00111010

export const RowKind: Record<string, number> = {
  two: 2,
  sword: 13,
  three: 3,
  four: 4,
  five: 5,
  overline: 6,
} as const
export type RowKind = typeof RowKind[keyof typeof RowKind]

export type Row = {
  readonly kind: RowKind
  readonly size: number
  readonly eyes: number[] // index on which the row will promote if a stone is put
}

export type RowPattern = {
  readonly row: Row
  readonly size: number
  readonly offset: number
  readonly blacks: Stones
  readonly blmask: Stones
  readonly whites: Stones
  readonly whmask: Stones
}

export const search = (
  blacks: Stones,
  whites: Stones,
  within: number,
  pattern: RowPattern
): number[] => {
  if (within < pattern.size) return []
  const filter: Stones = 2 ** pattern.size - 1 // e.g. 6 -> 0b111111

  const result: number[] = []
  for (let i = 0; i <= within - pattern.size; i++) {
    if (
      (blacks & filter & ~pattern.blmask) === pattern.blacks &&
      (whites & filter & ~pattern.whmask) === pattern.whites
    ) {
      result.push(i + pattern.offset)
    }
    blacks >>>= 1
    whites >>>= 1
  }
  return result
}

const BLACK_TWO_PATTERNS: RowPattern[] = [
  {
    row: { kind: RowKind.two, size: 4, eyes: [2, 3] },
    size: 8,
    offset: 2,
    blacks: 0b00001100,
    whites: 0b00000000,
    blmask: 0b00000000,
    whmask: 0b10000001,
  },
  {
    row: { kind: RowKind.two, size: 4, eyes: [1, 3] },
    size: 8,
    offset: 2,
    blacks: 0b00010100,
    whites: 0b00000000,
    blmask: 0b00000000,
    whmask: 0b10000001,
  },
  {
    row: { kind: RowKind.two, size: 4, eyes: [0, 3] },
    size: 8,
    offset: 2,
    blacks: 0b00011000,
    whites: 0b00000000,
    blmask: 0b00000000,
    whmask: 0b10000001,
  },
  {
    row: { kind: RowKind.two, size: 4, eyes: [1, 2] },
    size: 8,
    offset: 2,
    blacks: 0b00100100,
    whites: 0b00000000,
    blmask: 0b00000000,
    whmask: 0b10000001,
  },
  {
    row: { kind: RowKind.two, size: 4, eyes: [0, 2] },
    size: 8,
    offset: 2,
    blacks: 0b00101000,
    whites: 0b00000000,
    blmask: 0b00000000,
    whmask: 0b10000001,
  },
  {
    row: { kind: RowKind.two, size: 4, eyes: [0, 1] },
    size: 8,
    offset: 2,
    blacks: 0b00110000,
    whites: 0b00000000,
    blmask: 0b00000000,
    whmask: 0b10000001,
  },
]

const BLACK_SWORD_PATTERNS: RowPattern[] = [
  {
    row: { kind: RowKind.sword, size: 5, eyes: [2, 3] },
    size: 7,
    offset: 1,
    blacks: 0b0100110,
    whites: 0b0000000,
    blmask: 0b0000000,
    whmask: 0b1000001,
  },
  {
    row: { kind: RowKind.sword, size: 5, eyes: [1, 3] },
    size: 7,
    offset: 1,
    blacks: 0b0101010,
    whites: 0b0000000,
    blmask: 0b0000000,
    whmask: 0b1000001,
  },
  {
    row: { kind: RowKind.sword, size: 5, eyes: [1, 2] },
    size: 7,
    offset: 1,
    blacks: 0b0110010,
    whites: 0b0000000,
    blmask: 0b0000000,
    whmask: 0b1000001,
  },
  {
    row: { kind: RowKind.sword, size: 5, eyes: [3, 4] },
    size: 7,
    offset: 1,
    blacks: 0b0001110,
    whites: 0b0000001,
    blmask: 0b0000000,
    whmask: 0b1000000,
  },
  {
    row: { kind: RowKind.sword, size: 5, eyes: [2, 4] },
    size: 7,
    offset: 1,
    blacks: 0b0010110,
    whites: 0b0000001,
    blmask: 0b0000000,
    whmask: 0b1000000,
  },
  {
    row: { kind: RowKind.sword, size: 5, eyes: [1, 4] },
    size: 7,
    offset: 1,
    blacks: 0b0011010,
    whites: 0b0000001,
    blmask: 0b0000000,
    whmask: 0b1000000,
  },
  {
    row: { kind: RowKind.sword, size: 5, eyes: [0, 3] },
    size: 7,
    offset: 1,
    blacks: 0b0101100,
    whites: 0b1000000,
    blmask: 0b0000000,
    whmask: 0b0000001,
  },
  {
    row: { kind: RowKind.sword, size: 5, eyes: [0, 2] },
    size: 7,
    offset: 1,
    blacks: 0b0110100,
    whites: 0b1000000,
    blmask: 0b0000000,
    whmask: 0b0000001,
  },
  {
    row: { kind: RowKind.sword, size: 5, eyes: [0, 1] },
    size: 7,
    offset: 1,
    blacks: 0b0111000,
    whites: 0b1000000,
    blmask: 0b0000000,
    whmask: 0b0000001,
  },
  {
    row: { kind: RowKind.sword, size: 5, eyes: [0, 4] },
    size: 7,
    offset: 1,
    blacks: 0b0011100,
    whites: 0b1000001,
    blmask: 0b0000000,
    whmask: 0b0000000,
  },
  {
    row: { kind: RowKind.sword, size: 5, eyes: [1, 4] },
    size: 8,
    offset: 2,
    blacks: 0b00110101,
    whites: 0b00000000,
    blmask: 0b00000000,
    whmask: 0b10000000,
  },
  {
    row: { kind: RowKind.sword, size: 5, eyes: [0, 3] },
    size: 8,
    offset: 1,
    blacks: 0b10101100,
    whites: 0b00000000,
    blmask: 0b00000000,
    whmask: 0b00000001,
  },
  {
    row: { kind: RowKind.sword, size: 5, eyes: [0, 4] },
    size: 8,
    offset: 2,
    blacks: 0b00111001,
    whites: 0b00000000,
    blmask: 0b00000000,
    whmask: 0b10000000,
  },
  {
    row: { kind: RowKind.sword, size: 5, eyes: [0, 4] },
    size: 8,
    offset: 1,
    blacks: 0b10011100,
    whites: 0b00000000,
    blmask: 0b00000000,
    whmask: 0b00000001,
  },
  {
    row: { kind: RowKind.sword, size: 5, eyes: [2, 4] },
    size: 8,
    offset: 2,
    blacks: 0b00101101,
    whites: 0b00000000,
    blmask: 0b00000000,
    whmask: 0b10000000,
  },
  {
    row: { kind: RowKind.sword, size: 5, eyes: [0, 2] },
    size: 8,
    offset: 1,
    blacks: 0b10110100,
    whites: 0b00000000,
    blmask: 0b00000000,
    whmask: 0b00000001,
  },
]

const BLACK_THREE_PATTERNS: RowPattern[] = [
  {
    row: { kind: RowKind.three, size: 6, eyes: [4] },
    size: 8,
    offset: 1,
    blacks: 0b00011100,
    whites: 0b00000000,
    blmask: 0b00000000,
    whmask: 0b10000001,
  },
  {
    row: { kind: RowKind.three, size: 6, eyes: [3] },
    size: 8,
    offset: 1,
    blacks: 0b00101100,
    whites: 0b00000000,
    blmask: 0b00000000,
    whmask: 0b10000001,
  },
  {
    row: { kind: RowKind.three, size: 6, eyes: [2] },
    size: 8,
    offset: 1,
    blacks: 0b00110100,
    whites: 0b00000000,
    blmask: 0b00000000,
    whmask: 0b10000001,
  },
  {
    row: { kind: RowKind.three, size: 6, eyes: [1] },
    size: 8,
    offset: 1,
    blacks: 0b00111000,
    whites: 0b00000000,
    blmask: 0b00000000,
    whmask: 0b10000001,
  },
]

const BLACK_FOUR_PATTERNS: RowPattern[] = [
  {
    row: { kind: RowKind.four, size: 5, eyes: [4] },
    size: 7,
    offset: 1,
    blacks: 0b0011110,
    whites: 0b0000000,
    blmask: 0b0000000,
    whmask: 0b1000001,
  },
  {
    row: { kind: RowKind.four, size: 5, eyes: [3] },
    size: 7,
    offset: 1,
    blacks: 0b0101110,
    whites: 0b0000000,
    blmask: 0b0000000,
    whmask: 0b1000001,
  },
  {
    row: { kind: RowKind.four, size: 5, eyes: [2] },
    size: 7,
    offset: 1,
    blacks: 0b0110110,
    whites: 0b0000000,
    blmask: 0b0000000,
    whmask: 0b1000001,
  },
  {
    row: { kind: RowKind.four, size: 5, eyes: [1] },
    size: 7,
    offset: 1,
    blacks: 0b0111010,
    whites: 0b0000000,
    blmask: 0b0000000,
    whmask: 0b1000001,
  },
  {
    row: { kind: RowKind.four, size: 5, eyes: [0] },
    size: 7,
    offset: 1,
    blacks: 0b0111100,
    whites: 0b0000000,
    blmask: 0b0000000,
    whmask: 0b1000001,
  },
]

const BLACK_FIVE_PATTERNS: RowPattern[] = [
  {
    row: { kind: RowKind.five, size: 5, eyes: [] },
    size: 7,
    offset: 1,
    blacks: 0b0111110,
    whites: 0b0000000,
    blmask: 0b0000000,
    whmask: 0b1000001,
  },
]

const BLACK_OVERLINE_PATTERNS: RowPattern[] = [
  {
    row: { kind: RowKind.overline, size: 6, eyes: [] },
    size: 6,
    offset: 0,
    blacks: 0b111111,
    whites: 0b000000,
    blmask: 0b000000,
    whmask: 0b000000,
  },
]

const WHITE_TWO_PATTERNS: RowPattern[] = [
  {
    row: { kind: RowKind.two, size: 4, eyes: [2, 3] },
    size: 6,
    offset: 1,
    blacks: 0b000000,
    whites: 0b000110,
    blmask: 0b000000,
    whmask: 0b000000,
  },
  {
    row: { kind: RowKind.two, size: 4, eyes: [1, 3] },
    size: 6,
    offset: 1,
    blacks: 0b000000,
    whites: 0b001010,
    blmask: 0b000000,
    whmask: 0b000000,
  },
  {
    row: { kind: RowKind.two, size: 4, eyes: [0, 3] },
    size: 6,
    offset: 1,
    blacks: 0b000000,
    whites: 0b001100,
    blmask: 0b000000,
    whmask: 0b000000,
  },
  {
    row: { kind: RowKind.two, size: 4, eyes: [1, 2] },
    size: 6,
    offset: 1,
    blacks: 0b000000,
    whites: 0b010010,
    blmask: 0b000000,
    whmask: 0b000000,
  },
  {
    row: { kind: RowKind.two, size: 4, eyes: [0, 2] },
    size: 6,
    offset: 1,
    blacks: 0b000000,
    whites: 0b010100,
    blmask: 0b000000,
    whmask: 0b000000,
  },
  {
    row: { kind: RowKind.two, size: 4, eyes: [0, 1] },
    size: 6,
    offset: 1,
    blacks: 0b000000,
    whites: 0b011000,
    blmask: 0b000000,
    whmask: 0b000000,
  },
]

const WHITE_SWORD_PATTERNS: RowPattern[] = [
  {
    row: { kind: RowKind.sword, size: 5, eyes: [2, 3] },
    size: 5,
    offset: 0,
    blacks: 0b00000,
    whites: 0b10011,
    blmask: 0b00000,
    whmask: 0b00000,
  },
  {
    row: { kind: RowKind.sword, size: 5, eyes: [1, 3] },
    size: 5,
    offset: 0,
    blacks: 0b00000,
    whites: 0b10101,
    blmask: 0b00000,
    whmask: 0b00000,
  },
  {
    row: { kind: RowKind.sword, size: 5, eyes: [1, 2] },
    size: 5,
    offset: 0,
    blacks: 0b00000,
    whites: 0b11001,
    blmask: 0b00000,
    whmask: 0b00000,
  },
  {
    row: { kind: RowKind.sword, size: 5, eyes: [3, 4] },
    size: 6,
    offset: 1,
    blacks: 0b000001,
    whites: 0b001110,
    blmask: 0b000000,
    whmask: 0b000000,
  },
  {
    row: { kind: RowKind.sword, size: 5, eyes: [2, 4] },
    size: 6,
    offset: 1,
    blacks: 0b000001,
    whites: 0b010110,
    blmask: 0b000000,
    whmask: 0b000000,
  },
  {
    row: { kind: RowKind.sword, size: 5, eyes: [1, 4] },
    size: 6,
    offset: 1,
    blacks: 0b000001,
    whites: 0b011010,
    blmask: 0b000000,
    whmask: 0b000000,
  },
  {
    row: { kind: RowKind.sword, size: 5, eyes: [0, 3] },
    size: 6,
    offset: 0,
    blacks: 0b100000,
    whites: 0b010110,
    blmask: 0b000000,
    whmask: 0b000000,
  },
  {
    row: { kind: RowKind.sword, size: 5, eyes: [0, 2] },
    size: 6,
    offset: 0,
    blacks: 0b100000,
    whites: 0b011010,
    blmask: 0b000000,
    whmask: 0b000000,
  },
  {
    row: { kind: RowKind.sword, size: 5, eyes: [0, 1] },
    size: 6,
    offset: 0,
    blacks: 0b100000,
    whites: 0b011100,
    blmask: 0b000000,
    whmask: 0b000000,
  },
  {
    row: { kind: RowKind.sword, size: 5, eyes: [0, 4] },
    size: 7,
    offset: 1,
    blacks: 0b1000001,
    whites: 0b0011100,
    blmask: 0b0000000,
    whmask: 0b0000000,
  },
]

const WHITE_THREE_PATTERNS: RowPattern[] = [
  {
    row: { kind: RowKind.three, size: 6, eyes: [4] },
    size: 6,
    offset: 0,
    blacks: 0b000000,
    whites: 0b001110,
    blmask: 0b000000,
    whmask: 0b000000,
  },
  {
    row: { kind: RowKind.three, size: 6, eyes: [3] },
    size: 6,
    offset: 0,
    blacks: 0b000000,
    whites: 0b010110,
    blmask: 0b000000,
    whmask: 0b000000,
  },
  {
    row: { kind: RowKind.three, size: 6, eyes: [2] },
    size: 6,
    offset: 0,
    blacks: 0b000000,
    whites: 0b011010,
    blmask: 0b000000,
    whmask: 0b000000,
  },
  {
    row: { kind: RowKind.three, size: 6, eyes: [1] },
    size: 6,
    offset: 0,
    blacks: 0b000000,
    whites: 0b011100,
    blmask: 0b000000,
    whmask: 0b000000,
  },
]

const WHITE_FOUR_PATTERNS: RowPattern[] = [
  {
    row: { kind: RowKind.four, size: 5, eyes: [4] },
    size: 5,
    offset: 0,
    blacks: 0b00000,
    whites: 0b01111,
    blmask: 0b00000,
    whmask: 0b00000,
  },
  {
    row: { kind: RowKind.four, size: 5, eyes: [3] },
    size: 5,
    offset: 0,
    blacks: 0b00000,
    whites: 0b10111,
    blmask: 0b00000,
    whmask: 0b00000,
  },
  {
    row: { kind: RowKind.four, size: 5, eyes: [2] },
    size: 5,
    offset: 0,
    blacks: 0b00000,
    whites: 0b11011,
    blmask: 0b00000,
    whmask: 0b00000,
  },
  {
    row: { kind: RowKind.four, size: 5, eyes: [1] },
    size: 5,
    offset: 0,
    blacks: 0b00000,
    whites: 0b11101,
    blmask: 0b00000,
    whmask: 0b00000,
  },
  {
    row: { kind: RowKind.four, size: 5, eyes: [0] },
    size: 5,
    offset: 0,
    blacks: 0b00000,
    whites: 0b11110,
    blmask: 0b00000,
    whmask: 0b00000,
  },
]

const WHITE_FIVE_PATTERNS: RowPattern[] = [
  {
    row: { kind: RowKind.five, size: 5, eyes: [] },
    size: 5,
    offset: 0,
    blacks: 0b00000,
    whites: 0b11111,
    blmask: 0b00000,
    whmask: 0b00000,
  },
]

export const BLACK_PATTERNS: Record<RowKind, RowPattern[]> = {
  2: BLACK_TWO_PATTERNS,
  13: BLACK_SWORD_PATTERNS,
  3: BLACK_THREE_PATTERNS,
  4: BLACK_FOUR_PATTERNS,
  5: BLACK_FIVE_PATTERNS,
  6: BLACK_OVERLINE_PATTERNS,
}

export const WHITE_PATTERNS: Record<RowKind, RowPattern[]> = {
  2: WHITE_TWO_PATTERNS,
  13: WHITE_SWORD_PATTERNS,
  3: WHITE_THREE_PATTERNS,
  4: WHITE_FOUR_PATTERNS,
  5: WHITE_FIVE_PATTERNS,
  6: [],
}

export const emptyRowsCache = (): Record<RowKind, undefined> => ({
  2: undefined,
  13: undefined,
  3: undefined,
  4: undefined,
  5: undefined,
  6: undefined,
})
