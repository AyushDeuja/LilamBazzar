const KNOWN = new Set([
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
  'paid',
  'failed',
  'won',
  'outbid',
]);

export default function StatusBadge({ status }) {
  const variant = KNOWN.has(status) ? status : 'neutral';
  return <span className={`badge badge--${variant}`}>{status}</span>;
}
