import React from 'react'

export default function NavBar({ inGame }: { inGame: boolean }) {
  return (
    <header className="nav">
      <div className="nav-inner container">

        <div className="logo-wrap" onClick={() => (location.hash = 'home')}>
          <img src="/src/assets/logo_xo.png" alt="logo" className="logo-icon" />
          <h1 className="logo">Tic Tac Toe </h1>
        </div>

        <nav>
          <button onClick={() => (location.hash = 'home')} className="btn-link">Accueil</button>
          <button onClick={() => (location.hash = 'leaderboard')} className="btn-link">Classement</button>
          {inGame && <button onClick={() => (location.hash = 'game')} className="btn-link">Jeu en cours</button>}
        </nav>

      </div>
    </header>
  )
}
