import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 ease-out cursor-pointer disabled:cursor-not-allowed disabled:opacity-75 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:hover:bg-slate-300 disabled:hover:shadow-none disabled:active:scale-100';

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  const variants = {
    primary: 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm hover:shadow-md hover:shadow-blue-500/20 active:scale-[0.98] disabled:bg-slate-300 disabled:text-slate-500 disabled:hover:bg-slate-300',
    secondary: 'bg-indigo-50 hover:bg-indigo-100 text-brand-700 active:scale-[0.98] disabled:bg-slate-300 disabled:text-slate-500 disabled:hover:bg-slate-300',
    outline: 'border border-slate-200 hover:bg-slate-100 text-slate-700 active:scale-[0.98] disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500 disabled:hover:bg-slate-100',
    danger: 'bg-red-50 hover:bg-red-100 text-red-600 active:scale-[0.98] disabled:bg-slate-300 disabled:text-slate-500 disabled:hover:bg-slate-300',
  };

  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};