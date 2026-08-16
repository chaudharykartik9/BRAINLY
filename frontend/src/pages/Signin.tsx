import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { LogoIcon } from '../components/icons';
import { authApi } from '../services/auth.api';
import { useAuth } from '../context/AuthContext';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getFieldError = (value: string, field: 'email' | 'password') => {
  const trimmedValue = value.trim();

  if (field === 'email') {
    if (!trimmedValue) return 'Please enter your email.';
    if (!emailRegex.test(trimmedValue)) return 'Please enter a valid email address.';
    return '';
  }

  if (!value) return 'Please enter your password.';
  return '';
};

const getApiErrorMessage = (error: any): string => {
  const status = error?.response?.status;
  const responseData = error?.response?.data ?? {};
  const serverMessage = typeof responseData?.message === 'string' ? responseData.message : '';
  const backendErrors = Array.isArray(responseData?.errors) ? responseData.errors : [];

  const firstUsefulError = backendErrors.find((item: any) => {
    const message = typeof item?.message === 'string' ? item.message.trim() : '';
    return message && message !== 'Validation failed';
  })?.message;

  if (status === 400) {
    return firstUsefulError || serverMessage || 'Invalid input. Please check your information.';
  }

  if (status === 401) {
    return 'Invalid email/username or password.';
  }

  if (status === 409) {
    return 'An account with these details already exists.';
  }

  if (status === 500) {
    return 'Something went wrong on the server. Please try again.';
  }

  if (error?.code === 'ERR_NETWORK' || !error?.response) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  if (serverMessage && serverMessage !== 'Validation failed') {
    return serverMessage;
  }

  return 'Invalid email/username or password.';
};

export const SigninPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const isFormValid =
    !!email.trim() &&
    emailRegex.test(email.trim()) &&
    !!password &&
    !getFieldError(email, 'email') &&
    !getFieldError(password, 'password');

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setError(null);
    if (value.trim() && emailRegex.test(value.trim())) {
      setFieldErrors((prev) => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setError(null);
    if (value) {
      setFieldErrors((prev) => ({ ...prev, password: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = getFieldError(email, 'email');
    const passwordError = getFieldError(password, 'password');

    const nextErrors = {
      email: emailError,
      password: passwordError,
    };

    setFieldErrors(nextErrors);

    if (emailError || passwordError) {
      setError(null);
      return;
    }

    if (!isFormValid) {
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await authApi.signin({ email: email.trim(), password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      const message = getApiErrorMessage(err);
      setError(message);
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
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Welcome back
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Sign in to access your second brain
          </p>
        </div>

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
            onChange={(e) => handleEmailChange(e.target.value)}
            error={fieldErrors.email}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            error={fieldErrors.password}
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            disabled={loading || !isFormValid}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-semibold text-brand-600 hover:text-brand-700 underline-offset-2 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};