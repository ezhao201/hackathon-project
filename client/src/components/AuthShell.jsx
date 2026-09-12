import { ShieldIcon } from './Icons';

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-navy">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-slate-600">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
      {footer && <p className="mt-6 text-center text-sm text-slate-600">{footer}</p>}
      <p className="mt-6 inline-flex items-center justify-center gap-1.5 text-xs text-slate-500">
        <ShieldIcon className="h-4 w-4 text-accent" /> We never sell your data.
      </p>
    </div>
  );
}
