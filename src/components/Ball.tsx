import type { Color } from "../engine/types";
const marks: Record<Color, string> = {
  violet: "✧",
  mint: "|",
  coral: "·",
  gold: "+",
  blue: "≈",
  pink: "◇",
  cyan: "∴",
};
export function Ball({
  color,
  className = "",
}: {
  color: Color;
  className?: string;
}) {
  return (
    <span aria-hidden="true" className={`ball ${color} ${className}`}>
      <span className="ball-mark">{marks[color]}</span>
    </span>
  );
}
