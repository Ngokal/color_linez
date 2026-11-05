import { useEffect, useRef, useState } from "react";
import { move, newGame, undo } from "../engine/gameEngine";
import type { Board, Color } from "../engine/types";
export type Sound = "select" | "move" | "spawn" | "match" | "over" | "invalid";
export function useGame(animate: boolean, play: (sound: Sound) => void) {
  const [game, setGame] = useState(() =>
    newGame(crypto.getRandomValues(new Uint32Array(1))[0]),
  );
  const [board, setBoard] = useState<Board>(game.board);
  const [selected, setSelected] = useState<number | null>(null);
  const [moving, setMoving] = useState<{ cell: number; color: Color } | null>(
    null,
  );
  const [spawned, setSpawned] = useState<number[]>([]);
  const [removed, setRemoved] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("Select a ball. Find its next move.");
  const [gain, setGain] = useState(0);
  const locked = useRef(false),
    generation = useRef(0);
  useEffect(
    () => () => {
      generation.current++;
    },
    [],
  );
  function resetVisual() {
    generation.current++;
    locked.current = false;
    setBusy(false);
    setMoving(null);
    setRemoved([]);
    setSpawned([]);
    setSelected(null);
    setGain(0);
  }
  function restart() {
    resetVisual();
    const fresh = newGame(crypto.getRandomValues(new Uint32Array(1))[0]);
    setGame(fresh);
    setBoard(fresh.board);
    setNotice("A fresh start. Make room for possibility.");
  }
  function goBack() {
    if (locked.current || !game.previous) return;
    resetVisual();
    const restored = undo(game);
    setGame(restored);
    setBoard(restored.board);
    setNotice("One step back. A new possibility.");
  }
  async function select(cell: number) {
    if (locked.current || game.over) return;
    if (game.board[cell]) {
      setSelected(selected === cell ? null : cell);
      play("select");
      setNotice("Choose an empty cell to move here.");
      return;
    }
    if (selected === null) {
      setNotice("Select a colored ball first.");
      return;
    }
    const turn = move(game, selected, cell);
    if (!turn) {
      play("invalid");
      setNotice("No clear path. Try another space.");
      return;
    }
    locked.current = true;
    setBusy(true);
    setSelected(null);
    setGain(0);
    setSpawned([]);
    const token = ++generation.current;
    const pause = async (ms: number) => {
      if (animate) await new Promise((resolve) => setTimeout(resolve, ms));
      return generation.current === token;
    };
    play("move");
    if (animate) {
      const travel = [...game.board];
      const color = travel[selected]!;
      travel[selected] = null;
      setBoard(travel);
      setMoving({ cell: selected, color });
      if (!(await pause(30))) return;
      for (const step of turn.path.slice(1)) {
        setMoving({ cell: step, color });
        if (!(await pause(38))) return;
      }
    }
    setMoving(null);
    setBoard(turn.movedBoard);
    if (turn.spawned.length) {
      if (!(await pause(80))) return;
      setBoard(turn.spawnedBoard);
      setSpawned(turn.spawned);
      play("spawn");
      if (!(await pause(260))) return;
    }
    if (turn.removed.length) {
      setRemoved(turn.removed);
      setGain(turn.gained);
      play("match");
      if (!(await pause(320))) return;
    }
    setGame(turn.game);
    setBoard(turn.game.board);
    setRemoved([]);
    setSpawned([]);
    setBusy(false);
    locked.current = false;
    setNotice(
      turn.game.over
        ? "Every space filled. Every move mattered."
        : turn.gained
          ? `${turn.removed.length} balls cleared. +${turn.gained} points. Nicely lined up!`
          : "Three new possibilities. Find your next line.",
    );
    if (turn.game.over) play("over");
  }
  return {
    game,
    board,
    selected,
    moving,
    spawned,
    removed,
    busy,
    notice,
    gain,
    select,
    restart,
    goBack,
  };
}
