export default function Loader({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-2 text-slate-500 py-8 text-sm">
      <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      {label}
    </div>
  );
}
