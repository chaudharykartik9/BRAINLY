import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'neutral';
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  className = '',
  onClick,
}) => {
  const variants = {
    primary: 'bg-brand-50 text-brand-700 border-brand-100/70 dark:bg-brand-500/10 dark:text-brand-300 dark:border-brand-400/20',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200/60 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };

  const classes = `inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border tracking-tight ${variants[variant]} ${
    onClick ? 'hover:brightness-95 cursor-pointer transition-[filter]' : ''
  } ${className}`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        #{children}
      </button>
    );
  }

  return <span className={classes}>#{children}</span>;
};
