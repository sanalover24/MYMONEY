import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon } from '../icons';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  icon?: ReactNode;
  // FIX: Add disabled prop to allow the component to be disabled.
  disabled?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, placeholder = 'Select an option', className = '', icon, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const DROPDOWN_MAX_HEIGHT = 240; // Corresponds to Tailwind's max-h-60
        const spaceBelow = window.innerHeight - rect.bottom;
        const opensUp = spaceBelow < DROPDOWN_MAX_HEIGHT && rect.top > DROPDOWN_MAX_HEIGHT;

        setDropdownStyle({
            position: 'absolute',
            top: opensUp ? `${rect.top - DROPDOWN_MAX_HEIGHT - 4}px` : `${rect.bottom + 4}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            maxHeight: `${DROPDOWN_MAX_HEIGHT}px`,
            transformOrigin: opensUp ? 'bottom' : 'top',
        });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        triggerRef.current && !triggerRef.current.contains(event.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative w-full ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 text-left bg-slate-50 dark:bg-zinc-800/50 border border-slate-300/70 dark:border-zinc-700/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all duration-200 disabled:bg-slate-100 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <span className="flex items-center min-w-0">
          {icon && <span className="mr-3 text-zinc-400 dark:text-zinc-500">{icon}</span>}
          <span className={`truncate ${selectedOption ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}>{selectedOption?.label || placeholder}</span>
        </span>
        <ChevronDownIcon className={`w-5 h-5 text-zinc-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
      </button>

      {isOpen && !disabled && createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className={`
            z-50 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg shadow-lg overflow-hidden
            ${dropdownStyle.transformOrigin === 'bottom' ? 'animate-fade-in-down' : 'animate-fade-in-up'}
          `}
        >
          <ul role="listbox" className="overflow-y-auto max-h-full">
            {options.map(option => (
              <li
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`px-4 py-2 cursor-pointer text-zinc-900 dark:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors ${
                  value === option.value ? 'bg-slate-100 dark:bg-zinc-700 font-semibold' : ''
                }`}
                role="option"
                aria-selected={value === option.value}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CustomSelect;
