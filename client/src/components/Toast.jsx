import { useEffect } from 'react';
import { CheckCircleIcon } from './Icons';

export default function Toast({ message, onDismiss, duration = 3500 }) {
  useEffect(() => {
    if (!message) return undefined;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [message, onDismiss, duration]);

  if (!message) return null;
  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg"
    >
      <CheckCircleIcon className="h-4 w-4 text-accent" /> {message}
    </div>
  );
}
