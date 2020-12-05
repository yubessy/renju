import { Board, N_LINES, Point } from '../rule'
import { Options } from '../utils/options'
import { FreeLinesState } from './freeLines'
import { FreePointsState } from './freePoints'
import { GameState } from './game'

const editModes = ['mainMoves', 'freeBlacks', 'freeWhites', 'markerPoints', 'markerLines'] as const
export type EditMode = typeof editModes[number]
export const EditMode: Record<EditMode, EditMode> = {
  mainMoves: editModes[0],
  freeBlacks: editModes[1],
  freeWhites: editModes[2],
  markerPoints: editModes[3],
  markerLines: editModes[4],
} as const

const boardOptions = ['invertMoves', 'labelMarkers'] as const
export type BoardOption = typeof boardOptions[number]
export const BoardOption: Record<BoardOption, BoardOption> = {
  invertMoves: boardOptions[0],
  labelMarkers: boardOptions[1],
} as const

export type BoardOptions = Options<BoardOption>

export class BoardState {
  readonly mode: EditMode = EditMode.mainMoves
  readonly options: BoardOptions = new Options<BoardOption>()
  readonly mainGame: GameState = new GameState()
  readonly freeBlacks: FreePointsState = new FreePointsState()
  readonly freeWhites: FreePointsState = new FreePointsState()
  readonly markerPoints: FreePointsState = new FreePointsState()
  readonly markerLines: FreeLinesState = new FreeLinesState()
  private cache: Board | undefined

  constructor(init?: undefined | Partial<BoardState>) {
    if (init !== undefined) Object.assign(this, init)
  }

  private update(fields: Partial<BoardState>): BoardState {
    return new BoardState({ ...this, ...fields, cache: undefined })
  }

  /* edit */

  private canEdit(p: Point): boolean {
    switch (this.mode) {
      case EditMode.mainMoves:
        return this.canEditMove(p)
      case EditMode.freeBlacks:
        return this.canEditFreeStone(p) && !this.freeWhites.has(p)
      case EditMode.freeWhites:
        return this.canEditFreeStone(p) && !this.freeBlacks.has(p)
      case EditMode.markerPoints:
        return true
      case EditMode.markerLines:
        return true
      default:
        return false
    }
  }

  private canEditMove(p: Point): boolean {
    const isBlackTurn = this.inverted ? !this.mainGame.isBlackTurn : this.mainGame.isBlackTurn
    return (
      this.mainGame.canMove(p) &&
      !this.freeBlacks.has(p) &&
      !this.freeWhites.has(p) &&
      !(isBlackTurn && this.current.forbidden(p))
    )
  }

  private canEditFreeStone(p: Point): boolean {
    return this.mainGame.isLast && !this.mainGame.isBranching && !this.mainGame.main.has(p)
  }

  edit(p: Point): BoardState {
    if (!this.canEdit(p)) return this
    switch (this.mode) {
      case EditMode.mainMoves:
        return this.update({ mainGame: this.mainGame.move(p) })
      case EditMode.freeBlacks:
        return this.update({ freeBlacks: this.freeBlacks.edit(p) })
      case EditMode.freeWhites:
        return this.update({ freeWhites: this.freeWhites.edit(p) })
      case EditMode.markerPoints:
        return this.update({ markerPoints: this.markerPoints.edit(p) })
      case EditMode.markerLines:
        return this.update({ markerLines: this.markerLines.draw(p) })
      default:
        return this
    }
  }

  /* edit menu */

  setMode(mode: EditMode): BoardState {
    return this.update({
      mode: mode,
      markerLines: mode === EditMode.markerPoints ? this.markerLines : this.markerLines.unstart(),
    })
  }

  setOptions(options: BoardOption[]): BoardState {
    return this.update({ options: new Options<BoardOption>().on(options) })
  }

  setMainGame(mainGame: GameState): BoardState {
    return this.update({ mainGame })
  }

  clearMoves(): BoardState {
    return this.update({
      mainGame: new GameState(),
    })
  }

  clearFreeStones(): BoardState {
    return this.update({
      freeBlacks: new FreePointsState(),
      freeWhites: new FreePointsState(),
    })
  }

  clearMarkers(): BoardState {
    return this.update({
      markerPoints: new FreePointsState(),
      markerLines: new FreeLinesState(),
    })
  }

  /* undo */

  get canUndo(): boolean {
    switch (this.mode) {
      case EditMode.mainMoves:
        return this.mainGame.canUndo
      case EditMode.freeBlacks:
        return this.freeBlacks.canUndo
      case EditMode.freeWhites:
        return this.freeWhites.canUndo
      case EditMode.markerPoints:
        return this.markerPoints.canUndo
      case EditMode.markerLines:
        return this.markerLines.canUndo
      default:
        return false
    }
  }

  undo(): BoardState {
    if (!this.canUndo) return this
    switch (this.mode) {
      case EditMode.mainMoves:
        return this.update({ mainGame: this.mainGame.undo() })
      case EditMode.freeBlacks:
        return this.update({ freeBlacks: this.freeBlacks.undo() })
      case EditMode.freeWhites:
        return this.update({ freeWhites: this.freeWhites.undo() })
      case EditMode.markerPoints:
        return this.update({ markerPoints: this.markerPoints.undo() })
      case EditMode.markerLines:
        return this.update({ markerLines: this.markerLines.undo() })
      default:
        return this
    }
  }

  get canClearRestOfMoves(): boolean {
    return this.mode === EditMode.mainMoves && !this.canUndo && this.mainGame.canClearRest
  }

  get canClearMainGame(): boolean {
    return this.mode === EditMode.mainMoves && !this.canUndo && this.mainGame.isReadOnly
  }

  /* general */

  get current(): Board {
    if (this.cache === undefined) {
      this.cache = new Board({
        size: N_LINES,
        blacks: this.blacks,
        whites: this.whites,
      })
    }
    return this.cache
  }

  get blacks(): Point[] {
    return [
      ...(this.inverted ? this.mainGame.whites : this.mainGame.blacks),
      ...this.freeBlacks.points,
    ]
  }

  get whites(): Point[] {
    return [
      ...(this.inverted ? this.mainGame.blacks : this.mainGame.whites),
      ...this.freeWhites.points,
    ]
  }

  private get inverted(): boolean {
    return this.options.has(BoardOption.invertMoves)
  }

  /* encode */

  encode(): string {
    const codes: string[] = []
    const mainGameCode = this.mainGame.encode()
    if (mainGameCode !== '') codes.push(mainGameCode)
    if (!this.options.empty) codes.push(`o:${encodeBoardOptions(this.options)}`)
    if (!this.freeBlacks.empty) codes.push(`b:${this.freeBlacks.encode()}`)
    if (!this.freeWhites.empty) codes.push(`w:${this.freeWhites.encode()}`)
    if (!this.markerPoints.empty) codes.push(`p:${this.markerPoints.encode()}`)
    if (!this.markerLines.empty) codes.push(`l:${this.markerLines.encode()}`)
    return codes.join(',')
  }

  static decode(code: string): BoardState | undefined {
    const codes = code.split(',')
    const find = (s: string) => codes.find(c => c.startsWith(s))?.replace(s, '') ?? ''
    const optionsCode = find('o:')
    const mainGameCode = `gid:${find('gid:')},g:${find('g:')},c:${find('c:')}`
    const freeBlacksCode = find('b:')
    const freeWhitesCode = find('w:')
    const markerPointsCode = find('p:')
    const markerLinesCode = find('l:')
    return new BoardState({
      mode: EditMode.mainMoves,
      options: decodeBoardOptions(optionsCode) ?? new Options<BoardOption>(),
      mainGame: GameState.decode(mainGameCode) ?? new GameState(),
      freeBlacks: FreePointsState.decode(freeBlacksCode) ?? new FreePointsState(),
      freeWhites: FreePointsState.decode(freeWhitesCode) ?? new FreePointsState(),
      markerPoints: FreePointsState.decode(markerPointsCode) ?? new FreePointsState(),
      markerLines: FreeLinesState.decode(markerLinesCode) ?? new FreeLinesState(),
    })
  }
}

const encodeBoardOptions = (options: BoardOptions): string => {
  return options.values.map(shortName).join('')
}

const decodeBoardOptions = (code: string): BoardOptions => {
  const values = code
    .split('')
    .map(longName)
    .filter(v => v !== undefined) as BoardOption[]
  return new Options<BoardOption>().on(values)
}

const shortName = (o: BoardOption): string | undefined => {
  switch (o) {
    case BoardOption.invertMoves:
      return 'i'
    case BoardOption.labelMarkers:
      return 'l'
  }
}

const longName = (s: string): BoardOption | undefined => {
  switch (s) {
    case 'i':
      return BoardOption.invertMoves
    case 'l':
      return BoardOption.labelMarkers
  }
}
