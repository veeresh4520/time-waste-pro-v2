import { useState, useEffect, useRef } from 'react'
import './DumbGame.css'

// ── copy arrays ────────────────────────────────────────
const MOTIVATIONS = [
  "DON'T YOU DARE LET GO",
  "YOUR ANCESTORS ARE WATCHING",
  "THIS IS YOUR PURPOSE",
  "BREATHE. HOLD. WIN.",
  "SCIENCE DEPENDS ON YOU",
  "YOU'VE TRAINED FOR THIS",
  "THE BUTTON BELIEVES IN YOU",
  "LET GO AND YOU'RE A QUITTER",
  "HISTORY IS BEING MADE",
  "FEEL THE POWER",
]

const INSULTS = [
  "PATHETIC. TRULY PATHETIC.",
  "WOW. JUST... WOW.",
  "MY GRANDMA HOLDS LONGER. SHE'S DEAD.",
  "AVERAGE GOLDFISH: 9 SECONDS. YOU LOSE.",
  "THE BUTTON IS DISAPPOINTED.",
  "ERROR 404: WILLPOWER NOT FOUND.",
  "YOU HAVE BROUGHT SHAME TO YOUR FAMILY.",
  "IMPRESSIVE... WAIT, NO. THE OPPOSITE.",
  "THE WORLD RECORD IS SAFE. FROM YOU.",
  "THAT WAS EMBARRASSING FOR BOTH OF US.",
]

const WARNINGS = [
  "⚠ WARNING: FINGER INSTABILITY DETECTED",
  "⚠ CRITICAL: RESOLVE LEVELS DROPPING",
  "⚠ ALERT: BUTTON LOSING FAITH IN USER",
  "⚠ ERROR: COMMITMENT MODULE NOT FOUND",
  "⚠ WARNING: QUITTING TENDENCY RISING",
  "⚠ ALERT: YOU LOOK TIRED. DON'T.",
  "⚠ SYSTEM: LOSER DETECTOR ACTIVATED",
]

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function DumbGame() {
  const [holding,    setHolding]    = useState(false)
  const [elapsed,    setElapsed]    = useState(0)       // ms
  const [insult,     setInsult]     = useState(null)    // shown on release
  const [motivation, setMotivation] = useState('')
  const [popup,      setPopup]      = useState(null)    // { text, x, y }

  const intervalRef   = useRef(null)
  const motivationRef = useRef(null)
  const popupRef      = useRef(null)
  const startRef      = useRef(null)

  // ── start holding ─────────────────────────────────
  function handleDown() {
    setHolding(true)
    setInsult(null)
    startRef.current = Date.now() - elapsed  // resume from where we left off

    // tick every 50ms
    intervalRef.current = setInterval(() => {
      setElapsed(Date.now() - startRef.current)
    }, 50)

    // cycle motivational text every 1.5s
    setMotivation(randomFrom(MOTIVATIONS))
    motivationRef.current = setInterval(() => {
      setMotivation(randomFrom(MOTIVATIONS))
    }, 1500)

    // random popups every 2-4s
    popupRef.current = setInterval(() => {
      setPopup({
        text: randomFrom(WARNINGS),
        x: 10 + Math.random() * 60,    // percent from left
        y: 10 + Math.random() * 70,    // percent from top
      })
      setTimeout(() => setPopup(null), 1800)
    }, 2000 + Math.random() * 2000)
  }

  // ── release ────────────────────────────────────────
  function handleUp() {
    if (!holding) return
    setHolding(false)
    clearInterval(intervalRef.current)
    clearInterval(motivationRef.current)
    clearInterval(popupRef.current)
    setPopup(null)
    setMotivation('')
    setInsult(randomFrom(INSULTS))
    setElapsed(0)
  }

  // clean up on unmount
  useEffect(() => () => {
    clearInterval(intervalRef.current)
    clearInterval(motivationRef.current)
    clearInterval(popupRef.current)
  }, [])

  // format ms → "ss.ms"
  const seconds = (elapsed / 1000).toFixed(2)
  const isHot   = elapsed > 5000

  return (
    <div
      className="dumb-root"
      onMouseUp={handleUp}
      onTouchEnd={handleUp}
    >
      <p className="dumb-title">World's Dumbest Game</p>
      <h2>World Record is 40 hours</h2>
      {/* timer */}
      <div className={`dumb-timer ${isHot ? 'hot' : ''}`}>
        {seconds}s
      </div>

      {/* main button */}
      <button
        className={`dumb-btn ${holding ? 'holding' : 'idle'}`}
        onMouseDown={handleDown}
        onTouchStart={handleDown}
      >
        {holding ? 'HOLDING' : 'HOLD ME'}
      </button>

      {/* motivational text */}
      <p className="dumb-motivate">{motivation}</p>

      {/* floating warning popup */}
      {popup && (
        <div
          className="dumb-popup"
          style={{ left: `${popup.x}%`, top: `${popup.y}%` }}
        >
          {popup.text}
        </div>
      )}

      {/* insult overlay on release */}
      {insult && (
        <div className="dumb-insult" onClick={() => setInsult(null)}>
          <p>{insult}</p>
          <small>TAP TO TRY AGAIN (you won't do better)</small>
        </div>
      )}
    </div>
  )
}
