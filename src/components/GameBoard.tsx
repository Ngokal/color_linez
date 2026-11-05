import { useRef, type CSSProperties } from "react";
import { SIZE, type Board, type Color } from "../engine/types";
import { Ball } from "./Ball";
export function GameBoard({
  board,
  selected,
  moving,
  spawned,
  removed,
  busy,
  over,
  onSelect,
}: {
  board: Board;
  selected: number | null;
  moving: { cell: number; color: Color } | null;
  spawned: number[];
  removed: number[];
  busy: boolean;
  over: boolean;
  onSelect: (cell: number) => void;
}) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div className={`board-frame ${busy ? "is-busy" : ""}`}>
      <div
        className="board"
        role="group"
        aria-label="Game board, 9 by 9"
        aria-busy={busy}
      >
        {board.map((color, i) => (
          <button
            key={i}
            ref={(el) => {
              buttons.current[i] = el;
            }}
            className={`cell ${selected === i ? "selected" : ""} ${selected !== null && !color ? "destination" : ""}`}
            aria-label={`Row ${Math.floor(i / SIZE) + 1}, column ${(i % SIZE) + 1}: ${color ?? "empty"}`}
            aria-pressed={selected === i}
            aria-disabled={busy || over}
            tabIndex={selected === i || (selected === null && i === 0) ? 0 : -1}
            onClick={() => onSelect(i)}
            onKeyDown={(event) => {
              const row = Math.floor(i / SIZE),
                col = i % SIZE;
              const targets: Record<string, number> = {
                ArrowLeft: row * SIZE + Math.max(0, col - 1),
                ArrowRight: row * SIZE + Math.min(8, col + 1),
                ArrowUp: Math.max(0, row - 1) * SIZE + col,
                ArrowDown: Math.min(8, row + 1) * SIZE + col,
                Home: row * SIZE,
                End: row * SIZE + 8,
              };
              if (event.key in targets) {
                event.preventDefault();
                buttons.current[targets[event.key]]?.focus();
              }
            }}
          >
            {color && (
              <Ball
                color={color}
                className={`${spawned.includes(i) ? "spawning" : ""} ${removed.includes(i) ? "removing" : ""}`}
              />
            )}
          </button>
        ))}
        {moving && (
          <div
            className="moving-ball"
            style={
              {
                "--x": moving.cell % SIZE,
                "--y": Math.floor(moving.cell / SIZE),
              } as CSSProperties
            }
          >
            <Ball color={moving.color} />
          </div>
        )}
      </div>
    </div>
  );
}
