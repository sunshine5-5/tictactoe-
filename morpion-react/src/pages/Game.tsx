import React, { useEffect, useState } from 'react'
import Cell from '../components/Cell'
import { saveState, loadState } from '../utils/storage'
import type { GameState, CellValue } from '../types'

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
] as const

function checkWinner(board: CellValue[]) {
  for (const line of WIN_LINES) {
    const [a,b,c] = line
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line }
    }
  }
  if (board.every(Boolean)) return { winner: null }
  return null
}

function cpuMove(board: CellValue[]) {
  const empty = board.map((v,i)=> v ? null : i).filter((v): v is number => v !== null)
  if (!empty.length) return null
  return empty[Math.floor(Math.random() * empty.length)]
}

export default function Game({ game, setGame }: { game: GameState | null; setGame: (g: GameState | null) => void }) {

  const [state, setState] = useState<GameState>(() =>
    game || (loadState('currentGame') as GameState)
  )

  const isVariant = state.variant === 'variant'

  const [result, setResult] = useState<null | { winner: 'X'|'O'|null; line?: number[] }>(null)

  useEffect(() => {
    saveState('currentGame', state)
  }, [state])

  // Vérifier victoire
  useEffect(() => {
    const res = checkWinner(state.board)
    if (res) {

      // Historique
      const history = loadState<any[]>('history') || []
      history.push({
        id: state.id,
        mode: state.mode,
        variant: state.variant,
        players: state.players,
        winner: res.winner,
        date: new Date().toISOString()
      })
      saveState('history', history)

      setResult(res)
    }
  }, [state.board])

  // --- LOGIQUE VARIANT : 3 COUPS MAX ---
  function applyVariant(board: CellValue[], player: 'X' | 'O', pos: number) {
    const moves = state.lastMoves || { X: [], O: [] }

    moves[player].push(pos)

    if (moves[player].length > 3) {
      const old = moves[player].shift()!
      board[old] = null
    }

    return moves
  }

  function playAt(i: number) {
    if (state.board[i] || result) return

    const next = [...state.board]
    next[i] = state.turn

    let updatedMoves = state.lastMoves

    if (isVariant) {
      updatedMoves = applyVariant(next, state.turn, i)
    }

    const nextTurn = state.turn === 'X' ? 'O' : 'X'

    const newState = {
      ...state,
      board: next,
      turn: nextTurn,
      lastMoves: updatedMoves
    }

    setState(newState)

    // --- CPU ---
    if (state.mode === 'pve' && nextTurn === 'O') {
      setTimeout(() => {
        const pos = cpuMove(newState.board)
        if (pos !== null) {

          const board2 = [...newState.board]
          board2[pos] = 'O'

          let cpuMoves = newState.lastMoves

          if (isVariant) {
            cpuMoves = applyVariant(board2, 'O', pos)
          }

          setState(prev => ({
            ...prev,
            board: board2,
            lastMoves: cpuMoves,
            turn: 'X'
          }))
        }
      }, 350)
    }
  }
  // --- FIN VARIANT ---

  function abandon() {
    setGame(null)
    saveState('currentGame', null)
    location.hash = 'home'
  }

  function reset() {
    setState({
      ...state,
      board: Array(9).fill(null),
      lastMoves: { X: [], O: [] },
      turn: 'X',
      status: 'playing'
    })
    setResult(null)
  }

  return (
    <section className="game card">

      {/* HEADER */}
      <div className="game-header">
        <div className="game-actions">
          <img src="/src/assets/logo_xo.png" alt="logo" />

          <div className="turn-indicator-small">
            <strong>{state.turn}</strong>
            <span>Turn</span>
          </div>

          <button className="btn-secondary" onClick={reset}>
            <img src="/src/assets/reset.svg" className="rest-icon" />
          </button>
        </div>
      </div>

      {/* BOARD */}
      <div className="board" role="grid">
        {state.board.map((v, i) => {

          const willDisappear =
            state.lastMoves &&
            (
              (state.lastMoves.X.length === 3 && i === state.lastMoves.X[0]) ||
              (state.lastMoves.O.length === 3 && i === state.lastMoves.O[0])
            )

          return (
            <Cell
              key={i}
              value={v}
              onClick={() => playAt(i)}
              className={willDisappear ? "to-disappear" : ""}
              highlight={!!(result?.line?.includes(i))}
            />
          )
        })}
      </div>

      {/* SCORE */}
      <div className="score-grid">
        <div className="score-box score-x">
          <div>{state.turn === "X" ? "YOU" : "X"}</div>
          <div>0</div>
        </div>

        <div className="score-box score-ties">
          <div>TIES</div>
          <div>0</div>
        </div>

        <div className="score-box score-o">
          <div>{state.turn === "O" ? "YOU" : "O"}</div>
          <div>0</div>
        </div>
      </div>

      {result && (
        <div className="result">
          {result.winner ? (
            <p>Vainqueur: {result.winner}</p>
          ) : (
            <p>Match nul</p>
          )}
        </div>
      )}
    </section>
  )
}
