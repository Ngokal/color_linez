import { SIZE, type Board } from "./types";
export function findLines(board: Board): number[][] {
  const lines: number[][] = [];
  for (let i = 0; i < board.length; i++) {
    const color = board[i];
    if (!color) continue;
    const row = Math.floor(i / SIZE),
      col = i % SIZE;
    for (const [dr, dc] of [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ]) {
      const pr = row - dr,
        pc = col - dc;
      if (
        pr >= 0 &&
        pr < SIZE &&
        pc >= 0 &&
        pc < SIZE &&
        board[pr * SIZE + pc] === color
      )
        continue;
      const line: number[] = [];
      for (
        let r = row, c = col;
        r >= 0 &&
        r < SIZE &&
        c >= 0 &&
        c < SIZE &&
        board[r * SIZE + c] === color;
        r += dr, c += dc
      )
        line.push(r * SIZE + c);
      if (line.length >= 5) lines.push(line);
    }
  }
  return lines;
}
