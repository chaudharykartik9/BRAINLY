import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { LogoIcon } from '../components/icons';
import { authApi } from '../services/auth.api';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getApiErrorMessage = (error: any): string => {
  const status = error?.response?.status;
  const responseData = error?.response?.data ?? {};
  const serverMessage = typeof responseData?.message === 'string' ? responseData.message : '';

  if (error?.code === 'ERR_NETWORK' || !error?.response) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  if (status === 400) {
    return serverMessage || 'Please enter a valid email address.';
  }

  return serverMessage || 'Something went wrong. Please try again.';
};

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = email.trim();
    if (!trimmed || !emailRegex.test(trimmed)) {
      setFieldError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setFieldError('');
      await authApi.forgotPassword(trimmed);
      setSubmitted(true);
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl mb-3">
            <LogoIcon className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Forgot password?</h2>
          <p className="text-sm text-slate-500 mt-1">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {submitted ? (
          <div className="p-4 text-sm text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-100">
            If an account exists for <span className="font-semibold">{email.trim()}</span>, we've
            sent a link to reset your password. It expires in 1 hour.
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-5 p-3.5 text-xs font-medium text-red-600 bg-red-50 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldError('');
                  setError(null);
                }}
                error={fieldError}
                required
              />

              <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          </>
        )}

        <p className="text-center text-sm text-slate-500 mt-6">
          Remembered your password?{' '}
          <Link
            to="/signin"
            className="font-semibold text-brand-600 hover:text-brand-700 underline-offset-2 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
