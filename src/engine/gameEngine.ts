import {
  COLORS,
  SIZE,
  type Board,
  type Color,
  type Game,
  type Snapshot,
  type Turn,
} from "./types";
import { random } from "./random";
import { findPath } from "./pathfinding";
import { findLines } from "./lineDetection";
import { scoreLines, type ScoreTable } from "./scoring";
export const emptyBoard = (): Board => Array(SIZE * SIZE).fill(null);
function preview(seed: number, count = 3): { colors: Color[]; seed: number } {
  const colors: Color[] = [];
  for (let i = 0; i < count; i++) {
    const [value, next] = random(seed);
    seed = next;
    colors.push(COLORS[Math.floor(value * COLORS.length)]);
  }
  return { colors, seed };
}
export function spawn(board: Board, colors: Color[], seed: number) {
  const result = [...board],
    cells: number[] = [];
  const empty = result.flatMap((value, i) => (value === null ? [i] : []));
  for (const color of colors) {
    if (!empty.length) break;
    const [value, next] = random(seed);
    seed = next;
    const [cell] = empty.splice(Math.floor(value * empty.length), 1);
    result[cell] = color;
    cells.push(cell);
  }
  return { board: result, cells, seed };
}
export function newGame(seed: number): Game {
  const initial = preview(seed, 5);
  const placed = spawn(emptyBoard(), initial.colors, initial.seed);
  const next = preview(placed.seed);
  return {
    board: placed.board,
    next: next.colors,
    seed: next.seed,
    score: 0,
    moves: 0,
    over: false,
    previous: null,
  };
}
export function move(
  game: Game,
  from: number,
  to: number,
  scoring?: ScoreTable,
): Turn | null {
  if (game.over) return null;
  const path = findPath(game.board, from, to);
  if (!path) return null;
  const movedBoard = [...game.board];
  movedBoard[to] = movedBoard[from];
  movedBoard[from] = null;
  let lines = findLines(movedBoard),
    spawnedBoard = movedBoard,
    spawned: number[] = [],
    seed = game.seed,
    next = game.next;
  if (!lines.length) {
    const added = spawn(movedBoard, game.next, seed);
    spawnedBoard = added.board;
    spawned = added.cells;
    const upcoming = preview(added.seed);
    seed = upcoming.seed;
    next = upcoming.colors;
    lines = findLines(spawnedBoard);
  }
  const removed = [...new Set(lines.flat())],
    board = [...spawnedBoard];
  removed.forEach((i) => {
    board[i] = null;
  });
  const gained = scoreLines(lines, scoring);
  const { previous: _previous, ...previous } = game;
  return {
    game: {
      board,
      next,
      seed,
      score: game.score + gained,
      moves: game.moves + 1,
      over: board.every(Boolean),
      previous,
    },
    path,
    movedBoard,
    spawnedBoard,
    spawned,
    removed,
    gained,
  };
}
export function undo(game: Game): Game {
  return game.previous ? { ...game.previous, previous: null } : game;
}
export function snapshot(game: Game): Snapshot {
  const { previous: _previous, ...state } = game;
  return state;
}
