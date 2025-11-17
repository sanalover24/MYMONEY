import React from 'react';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  required?: boolean;
}

const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  placeholder = "0.00",
  className = '',
  ...props
}) => {

  const formatToIndianCurrency = (numStr: string) => {
    if (!numStr) return '';
    let [integerPart, decimalPart] = numStr.split('.');
    if (!integerPart) return decimalPart !== undefined ? `0.${decimalPart}` : '';
    
    const lastThree = integerPart.slice(-3);
    const otherNumbers = integerPart.slice(0, -3);
    const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + (otherNumbers ? ',' : '') + lastThree;

    return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value.replace(/[^0-9.]/g, '');
    
    const parts = rawValue.split('.');
    if (parts.length > 2) {
        rawValue = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts[1] && parts[1].length > 2) {
        parts[1] = parts[1].slice(0, 2);
        rawValue = parts.join('.');
    }

    onChange(rawValue);
  };

  const displayedValue = formatToIndianCurrency(value);

  return (
    <input
      type="text"
      inputMode="decimal"
      value={displayedValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      {...props}
    />
  );
};

export default AmountInput;
