import React from 'react';

// A generic interface for the options
interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ElementType;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
  className = ''
}: SegmentedControlProps<T>) => {
  return (
    <div className={`flex rounded-lg bg-slate-100 dark:bg-zinc-800/50 p-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-md w-full transition-all duration-300 text-sm font-semibold ${
            value === option.value
              ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-800 dark:text-white'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          {option.icon && <option.icon className="w-5 h-5" />}
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default SegmentedControl;
