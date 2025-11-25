import React, { useEffect, useState } from 'react'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Game from './pages/Game'
import Leaderboard from './pages/Leaderboard'
import { loadState } from './utils/storage'
import type { GameState } from './types'

export default function App() {
  const [route, setRoute] = useState<'home'|'game'|'leaderboard'>('home')
  const [currentGame, setCurrentGame] = useState<GameState | null>(() => loadState('currentGame'))

  useEffect(() => {
    function handleHash() {
      const hash = location.hash.replace('#','') || 'home'
      if (hash === 'home' || hash === 'game' || hash === 'leaderboard') setRoute(hash)
    }
    window.addEventListener('hashchange', handleHash)
    handleHash()
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  return (
    <div className="app-root">
      <NavBar inGame={!!currentGame} />
      <main className="container">
        {route === 'home' && <Home startGame={(g)=>{ setCurrentGame(g); location.hash='game'}} />}
        {route === 'game' && <Game game={currentGame} setGame={setCurrentGame} />}
        {route === 'leaderboard' && <Leaderboard />}
      </main>
      <Footer />
    </div>
  )
}
