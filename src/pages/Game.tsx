import React, { useEffect, useState } from "react";
import Cell from "../components/Cell";
import { saveState, loadState } from "../utils/storage";
import type { GameState, CellValue } from "../types";

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
] as const;

function checkWinner(board: CellValue[]) {
  for (const [a,b,c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a,b,c] };
    }
  }
  if (board.every(Boolean)) return { winner: null };
  return null;
}

function cpuMove(board: CellValue[]) {
  const empty = board
    .map((v,i)=> v ? null : i)
    .filter((v): v is number => v !== null);
  if (!empty.length) return null;
  return empty[Math.floor(Math.random()*empty.length)];
}

export default function Game({ game, setGame }: { game: GameState|null; setGame: (g: GameState|null)=>void }) {

  const [state, setState] = useState<GameState>(() =>
    game || (loadState("currentGame") as GameState)
  );

  const isVariant = state.variant === "variant";
  const [result, setResult] = useState<null | {winner:'X'|'O'|null; line?:number[] }>(null);
  const [score, setScore] = useState({ wins: 0, losses: 0, draws: 0 });

  // ----------------------------------------------------
  // ⭐ CORRECT PLAYER NAME
  // ----------------------------------------------------
  const playerName =
    state.mode === "pve"
      ? state.players.human
      : state.players.p1;

  // ----------------------------------------------------
  // ⭐ FIXED SCOREBOARD LOGIC
  // ----------------------------------------------------
  useEffect(() => {
    const history = loadState<any[]>("history") || [];
    let wins = 0, losses = 0, draws = 0;

    history.forEach(h => {

      // ---- PVE MODE ----
      if (state.mode === "pve") {
        if (h.players.human !== playerName) return;

        const humanSymbol = h.startingSymbol ?? "X";

        if (h.winner === humanSymbol) wins++;
        else if (h.winner === null) draws++;
        else losses++;
      }

      // ---- PVP MODE ----
      else {
        const p1 = h.players.p1;
        const p2 = h.players.p2;

        if (p1 !== playerName && p2 !== playerName) return;

        // Draw
        if (h.winner === null) { draws++; return; }

        // Player was X
        if (p1 === playerName && h.winner === "X") wins++;
        else if (p1 === playerName && h.winner !== "X") losses++;

        // Player was O
        if (p2 === playerName && h.winner === "O") wins++;
        else if (p2 === playerName && h.winner !== "O") losses++;
      }
    });

    setScore({ wins, losses, draws });
  }, [state.board, result]);

  // SAVE CURRENT GAME
  useEffect(() => saveState("currentGame", state), [state]);

  // ----------------------------------------------
  // WINNER CHECK + SAVE HISTORY
  // ----------------------------------------------
  useEffect(() => {
    const r = checkWinner(state.board);
    if (r && !result) {
      const history = loadState<any[]>("history") || [];
      history.push({
        id: state.id,
        mode: state.mode,
        variant: state.variant,
        players: state.players,
        winner: r.winner,
        Symbol: state.startingSymbol,
        startingSymbol: state.startingSymbol,
        date: new Date().toISOString(),
      });
      saveState("history", history);
      setResult(r);
    }
  }, [state.board, result]);

  // ----------------------------------------------
  // VARIANT RULE
  // ----------------------------------------------
  function applyVariant(board:CellValue[], player:'X'|'O', pos:number) {
    const moves = state.lastMoves || { X:[], O:[] };
    moves[player].push(pos);

    if (moves[player].length > 3) {
      const old = moves[player].shift()!;
      board[old] = null;
    }
    return moves;
  }

  // ----------------------------------------------
  // PLAY MOVE
  // ----------------------------------------------
  function playAt(index:number) {
    if (state.board[index] || result) return;

    const newBoard = [...state.board];
    newBoard[index] = state.turn;

    let updatedMoves = state.lastMoves;
    if (isVariant) updatedMoves = applyVariant(newBoard, state.turn, index);

    const nextTurn = state.turn === "X" ? "O" : "X";

    const updatedState: GameState = {
      ...state,
      board: newBoard,
      turn: nextTurn,
      lastMoves: updatedMoves
    };

    setState(updatedState);

    // CPU
    if (state.mode === "pve" && nextTurn === state.startingSymbol) return;

    if (state.mode === "pve" && nextTurn !== state.startingSymbol) {
      setTimeout(() => {
        const pos = cpuMove(updatedState.board);
        if (pos !== null) {
          const cpuBoard = [...updatedState.board];
          cpuBoard[pos] = nextTurn;

          let cpuMoves = updatedState.lastMoves;
          if (isVariant) cpuMoves = applyVariant(cpuBoard, nextTurn, pos);

          setState(prev => ({
            ...prev,
            board: cpuBoard,
            lastMoves: cpuMoves,
            turn: prev.startingSymbol
          }));
        }
      }, 350);
    }
  }

  // ----------------------------------------------
  // EXIT + RESET
  // ----------------------------------------------
  function abandon() {
    setGame(null);
    saveState("currentGame", null);
    location.hash = "home";
  }

  function reset() {
    setState({
      ...state,
      board: Array(9).fill(null),
      lastMoves: { X:[], O:[] },
      turn: state.startingSymbol,
      status: 'playing'
    });
    setResult(null);
  }

  // ----------------------------------------------
  // RENDER UI
  // ----------------------------------------------
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

      <div className="game-content">

        {/* BOARD */}
        <div className="board">
          {state.board.map((v, i) => {
            const willDisappear =
              state.lastMoves &&
              (
                (state.lastMoves.X.length === 3 && i === state.lastMoves.X[0]) ||
                (state.lastMoves.O.length === 3 && i === state.lastMoves.O[0])
              );

            return (
              <Cell
                key={i}
                value={v}
                onClick={() => playAt(i)}
                className={willDisappear ? "to-disappear" : ""}
                highlight={!!result?.line?.includes(i)}
              />
            );
          })}
        </div>

        {/* SCOREBOARD */}
        <div className="scoreboard">
          <p>{playerName}</p>
          <p>Wins: <span>{score.wins}</span></p>
          <p>Losses: <span>{score.losses}</span></p>
          <p>Draws: <span>{score.draws}</span></p>
        </div>
      </div>

      {/* POPUP */}
        {result && (
 <div className="game-popup">
  <div className="popup-content">
    

    {result.winner ? (
  <>
    <h3>Le gagnant est :</h3>
    <img 
      src={`/src/assets/${result.winner.toLowerCase()}.svg`} 
      alt={result.winner} 
      style={{ width: '50px', height: '50px' }} // ajuste la taille si nécessaire
    />
  </>
) : (
  <span style={{ fontWeight: '700', fontSize: '1.2rem' }}>Match nul</span>
)}

    <div className="popup-buttons">
      <button className="btn-leave" onClick={abandon}>accueil</button>
      <button className="btn-restart" onClick={reset}>relancer</button>
    </div>
  </div>
</div>

)}



    </section>
  );
}
