import React, { useState } from 'react'
import { saveState } from '../utils/storage'
import type { GameState } from '../types'

export default function Home({ startGame }: { startGame: (g: GameState) => void }) {
  const [mode, setMode] = useState<'pve'|'pvp'>('pve')
  const [name1, setName1] = useState('')
  const [name2, setName2] = useState('')
  const [variant, setVariant] = useState<'classic' | 'variant'>('classic')


  function handleStart() {
    const game: GameState = {
      id: Date.now(),
      mode,
      variant,
      players: mode === 'pve' ? { human: name1 || 'Joueur'  } : { p1: name1 || 'Joueur 1', p2: name2 || 'Joueur 2' },
      board: Array(9).fill(null),
      lastMoves: { X: [], O: [] }, 
      startingSymbol: symbol,
      turn: symbol,
      status: 'playing'
    }
    saveState('currentGame', game)
    startGame(game)
  }
const [symbol, setSymbol] = useState<'X' | 'O'>('X')

  return (
    
    <section className="home">
      <div className="choose-variant">
        <div className="variant-select">
  <h2>Choisir le type de jeu</h2>

  <label className={`mode ${variant === 'classic' ? 'active' : ''}`}>
    <input
      type="radio"
      name="variant"
      checked={variant === 'classic'}
      onChange={() => setVariant('classic')}
    />
    Classique
  </label>

  <label className={`mode ${variant === 'variant' ? 'active' : ''}`}>
    <input
      type="radio"
      name="variant"
      checked={variant === 'variant'}
      onChange={() => setVariant('variant')}
    />
    Variante — 3 coups max
  </label>
</div>

</div>

      <div className="choose-symbol">
        <h2>Choisir votre symbole :</h2>
        <div className="symbols">
          <label className="symbol-option">
            <input
            type="radio"
            name="symbol"
  value="X"
  defaultChecked
  onChange={() => setSymbol('X')}
/>
            <img src="/src/assets/x.svg" alt="X" />

          </label>
          <label className="symbol-option">
         <input
         type="radio"
         name="symbol"
         value="O"
         onChange={() => setSymbol('O')}
/>
          <img src="/src/assets/o.svg" alt="O" />
          </label>
          </div>
      </div>

      <h2>Choisir un mode</h2>
      <div className="modes">
        <label className={`mode ${mode === 'pve' ? 'active' : ''}`}>
          <input type="radio" name="mode" checked={mode === 'pve'} onChange={() => setMode('pve')} />
          Jouer contre l'ordinateur
        </label>
        <label className={`mode ${mode === 'pvp' ? 'active' : ''}`}>
          <input type="radio" name="mode" checked={mode === 'pvp'} onChange={() => setMode('pvp')} />
          Jouer contre un  joueur local
        </label>
      </div>
      <br />
      <div className="form">
        <label> Joueur1 :
          <input value={name1} onChange={e => setName1(e.target.value)} placeholder={mode === 'pve' ? 'votre pseudo' : ''} />
        </label>
        {mode === 'pvp' && (
          <label> Joueur2 :
            <input value={name2} onChange={e => setName2(e.target.value)} placeholder="Joueur2" />
          </label>
        )}
        <br />
        <div className="actions">
          
          <button className="btn-primary" onClick={handleStart}>
            Démarrer
            </button>
        </div>
      </div>
    </section>
  )
}
