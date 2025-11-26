import React from 'react'
import { loadState } from '../utils/storage'

export default function Leaderboard() {

  const history = loadState<any[]>('history') || []

  const scores: Record<string, number> = {}
  const drawPairs: Record<string, number> = {} // 🔵 Compteur match nuls par paire

  history.forEach(game => {

    const p1 = game.players.p1 || game.players.human || "Joueur 1"
    const p2 = game.mode === "pve" ? "Ordinateur" : game.players.p2 || "Joueur 2"

    // clé unique pour la paire (ordre garanti)
    const key = [p1, p2].sort().join(" vs ")

    // MATCH NUL → incrémenter le compteur
    if (game.winner === null) {
      drawPairs[key] = (drawPairs[key] || 0) + 1
      return
    }

    // Victoires
    let winnerName = ""

    if (game.mode === "pve") {
      const humanSymbol = game.startingSymbol ?? "X"
      winnerName = game.winner === humanSymbol ? p1 : "Ordinateur"
    } else {
      winnerName = game.winner === "X" ? p1 : p2
    }

    scores[winnerName] = (scores[winnerName] || 0) + 1
  })

  // classement des joueurs
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])

  // classement des matchs nuls
  const sortedDraws = Object.entries(drawPairs)
    .sort((a, b) => b[1] - a[1])

  return (
    <section className="leaderboard card">
      <h2>Classement</h2>

      {sorted.length === 0 && sortedDraws.length === 0 && (
        <p>Aucun résultat pour le moment</p>
      )}

      <ul>
        {/* 🟨 Scores */}
        {sorted.map(([name, wins], i) => (
          <li key={i}>
            {name} — {wins} victoire{wins > 1 ? "s" : ""}
          </li>
        ))}

        {/* 🟦 Matchs nuls groupés */}
        {sortedDraws.length > 0 && (
          <>
            <h2>Matchs nuls</h2>
            {sortedDraws.map(([pair, count], i) => (
              <li key={"tie-" + i}>
                {pair} → <strong>{count} match{count > 1 ? "s" : ""} nul{count > 1 ? "s" : ""}</strong>
              </li>
            ))}
          </>
        )}
      </ul>

      <h3>Historique des parties jouées</h3>

      <ul>
        {history.map((h, i) => {
          const p1 = h.players.p1 || h.players.human || "Joueur 1"
          const p2 = h.mode === "pve" ? "Ordinateur" : h.players.p2 || "Joueur 2"

          return (
            <li key={i}>
              {p1} vs {p2} →
              <strong>
                {h.winner === null  
                  ? " Match nul"
                  : ` Gagnant : ${h.winner === "X" ? p1 : p2}`
                }
              </strong>
              <em> ({new Date(h.date).toLocaleString()})</em>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
