import { describe, expect, it } from "vitest";
import { findPath } from "../engine/pathfinding";
import { findLines } from "../engine/lineDetection";
import { scoreLines } from "../engine/scoring";
import { random } from "../engine/random";
import {
  emptyBoard,
  move,
  newGame,
  snapshot,
  spawn,
  undo,
} from "../engine/gameEngine";
import { COLORS, type Game } from "../engine/types";
const fixture = (): Game => ({
  board: emptyBoard(),
  score: 0,
  moves: 0,
  seed: 42,
  next: ["mint", "coral", "gold"],
  over: false,
  previous: null,
});
describe("BFS", () => {
  it("finds a shortest orthogonal path without wrapping rows", () => {
    const b = emptyBoard();
    b[8] = "mint";
    const p = findPath(b, 8, 9)!;
    expect(p).toHaveLength(10);
    expect(p[0]).toBe(8);
    expect(p.at(-1)).toBe(9);
    for (let i = 1; i < p.length; i++)
      expect(
        Math.abs(Math.floor(p[i] / 9) - Math.floor(p[i - 1] / 9)) +
          Math.abs((p[i] % 9) - (p[i - 1] % 9)),
      ).toBe(1);
  });
  it("routes around obstacles", () => {
    const b = emptyBoard();
    b[0] = "mint";
    b[1] = "coral";
    expect(findPath(b, 0, 2)).toEqual([0, 9, 10, 11, 2]);
  });
  it("rejects blocked paths and diagonal squeezing", () => {
    const b = emptyBoard();
    b[0] = "mint";
    b[1] = "coral";
    b[9] = "gold";
    expect(findPath(b, 0, 10)).toBeNull();
  });
  it("rejects occupied destinations, same cell, empty source and invalid indices", () => {
    const b = emptyBoard();
    b[0] = "mint";
    b[1] = "gold";
    for (const [a, z] of [
      [0, 1],
      [0, 0],
      [2, 3],
      [-1, 2],
      [0, 81],
      [0, NaN],
    ])
      expect(findPath(b, a, z)).toBeNull();
  });
});
describe("lines and scoring", () => {
  it.each([
    [0, 1, 2, 3, 4],
    [0, 9, 18, 27, 36],
    [0, 10, 20, 30, 40],
    [8, 16, 24, 32, 40],
  ])("detects direction %j", (...indices) => {
    const b = emptyBoard();
    indices.forEach((i) => (b[i] = "mint"));
    expect(findLines(b)).toEqual([indices]);
  });
  it("ignores short, broken, mixed and wrapped lines", () => {
    const b = emptyBoard();
    [6, 7, 8, 9, 10].forEach((i) => (b[i] = "mint"));
    expect(findLines(b)).toEqual([]);
    b[0] = "gold";
    b[1] = "gold";
    b[2] = "coral";
    b[3] = "gold";
    b[4] = "gold";
    expect(findLines(b)).toEqual([]);
  });
  it.each([
    [5, 10],
    [6, 12],
    [7, 18],
    [8, 28],
    [9, 42],
  ])("scores a maximal %i-ball line as %i", (count, points) => {
    const b = emptyBoard();
    for (let i = 0; i < count; i++) b[i] = "mint";
    const lines = findLines(b);
    expect(lines).toHaveLength(1);
    expect(scoreLines(lines)).toBe(points);
  });
  it("scores simultaneous lines independently and supports configuration", () => {
    expect(
      scoreLines([
        [0, 1, 2, 3, 4],
        [0, 9, 18, 27, 36],
      ]),
    ).toBe(20);
    expect(scoreLines([[0, 1, 2, 3, 4]], { 5: 99 })).toBe(99);
  });
  it("removes intersections once, preserves preview and does not spawn after player match", () => {
    const g = fixture();
    [38, 39, 41, 42, 20, 30, 50, 60].forEach((i) => (g.board[i] = "mint"));
    g.board[31] = "mint";
    const t = move(g, 31, 40)!;
    expect(t.removed).toHaveLength(9);
    expect(t.gained).toBe(20);
    expect(t.spawned).toEqual([]);
    expect(t.game.board.every((v) => !v)).toBe(true);
    expect(t.game.next).toEqual(g.next);
    expect(t.game.seed).toBe(g.seed);
  });
});
describe("turns, randomness and undo", () => {
  it("starts with five balls, three previews and reset counters", () => {
    const g = newGame(123);
    expect(g.board.filter(Boolean)).toHaveLength(5);
    expect(g.next).toHaveLength(3);
    expect(g.moves).toBe(0);
    expect(g.score).toBe(0);
    expect(g.previous).toBeNull();
    expect(g.over).toBe(false);
  });
  it("is deterministic with serializable PRNG state", () => {
    expect(newGame(123)).toEqual(newGame(123));
    expect(newGame(123)).not.toEqual(newGame(124));
    const [value, seed] = random(0);
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(1);
    expect(random(seed)).toEqual(random(seed));
  });
  it("spawns preview colors into distinct empty cells and does not mutate input", () => {
    const g = fixture();
    g.board[0] = "violet";
    const before = structuredClone(g);
    const t = move(g, 0, 1)!;
    expect(g).toEqual(before);
    expect(t.game.board[1]).toBe("violet");
    expect(t.spawned).toHaveLength(3);
    expect(t.spawned.map((i) => t.spawnedBoard[i])).toEqual(g.next);
    expect(new Set(t.spawned).size).toBe(3);
    expect(t.spawned).not.toContain(1);
    expect(t.game.moves).toBe(1);
    expect(t.game.board.filter(Boolean)).toHaveLength(4);
  });
  it("leaves invalid moves unchanged and disallows moves after game over", () => {
    const g = fixture();
    g.board[0] = "mint";
    g.board[1] = "gold";
    const before = structuredClone(g);
    expect(move(g, 0, 1)).toBeNull();
    expect(g).toEqual(before);
    expect(move({ ...g, over: true }, 0, 9)).toBeNull();
  });
  it("spawns only the available spaces and never overwrites occupied cells", () => {
    const b = Array(81).fill("coral");
    b[3] = null;
    b[50] = null;
    const s = spawn(b, ["mint", "gold", "cyan"], 8);
    expect(s.cells).toHaveLength(2);
    expect(s.board[3]).not.toBeNull();
    expect(s.board[50]).not.toBeNull();
    expect(s.board[0]).toBe("coral");
    expect(spawn(s.board, ["mint"], s.seed).cells).toEqual([]);
  });
  it("clears spawn-created matches before declaring game over", () => {
    const g = fixture();
    g.board = Array.from(
      { length: 81 },
      (_, i) => COLORS[(Math.floor(i / 9) * 2 + (i % 9)) % 7],
    );
    [0, 1, 2, 3].forEach((i) => (g.board[i] = "mint"));
    g.board[4] = "coral";
    g.board[5] = null;
    g.next = ["mint", "gold", "cyan"];
    const t = move(g, 4, 5)!;
    expect(t.spawned).toEqual([4]);
    expect(t.removed).toEqual([0, 1, 2, 3, 4]);
    expect(t.game.score).toBe(10);
    expect(t.game.over).toBe(false);
    expect(t.game.board.filter((v) => !v)).toHaveLength(5);
  });
  it("detects full board after limited spawning", () => {
    const g = fixture();
    g.board = Array.from(
      { length: 81 },
      (_, i) => COLORS[(Math.floor(i / 9) * 2 + (i % 9)) % 7],
    );
    g.board[1] = null;
    const t = move(g, 0, 1)!;
    expect(t.spawned).toHaveLength(1);
    expect(t.game.over).toBe(true);
    expect(t.game.board.every(Boolean)).toBe(true);
    expect(undo(t.game)).toEqual(g);
  });
  it("restores exact state and reproduces the same random turn on replay", () => {
    const g = fixture();
    g.board[0] = "mint";
    g.score = 28;
    g.moves = 7;
    const t = move(g, 0, 1)!;
    const restored = undo(t.game);
    expect(restored).toEqual(g);
    expect(move(restored, 0, 1)).toEqual(t);
    expect(undo(restored)).toBe(restored);
  });
  it("undoes removals and keeps only the immediately previous turn", () => {
    const g = fixture();
    [0, 1, 2, 3].forEach((i) => (g.board[i] = "mint"));
    g.board[13] = "mint";
    const t = move(g, 13, 4)!;
    expect(t.gained).toBe(10);
    expect(undo(t.game)).toEqual(g);
    const n = newGame(32);
    let t2 = null;
    for (let a = 0; a < 81 && !t2; a++)
      for (let b = 0; b < 81 && !t2; b++) t2 = move(n, a, b);
    expect(t2).not.toBeNull();
    expect(snapshot(undo(t2!.game))).toEqual(snapshot(n));
    expect(undo(t2!.game).previous).toBeNull();
  });
});
