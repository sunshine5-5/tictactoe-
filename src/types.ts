export type CellValue = 'X' | 'O' | null

export type Mode = 'pve' | 'pvp'

export interface Players {
  // pve: human name is players.human
  human?: string
  // pvp:
  p1?: string
  p2?: string
}

export interface GameState {
  id: number
  mode: Mode

  // 🔥 Added - needed for variant mode
  variant: 'classic' | 'variant'

  players: Players
  board: CellValue[]

  // 🔥 Added - player chooses X or O in Home screen
  startingSymbol: 'X' | 'O'

  turn: 'X' | 'O'
  status: 'playing' | 'finished'

  // 🔥 Added - needed for Variante (3 coups max)
  lastMoves?: {
    X: number[]
    O: number[]
  }
}