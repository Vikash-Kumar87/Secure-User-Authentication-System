export default function LoadingSpinner({ text = 'Please wait...' }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-brand-100 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      <span>{text}</span>
    </div>
  );
}
