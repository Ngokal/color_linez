export type ScoreTable = Readonly<Record<number, number>>;
export const DEFAULT_SCORING: ScoreTable = {
  5: 10,
  6: 12,
  7: 18,
  8: 28,
  9: 42,
};
// Each maximal line scores independently; intersecting balls are removed once.
export function scoreLines(
  lines: number[][],
  table: ScoreTable = DEFAULT_SCORING,
): number {
  return lines.reduce(
    (sum, line) => sum + (table[line.length] ?? line.length * 2),
    0,
  );
}
