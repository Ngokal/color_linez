export const SIZE = 9;
export const COLORS = [
  "violet",
  "mint",
  "coral",
  "gold",
  "blue",
  "pink",
  "cyan",
] as const;
export type Color = (typeof COLORS)[number];
export type Board = (Color | null)[];
export interface Snapshot {
  board: Board;
  score: number;
  moves: number;
  next: Color[];
  seed: number;
  over: boolean;
}
export interface Game extends Snapshot {
  previous: Snapshot | null;
}
export interface Turn {
  game: Game;
  path: number[];
  movedBoard: Board;
  spawnedBoard: Board;
  spawned: number[];
  removed: number[];
  gained: number;
}
