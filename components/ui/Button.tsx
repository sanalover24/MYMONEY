import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({ children, className = '', variant = 'primary', ...props }) => {
  const baseClasses = 'px-5 py-2.5 rounded-xl font-semibold transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-gradient-to-br from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700 focus:ring-brand-500 shadow-lg shadow-brand-500/20 hover:shadow-xl dark:shadow-brand-900/30',
    secondary: 'bg-white/50 dark:bg-zinc-800/40 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-zinc-800/60 focus:ring-slate-500',
    danger: 'bg-gradient-to-br from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 focus:ring-rose-500 shadow-md hover:shadow-lg',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;