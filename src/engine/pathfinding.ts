import { SIZE, type Board } from "./types";
export function findPath(
  board: Board,
  from: number,
  to: number,
): number[] | null {
  if (
    !Number.isInteger(from) ||
    !Number.isInteger(to) ||
    from < 0 ||
    to < 0 ||
    from >= board.length ||
    to >= board.length ||
    !board[from] ||
    board[to] ||
    from === to
  )
    return null;
  const queue = [from],
    parents = new Map<number, number>([[from, -1]]);
  for (let head = 0; head < queue.length; head++) {
    const cell = queue[head],
      row = Math.floor(cell / SIZE),
      col = cell % SIZE;
    const neighbors = [
      row > 0 ? cell - SIZE : -1,
      col < SIZE - 1 ? cell + 1 : -1,
      row < SIZE - 1 ? cell + SIZE : -1,
      col > 0 ? cell - 1 : -1,
    ];
    for (const next of neighbors) {
      if (next < 0 || board[next] || parents.has(next)) continue;
      parents.set(next, cell);
      if (next === to) {
        const path = [to];
        while (path[0] !== from) path.unshift(parents.get(path[0])!);
        return path;
      }
      queue.push(next);
    }
  }
  return null;
}
