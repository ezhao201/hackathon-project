export default function EmptyState({ icon = '🔎', title, body, action }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <span className="text-4xl" aria-hidden="true">
        {icon}
      </span>
      <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      {body && <p className="mt-1.5 max-w-md text-sm text-slate-600 dark:text-slate-400">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
