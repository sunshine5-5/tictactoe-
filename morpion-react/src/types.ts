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
  variant: 'classic' | 'variant'
  players: Players
  board: CellValue[]
  turn: 'X' | 'O'
  status: 'playing' | 'finished'
  lastMoves?: {
    X: number[]
    O: number[]
  }
}
