// Deterministic initials avatar — same name always renders the same
// color, no image upload needed. Palette is drawn from the app's own
// ink/gold tokens so avatars never clash with the rest of the UI.
const PALETTE = ["#3e5178", "#a97527", "#5e7099", "#8c611f", "#24365c", "#c68f35"];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash);
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export default function Avatar({ name, sizePx = 32 }) {
  const color = PALETTE[hashString(name || "?") % PALETTE.length];
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold text-white shrink-0 select-none"
      style={{ backgroundColor: color, width: sizePx, height: sizePx, fontSize: sizePx * 0.4 }}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}
