import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { LogoIcon } from '../components/icons';
import { authApi } from '../services/auth.api';
import { useAuth } from '../context/AuthContext';

const getFieldError = (
  field: 'password' | 'confirmPassword',
  value: string,
  password?: string,
): string => {
  if (field === 'password') {
    if (!value) return 'Password is required.';
    if (value.length < 6) return 'Password must be at least 6 characters long.';
    return '';
  }

  if (!value) return 'Please confirm your password.';
  if (value !== password) return 'Passwords do not match.';
  return '';
};

const getApiErrorMessage = (error: any): string => {
  const status = error?.response?.status;
  const responseData = error?.response?.data ?? {};
  const serverMessage = typeof responseData?.message === 'string' ? responseData.message : '';

  if (error?.code === 'ERR_NETWORK' || !error?.response) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  if (status === 400 || status === 404) {
    return serverMessage || 'This reset link is invalid or has expired.';
  }

  return serverMessage || 'Something went wrong. Please try again.';
};

export const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = {
      password: getFieldError('password', password),
      confirmPassword: getFieldError('confirmPassword', confirmPassword, password),
    };
    setFieldErrors(nextErrors);
    if (nextErrors.password || nextErrors.confirmPassword) return;

    if (!token) {
      setError('This reset link is missing its token.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await authApi.resetPassword(token, password);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
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
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Reset your password</h2>
          <p className="text-sm text-slate-500 mt-1">Choose a new password for your account</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 text-xs font-medium text-red-600 bg-red-50 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors((prev) => ({ ...prev, password: '' }));
              setError(null);
            }}
            error={fieldErrors.password}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
              setError(null);
            }}
            error={fieldErrors.confirmPassword}
            required
          />

          <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>

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
