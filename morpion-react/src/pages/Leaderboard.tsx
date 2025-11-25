import React from 'react'
import { loadState } from '../utils/storage'

export default function Leaderboard() {

  const history = loadState<any[]>('history') || []

  // Construction du tableau des scores
  const scores: Record<string, number> = {}
  history.forEach(game => {
  if (game.winner === null) return; // draw → ignore

  let winnerName = "";

  if (game.mode === "pve") {
    // Human symbol
    const humanSymbol = game.Symbol || "X"; // or store humanSymbol in game.players
    if (game.winner === humanSymbol) {
      winnerName = game.players.human || "Joueur";
    } else {
      winnerName = "Ordinateur";
    }
  } else {
    // PvP
    winnerName = game.winner === "X"
      ? game.players.p1 || "Joueur 1"
      : game.players.p2 || "Joueur 2";
  }

  scores[winnerName] = (scores[winnerName] || 0) + 1;
  })

  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])

  return (
    <section className="leaderboard card">
      <h2>Classement</h2>

      {sorted.length === 0 && (
        <p>Aucun résultat pour le moment</p>
      )}

      <ul>
        {sorted.map(([name, wins], i) => (
          <li key={i}>
            {name} — {wins} victoire{wins > 1 ? 's' : ''}
          </li>
        ))}
      </ul>
      
      <h3>Historique des parties joués </h3>
      <ul>
        {history.map((h, i) => (
          <li key={i}>
            
            {h.players.p1 || h.players.human} vs {h.mode === "pve" ? "Ordinateur" : h.players.p2}  
            → Gagnant : {h.winner ?? "Match nul"}  
            <em> ({new Date(h.date).toLocaleString()})</em>
          </li>
        ))}
      </ul>
    </section>
  )
}
