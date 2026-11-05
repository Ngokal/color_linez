import { useEffect, useState } from "react";
import { Ball } from "./components/Ball";
import { Icon } from "./components/Icon";
import { Modal } from "./components/Modal";
import { GameBoard } from "./components/GameBoard";
import { useGame } from "./hooks/useGame";
import { useAudio } from "./hooks/useAudio";
import {
  readStored,
  usePreferences,
  writeStored,
} from "./hooks/usePreferences";
export default function App() {
  const { preferences, setPreferences, animate, reduced } = usePreferences();
  const play = useAudio(preferences.sound);
  const state = useGame(animate, play),
    { game } = state;
  const [best, setBest] = useState(() =>
    readStored<number>(
      "linez.best",
      0,
      (v): v is number => typeof v === "number" && Number.isFinite(v) && v >= 0,
    ),
  );
  const [modal, setModal] = useState<
    "settings" | "help" | "new" | "over" | null
  >(null);
  useEffect(() => {
    if (game.score > best) {
      setBest(game.score);
      writeStored("linez.best", game.score);
    }
  }, [game.score, best]);
  useEffect(() => {
    if (game.over) setModal("over");
  }, [game.over]);
  const restart = () => {
    state.restart();
    setModal(null);
  };
  const changeSound = () => setPreferences((p) => ({ ...p, sound: !p.sound }));
  const empty = game.board.filter((c) => !c).length;
  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="./" aria-label="Color Linez home">
          <span className="brand-symbol">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span>
            COLOR <b>LINEZ</b>
            <span className="brand-dot">.</span>
          </span>
        </a>
        <span className="header-note">A LITTLE FOCUS. A LOT OF COLOR.</span>
        <button className="how-button" onClick={() => setModal("help")}>
          <Icon name="help" />
          <span>How to play</span>
        </button>
      </header>
      <main>
        <section className="intro">
          <div className="eyebrow">
            <span /> THE CLASSIC, REIMAGINED
          </div>
          <h1>
            Find your <em>flow.</em>
          </h1>
          <p>Make a little space. Bring colors together.</p>
        </section>
        <div className="game-layout">
          <section className="play-area" aria-label="Color Linez game">
            <div className="board-topline">
              <span>
                <span className="live-dot" />{" "}
                {game.over ? "GAME COMPLETE" : "CLASSIC 9 × 9"}
              </span>
              <span>5 in a line. Endless possibilities.</span>
            </div>
            <GameBoard
              {...state}
              over={game.over}
              onSelect={(cell) => {
                void state.select(cell);
              }}
            />
            <div
              className={`game-status ${state.gain ? "celebration" : ""}`}
              role="status"
            >
              <span className="status-spark">{state.gain ? "✦" : "✧"}</span>
              {state.notice}
            </div>
            <div className="board-footer">
              <span>
                <kbd>↑</kbd>
                <kbd>↓</kbd>
                <kbd>←</kbd>
                <kbd>→</kbd> to explore{" "}
                <span className="keyboard-hint">
                  · <kbd>enter</kbd> to select
                </span>
              </span>
              <span>Take your time.</span>
            </div>
          </section>
          <aside className="sidebar">
            <section className="score-card">
              <div className="label">
                YOUR SCORE <span className="tiny-spark">✦</span>
              </div>
              <div className="score-number" key={game.score}>
                {String(game.score).padStart(2, "0")}
                {state.gain > 0 && (
                  <span className="score-gain" key={game.moves}>
                    +{state.gain}
                  </span>
                )}
              </div>
              <div className="score-details">
                <div>
                  <span>
                    <Icon name="trophy" /> PERSONAL BEST
                  </span>
                  <strong>{String(best).padStart(2, "0")}</strong>
                </div>
                <div>
                  <span>MOVES</span>
                  <strong>{String(game.moves).padStart(2, "0")}</strong>
                </div>
              </div>
            </section>
            <section className="next-card">
              <div className="label">
                UP NEXT <span>+3</span>
              </div>
              <div className="next-balls" aria-label="Next balls">
                {game.next.map((color, i) => (
                  <span
                    key={`${i}-${color}`}
                    className="preview-slot"
                    aria-label={color}
                  >
                    <Ball color={color} />
                  </span>
                ))}
              </div>
              <p>
                A line clears space.
                <br />
                Every other move brings three.
              </p>
            </section>
            <div className="controls">
              <button
                className="primary-button"
                disabled={state.busy}
                onClick={() =>
                  game.moves > 0 && !game.over ? setModal("new") : restart()
                }
              >
                <Icon name="plus" /> New game <Icon name="arrow" />
              </button>
              <button
                className="undo-button"
                disabled={!game.previous || state.busy}
                onClick={state.goBack}
              >
                <Icon name="undo" /> Undo move <span>1 STEP</span>
              </button>
              <div className="utility-controls">
                <button
                  onClick={changeSound}
                  aria-label={preferences.sound ? "Mute sound" : "Enable sound"}
                  aria-pressed={preferences.sound}
                >
                  <Icon name={preferences.sound ? "sound" : "muted"} />
                  <span>Sound {preferences.sound ? "on" : "off"}</span>
                </button>
                <button onClick={() => setModal("settings")}>
                  <Icon name="settings" />
                  Settings
                </button>
              </div>
            </div>
            <div className="space-meter">
              <div>
                <span>ROOM TO PLAY</span>
                <span>
                  {empty}
                  <small> / 81</small>
                </span>
              </div>
              <div className="meter-track">
                <span style={{ width: `${(empty / 81) * 100}%` }} />
              </div>
            </div>
          </aside>
        </div>
        <section className="rule-strip" aria-label="Quick rules">
          <div>
            <span className="rule-number">01</span>
            <p>
              <strong>Pick a color</strong>
              <span>Select any ball on the board.</span>
            </p>
          </div>
          <div>
            <span className="rule-number">02</span>
            <p>
              <strong>Find a path</strong>
              <span>Move through open spaces.</span>
            </p>
          </div>
          <div>
            <span className="rule-number">03</span>
            <p>
              <strong>Make a line</strong>
              <span>Connect 5 or more to clear.</span>
            </p>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <span>A familiar game. A fresh perspective.</span>
        <span>NO TIMER. JUST YOU & THE NEXT MOVE.</span>
      </footer>
      <Modal
        open={modal === "settings"}
        title="Make it your space"
        onClose={() => setModal(null)}
      >
        <p className="modal-description">
          A few small things, just the way you like them.
        </p>
        <label className="setting-row">
          <span>
            <strong>Sound effects</strong>
            <small>Soft notes for each little moment</small>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={preferences.sound}
            onChange={changeSound}
          />
        </label>
        <label className="setting-row">
          <span>
            <strong>Animations</strong>
            <small>
              {reduced
                ? "Your reduced-motion preference is respected"
                : "A little movement, a little magic"}
            </small>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={preferences.animations}
            onChange={() =>
              setPreferences((p) => ({ ...p, animations: !p.animations }))
            }
          />
        </label>
        <div className="setting-row">
          <span>
            <strong>Appearance</strong>
            <small>Choose your light</small>
          </span>
          <div className="theme-options">
            {(["dark", "light"] as const).map((theme) => (
              <button
                key={theme}
                aria-pressed={preferences.theme === theme}
                onClick={() => setPreferences((p) => ({ ...p, theme }))}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>
        <button className="primary-button full" onClick={() => setModal(null)}>
          Back to the board <Icon name="arrow" />
        </button>
      </Modal>
      <Modal
        open={modal === "help"}
        title="Simple moves. Clever lines."
        onClose={() => setModal(null)}
      >
        <div className="help-example">
          {Array.from({ length: 5 }, (_, i) => (
            <Ball key={i} color="mint" />
          ))}
        </div>
        <ol className="help-list">
          <li>
            Select a ball, then an empty cell. It needs a clear path, moving up,
            down, left or right.
          </li>
          <li>
            Line up at least <strong>5 of the same color</strong> horizontally,
            vertically or diagonally. They disappear, and you earn points.
          </li>
          <li>
            No match? The three balls in <strong>Up next</strong> join the
            board. They can make matches, too.
          </li>
          <li>
            Keep space open. The game ends when the board fills up. You can undo
            your last move, even after game over.
          </li>
        </ol>
        <div className="scoring-table">
          <span>
            BALLS <b>5</b>
            <b>6</b>
            <b>7</b>
            <b>8</b>
            <b>9</b>
          </span>
          <span>
            POINTS <b>10</b>
            <b>12</b>
            <b>18</b>
            <b>28</b>
            <b>42</b>
          </span>
        </div>
        <p className="fine-print">
          Each complete line scores separately. Crossing lines share a ball, but
          that ball is only removed once. Arrow keys navigate; Enter or Space
          selects.
        </p>
        <button className="primary-button full" onClick={() => setModal(null)}>
          Let's play <Icon name="arrow" />
        </button>
      </Modal>
      <Modal
        open={modal === "new"}
        title="A fresh start?"
        onClose={() => setModal(null)}
      >
        <p className="modal-description">
          Your current board will be cleared. Your personal best stays with you.
        </p>
        <button className="primary-button full" onClick={restart}>
          Start a new game <Icon name="arrow" />
        </button>
        <button className="text-button" onClick={() => setModal(null)}>
          Keep playing
        </button>
      </Modal>
      <Modal
        open={modal === "over"}
        title="Game over"
        onClose={() => setModal(null)}
      >
        <div className="end-spark">✦</div>
        <p className="end-title">Every move was a possibility.</p>
        <p className="modal-description">
          The board is full. Take a breath, then find a new flow.
        </p>
        <div className="end-stats">
          <div>
            <span>FINAL SCORE</span>
            <strong>{game.score}</strong>
          </div>
          <div>
            <span>BEST SCORE</span>
            <strong>{best}</strong>
          </div>
          <div>
            <span>MOVES</span>
            <strong>{game.moves}</strong>
          </div>
        </div>
        <button className="primary-button full" onClick={restart}>
          Play again <Icon name="arrow" />
        </button>
        <button
          className="text-button"
          disabled={!game.previous}
          onClick={() => {
            state.goBack();
            setModal(null);
          }}
        >
          Undo last move
        </button>
      </Modal>
    </div>
  );
}
