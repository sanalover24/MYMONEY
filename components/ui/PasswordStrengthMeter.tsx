import React, { useMemo } from 'react';
import { calculatePasswordStrength, PasswordStrength } from '../../utils/validation';
import { CheckIcon } from '../icons';

interface PasswordStrengthMeterProps {
  password?: string;
}

const strengthLevels = {
  0: { text: '', color: 'bg-slate-200 dark:bg-zinc-700', width: '0%' },
  1: { text: 'Weak', color: 'bg-rose-500', width: '20%' },
  2: { text: 'Medium', color: 'bg-amber-500', width: '40%' },
  3: { text: 'Medium', color: 'bg-amber-500', width: '60%' },
  4: { text: 'Strong', color: 'bg-sky-500', width: '80%' },
  5: { text: 'Very Strong', color: 'bg-emerald-500', width: '100%' },
};

const criteriaLabels = [
  { key: 'length', text: 'At least 8 characters' },
  { key: 'lowercase', text: 'A lowercase letter' },
  { key: 'uppercase', text: 'An uppercase letter' },
  { key: 'number', text: 'A number' },
  { key: 'specialChar', text: 'A special character' },
];

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password = '' }) => {
  const strength = useMemo(() => calculatePasswordStrength(password), [password]);
  const { score, criteria } = strength;
  const level = strengthLevels[score as keyof typeof strengthLevels];

  if (!password) {
    return null; // Don't show the meter for an empty password
  }

  return (
    <div className="space-y-2 transition-all duration-300">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password Strength</p>
        <p className={`text-sm font-bold`} style={{ color: score > 1 ? level.color.replace('bg-', '') : 'inherit' }}>
          {level.text}
        </p>
      </div>
      <div className="w-full bg-slate-200 dark:bg-zinc-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${level.color}`}
          style={{ width: level.width }}
        ></div>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {criteriaLabels.map(item => (
          <li key={item.key} className={`flex items-center transition-colors ${criteria[item.key as keyof typeof criteria] ? 'text-emerald-600 dark:text-emerald-500' : ''}`}>
            <CheckIcon className={`w-4 h-4 mr-2 ${criteria[item.key as keyof typeof criteria] ? 'opacity-100' : 'opacity-30'}`} />
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrengthMeter;