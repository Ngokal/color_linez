type Name =
  | "undo"
  | "sound"
  | "muted"
  | "settings"
  | "plus"
  | "arrow"
  | "help"
  | "close"
  | "trophy";
const paths: Record<Name, string> = {
  undo: "M9 5 4 10l5 5M4 10h9a6 6 0 0 1 0 12",
  sound: "M11 4 5 9H2v6h3l6 5V4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14",
  muted: "M11 4 5 9H2v6h3l6 5V4Zm5 5 6 6m0-6-6 6",
  settings:
    "M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1 1-3Zm6 9a3 3 0 1 0-6 0 3 3 0 0 0 6 0",
  plus: "M12 5v14M5 12h14",
  arrow: "M4 12h15m-6-6 6 6-6 6",
  help: "M9 9a3 3 0 1 1 5 2c-2 1-2 2-2 3m0 3h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  close: "m6 6 12 12M6 18 18 6",
  trophy:
    "M7 3h10v7a5 5 0 0 1-10 0V3Zm0 2H3v4a4 4 0 0 0 4 4m10-8h4v4a4 4 0 0 1-4 4m-5 2v6m-4 0h8",
};
export function Icon({ name }: { name: Name }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
