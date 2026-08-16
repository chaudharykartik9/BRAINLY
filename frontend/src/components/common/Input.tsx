import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from '../icons';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  id,
  type,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const isPasswordField = type === 'password';
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-500"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={inputId}
          type={isPasswordField ? (isPasswordVisible ? 'text' : 'password') : type}
          className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all ${
            isPasswordField ? 'pr-10' : ''
          } ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''} ${className}`}
          {...props}
        />

        {isPasswordField && (
          <button
            type="button"
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-xl text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:ring-offset-2"
          >
            {isPasswordVisible ? (
              <EyeOffIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};