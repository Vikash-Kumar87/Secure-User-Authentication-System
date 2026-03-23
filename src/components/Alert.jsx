export default function Alert({ type = 'error', message }) {
  if (!message) return null;

  const styles =
    type === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : 'border-rose-200 bg-rose-50 text-rose-700';

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${styles}`} role="alert" aria-live="polite">
      {message}
    </div>
  );
}
