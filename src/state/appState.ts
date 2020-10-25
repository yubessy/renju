import { Board, equal, Game, N_LINES, Point } from '../rule'
import { FreeLinesState } from './freeLinesState'
import { FreePointsState } from './freePointsState'

export const EditMode = {
  mainMoves: 'mainMoves',
  freeWhites: 'freeWhites',
  freeBlacks: 'freeBlacks',
  markerPoints: 'markerPoints',
  markerLines: 'markerLines',
} as const
export type EditMode = typeof EditMode[keyof typeof EditMode]

export class AppState {
  readonly mode: EditMode
  readonly history: EditMode[]
  readonly game: Game
  readonly cursor: number
  readonly freeBlacks: FreePointsState
  readonly freeWhites: FreePointsState
  readonly markerPoints: FreePointsState
  readonly markerLines: FreeLinesState
  private boardCache: Board | undefined

  constructor (
    init:
      | {}
      | {code: string}
      | Pick<
          AppState,
          | 'mode'
          | 'history'
          | 'game'
          | 'cursor'
          | 'freeBlacks'
          | 'freeWhites'
          | 'markerPoints'
          | 'markerLines'
        >
  ) {
    if ('mode' in init) {
      this.mode = init.mode
      this.history = init.history
      this.game = init.game
      this.cursor = init.cursor
      this.freeBlacks = init.freeBlacks
      this.freeWhites = init.freeWhites
      this.markerPoints = init.markerPoints
      this.markerLines = init.markerLines
    } else if ('code' in init) {
      const codes = init.code.split('/')
      if (codes.length !== 2) throw new Error('invalid code')
      const [gameCode, cursorCode] = codes

      this.mode = EditMode.mainMoves
      this.history = []
      this.game = new Game({ code: gameCode })
      this.cursor = parseInt(cursorCode)
      this.freeBlacks = new FreePointsState({})
      this.freeWhites = new FreePointsState({})
      this.markerPoints = new FreePointsState({})
      this.markerLines = new FreeLinesState({})
    } else {
      this.mode = EditMode.mainMoves
      this.history = []
      this.game = new Game({})
      this.cursor = 0
      this.freeBlacks = new FreePointsState({})
      this.freeWhites = new FreePointsState({})
      this.markerPoints = new FreePointsState({})
      this.markerLines = new FreeLinesState({})
    }
  }

  setMode (mode: EditMode): AppState {
    let next = this.update({ mode: mode })
    if (this.markerLines.start !== 'empty') {
      next = next.update({ markerLines: this.markerLines.undo() }).popHistory()
    }
    return next
  }

  pushHistory (): AppState {
    return this.update({ history: [...this.history, this.mode] })
  }

  popHistory (): AppState {
    return this.update({ history: this.history.slice(0, this.history.length - 1) })
  }

  edit (p: Point): AppState {
    if (!this.canEdit(p)) return this
    let next: AppState | undefined
    switch (this.mode) {
      case EditMode.mainMoves:
        return this.update({ game: this.game.move(p) }).pushHistory().toLast()
      case EditMode.freeBlacks:
        return this.update({ freeBlacks: this.freeBlacks.add(p) }).pushHistory()
      case EditMode.freeWhites:
        return this.update({ freeWhites: this.freeWhites.add(p) }).pushHistory()
      case EditMode.markerPoints:
        return this.update({ markerPoints: this.markerPoints.add(p) }).pushHistory()
      case EditMode.markerLines:
        next = this.update({ markerLines: this.markerLines.draw(p) })
        if (next.markerLines.start !== 'empty') {
          next = next.pushHistory()
        } else if (next.markerLines.lines.length === this.markerLines.lines.length) {
          next = next.popHistory()
        }
        return next
      default:
        return this
    }
  }

  undo (): AppState {
    if (!this.canUndo) return this
    switch (this.lastMode) {
      case EditMode.mainMoves:
        return this.update({ game: this.game.undo() }).popHistory().toLast()
      case EditMode.freeBlacks:
        return this.update({ freeBlacks: this.freeBlacks.undo() }).popHistory()
      case EditMode.freeWhites:
        return this.update({ freeWhites: this.freeWhites.undo() }).popHistory()
      case EditMode.markerPoints:
        return this.update({ markerPoints: this.markerPoints.undo() }).popHistory()
      case EditMode.markerLines:
        return this.update({ markerLines: this.markerLines.undo() }).popHistory()
      default:
        return this
    }
  }

  navigate (i: number): AppState {
    if (i < 0 || this.game.moves.length < i) return this
    return this.update({ cursor: i })
  }

  forward (): AppState {
    return this.navigate(this.cursor + 1)
  }

  backward (): AppState {
    return this.navigate(this.cursor - 1)
  }

  toStart (): AppState {
    return this.navigate(0)
  }

  toLast (): AppState {
    return this.navigate(this.game.moves.length)
  }

  clearFreeStones (): AppState {
    return this.update({
      freeBlacks: new FreePointsState({}),
      freeWhites: new FreePointsState({}),
    })
  }

  clearMarkers (): AppState {
    return this.update({
      markerPoints: new FreePointsState({})
    })
  }

  canEdit (p: Point): boolean {
    switch (this.mode) {
      case EditMode.mainMoves:
        return (
          this.isLast &&
          !this.hasStone(p) &&
          !(this.game.isBlackTurn && this.board.forbidden(p))
        )
      case EditMode.freeBlacks:
        return (this.isLast && !this.hasStone(p))
      case EditMode.freeWhites:
        return (this.isLast && !this.hasStone(p))
      case EditMode.markerPoints:
        return !this.hasStone(p)
      case EditMode.markerLines:
        return true
      default:
        return false
    }
  }

  get canUndo (): boolean {
    switch (this.lastMode) {
      case EditMode.mainMoves:
        return this.isLast && this.game.canUndo
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

  get board (): Board {
    if (this.boardCache === undefined) {
      this.boardCache = new Board({
        size: N_LINES,
        blacks: this.blacks,
        whites: this.whites,
      })
    }
    return this.boardCache
  }

  get moves (): Point[] {
    return this.partial.moves
  }

  get blacks (): Point[] {
    return [...this.partial.blacks, ...this.freeBlacks.points]
  }

  get whites (): Point[] {
    return [...this.partial.whites, ...this.freeWhites.points]
  }

  get partial (): Game {
    return this.game.fork(this.cursor)
  }

  get isStart (): boolean {
    return this.cursor === 0
  }

  get isLast (): boolean {
    return this.cursor === this.game.moves.length
  }

  get code (): string {
    return `${this.game.code}/${this.cursor}`
  }

  private update (
    fields:
      Partial<
        Pick<
          AppState,
          'mode' | 'history' | 'game' | 'cursor' | 'freeBlacks' | 'freeWhites' | 'markerPoints' | 'markerLines'
        >
      >
  ): AppState {
    return new AppState({
      mode: fields.mode ?? this.mode,
      history: fields.history ?? this.history,
      game: fields.game ?? this.game,
      cursor: fields.cursor ?? this.cursor,
      freeBlacks: fields.freeBlacks ?? this.freeBlacks,
      freeWhites: fields.freeWhites ?? this.freeWhites,
      markerPoints: fields.markerPoints ?? this.markerPoints,
      markerLines: fields.markerLines ?? this.markerLines,
    })
  }

  private hasStone (p: Point): boolean {
    return [...this.blacks, ...this.whites].findIndex(q => equal(p, q)) >= 0
  }

  private get lastMode (): EditMode | undefined {
    return this.history[this.history.length - 1]
  }
}
