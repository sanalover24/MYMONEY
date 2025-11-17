import React, { useState, useEffect } from 'react';
import { ToastMessage } from '../../context/ToastContext';
import { XIcon, CheckCircle2Icon, AlertCircleIcon } from '../icons';

interface ToastProps extends ToastMessage {
  onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, 4500); // Start exit animation before it's removed

    return () => clearTimeout(timer);
  }, []);

  const handleAnimationEnd = () => {
    if (isExiting) {
      onDismiss();
    }
  };

  const icons = {
    success: <CheckCircle2Icon className="w-6 h-6 text-green-500 animate-pop-in" />,
    error: <AlertCircleIcon className="w-6 h-6 text-red-500" />,
  };
  
  const baseClasses = "flex items-start p-4 w-full max-w-xs text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border-l-4";
  const typeClasses = {
      success: "border-green-500",
      error: "border-red-500"
  }
  const animationClass = isExiting ? 'animate-fade-out' : 'animate-slide-in-right';

  return (
    <div
      className={`${baseClasses} ${typeClasses[type]} ${animationClass}`}
      onAnimationEnd={handleAnimationEnd}
      role="alert"
    >
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8">
        {icons[type]}
      </div>
      <div className="ml-3 text-sm font-normal">{message}</div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 bg-white text-zinc-400 hover:text-zinc-900 rounded-lg focus:ring-2 focus:ring-slate-300 p-1.5 hover:bg-slate-100 inline-flex items-center justify-center h-8 w-8 dark:text-zinc-500 dark:hover:text-white dark:bg-zinc-800 dark:hover:bg-zinc-700"
        onClick={() => setIsExiting(true)}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <XIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toast;