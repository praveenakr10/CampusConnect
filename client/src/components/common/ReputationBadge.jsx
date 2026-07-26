// Simple reputation tiers so a raw number ("0 rep") becomes something
// with a bit of identity and a reason to keep climbing.
export function reputationTier(reputation) {
  if (reputation >= 200) return { label: "Expert", className: "bg-ink-800 text-gold-200" };
  if (reputation >= 50) return { label: "Contributor", className: "bg-gold-100 text-gold-700" };
  return { label: "Newcomer", className: "bg-ink-50 text-ink-500" };
}

export default function ReputationBadge({ reputation }) {
  const tier = reputationTier(reputation);
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${tier.className}`}>
      {tier.label}
    </span>
  );
}
