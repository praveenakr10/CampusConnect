// The one signature visual mark for the app — a small collegiate
// shield used next to the wordmark in the nav. Kept deliberately simple
// so it reads clearly at 22px.
export default function CrestLogo({ size = 22 }) {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M12 1 L22 5 V13 C22 20 17.5 25 12 27 C6.5 25 2 20 2 13 V5 Z"
        fill="#182848"
        stroke="#c68f35"
        strokeWidth="1.2"
      />
      <path d="M12 8 L12 19 M7.5 12.5 L16.5 12.5" stroke="#c68f35" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
