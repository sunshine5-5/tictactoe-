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
  if (board.every(Boolean)) return { winner: null }; // draw
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

  // --------- SCORE FILTERED BY PLAYER NAME ---------
  const playerName = state.mode === "pve" ? state.players.human || "Human" : state.players.p1 || "Player 1";

  useEffect(() => {
    const history = loadState<any[]>("history") || [];
    let wins = 0, losses = 0, draws = 0;

    history.forEach(h => {
      if (state.mode === "pve") {
        const humanSymbol = h.startingSymbol ?? "X";
        if (h.players.human !== playerName) return; // skip other humans
        if (h.winner === humanSymbol) wins++;
        else if (h.winner === null) draws++;
        else losses++;
      } else { // pvp
        const p1 = h.players.p1 || "Player 1";
        const p2 = h.players.p2 || "Player 2";
        if (p1 !== playerName && p2 !== playerName) return; // skip games not involving this player
        if (h.winner === null) draws++;
        else if (h.winner === "X" && p1 === playerName) wins++;
        else if (h.winner === "O" && p2 === playerName) wins++;
        else losses++;
      }
    });

    setScore({ wins, losses, draws });
  }, [state.board, result]);

  // Save current game state
  useEffect(() => saveState("currentGame", state), [state]);

  // Check winner
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

  // Variant rule
  function applyVariant(board:CellValue[], player:'X'|'O', pos:number) {
    const moves = state.lastMoves || { X:[], O:[] };
    moves[player].push(pos);

    if (moves[player].length > 3) {
      const old = moves[player].shift()!;
      board[old] = null;
    }
    return moves;
  }

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

    // CPU logic
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

    // CPU first move if human picked "O"
    if (state.mode === "pve" && state.startingSymbol === "O") {
      setTimeout(() => {
        const pos = cpuMove(Array(9).fill(null));
        if (pos !== null) {
          const newBoard = Array(9).fill(null);
          newBoard[pos] = "X";
          setState(prev => ({
            ...prev,
            board: newBoard,
            turn: "O"
          }));
        }
      }, 250);
    }
  }

  // FIRST RENDER: CPU plays if human is "O"
  useEffect(() => {
    if (state.mode === "pve" && state.startingSymbol === "O" && state.board.every(v => v === null)) {
      setTimeout(() => {
        const pos = cpuMove(state.board);
        if (pos !== null) {
          const board = [...state.board];
          board[pos] = "X";
          setState(prev => ({
            ...prev,
            board,
            turn: "O"
          }));
        }
      }, 300);
    }
  }, []);

  return (
    <section className="game card">
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

        {/* SCOREBOARD FILTERED BY PLAYER NAME */}
       

      </div>

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


      
       <div className="scoreboard">
  <p>Wins: <span>{score.wins}</span></p>
  <p>Losses: <span>{score.losses}</span></p>
  <p>Draws: <span>{score.draws}</span></p>
</div>
    </section>
  );
}
