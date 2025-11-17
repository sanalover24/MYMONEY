import React, { ReactNode } from 'react';

// FIX: Update CardProps to extend React.HTMLAttributes<HTMLDivElement>. This allows standard div attributes like `style` to be passed, fixing a type error.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white/60 dark:bg-black/30 backdrop-blur-2xl rounded-2xl p-4 sm:p-6 shadow-lg dark:shadow-black/20 border border-white/50 dark:border-white/10 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;