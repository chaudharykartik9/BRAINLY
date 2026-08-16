import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  className = '',
}) => {
  const variants = {
    primary: 'bg-brand-50 text-brand-700 border-brand-100/70',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200/60',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border tracking-tight ${variants[variant]} ${className}`}
    >
      #{children}
    </span>
  );
};