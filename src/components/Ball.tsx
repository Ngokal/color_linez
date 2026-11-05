import type { Color } from "../engine/types";
export function Ball({
  color,
  className = "",
}: {
  color: Color;
  className?: string;
}) {
  return <span aria-hidden="true" className={`ball ${color} ${className}`} />;
}
