import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { LogoIcon } from '../components/icons';
import { authApi } from '../services/auth.api';
import { useAuth } from '../context/AuthContext';

const usernameRegex = /^[a-zA-Z0-9_]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getPasswordValidationMessage = (password?: string) => {
  if (!password) return 'Password is required.';
  if (password.length < 6) return 'Password must be at least 6 characters long.';
  return '';
};

const getFieldError = (
  field: 'username' | 'email' | 'password' | 'confirmPassword',
  value: string,
  password?: string
) => {
  if (field === 'username') {
    if (!value.trim()) return 'Username is required.';
    if (value.trim().length < 3) return 'Username must be at least 3 characters.';
    if (!usernameRegex.test(value.trim())) return 'Username can only contain letters, numbers, and underscores.';
    return '';
  }

  if (field === 'email') {
    if (!value.trim()) return 'Email is required.';
    if (!emailRegex.test(value.trim())) return 'Please enter a valid email address.';
    return '';
  }

  if (field === 'password') return getPasswordValidationMessage(value);

  if (!value) return 'Please confirm your password.';
  if (value !== password) return 'Passwords do not match.';
  return '';
};

const getPasswordBackendMessage = (error: any): string => {
  const responseData = error?.response?.data ?? {};
  const backendErrors = Array.isArray(responseData?.errors) ? responseData.errors : [];
  const passwordIssue = backendErrors.find((item: any) => {
    const path = typeof item?.path === 'string' ? item.path : '';
    const message = typeof item?.message === 'string' ? item.message : '';
    return path.includes('password') || message.toLowerCase().includes('password');
  });

  if (passwordIssue) {
    const message = typeof passwordIssue.message === 'string' ? passwordIssue.message : '';
    if (message.toLowerCase().includes('at least 6') || message.toLowerCase().includes('6 character')) {
      return 'Password must be at least 6 characters long.';
    }
  }

  return 'Password must be at least 6 characters long.';
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
    if (firstUsefulError && firstUsefulError.toLowerCase().includes('password')) {
      return getPasswordBackendMessage(error);
    }

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

  return 'Invalid input. Please check your information.';
};

export const SignupPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const isFormValid =
    !!username.trim() &&
    username.trim().length >= 3 &&
    usernameRegex.test(username.trim()) &&
    !!email.trim() &&
    emailRegex.test(email.trim()) &&
    !!password &&
    password.length >= 6 &&
    !!confirmPassword &&
    confirmPassword === password &&
    !getFieldError('username', username) &&
    !getFieldError('email', email) &&
    !getFieldError('password', password) &&
    !getFieldError('confirmPassword', confirmPassword, password);

  const handleFieldChange = (
    field: 'username' | 'email' | 'password' | 'confirmPassword',
    value: string
  ) => {
    const setters = {
      username: setUsername,
      email: setEmail,
      password: setPassword,
      confirmPassword: setConfirmPassword,
    };

    setters[field](value);
    setError(null);

    if (field === 'username' && value.trim() && !fieldErrors.username) {
      setFieldErrors((prev) => ({ ...prev, username: '' }));
    }

    if (field === 'email' && value.trim() && emailRegex.test(value.trim())) {
      setFieldErrors((prev) => ({ ...prev, email: '' }));
    }

    if (field === 'password' && value && value.length >= 6) {
      setFieldErrors((prev) => ({ ...prev, password: '' }));
    }

    if (field === 'confirmPassword' && value && value === password) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = {
      username: getFieldError('username', username),
      email: getFieldError('email', email),
      password: getFieldError('password', password),
      confirmPassword: getFieldError('confirmPassword', confirmPassword, password),
    };

    setFieldErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
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

      const res = await authApi.signup({
        username: username.trim(),
        email: email.trim(),
        password,
      });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      const data = err?.response?.data ?? {};
      const backendErrors = Array.isArray(data.errors) ? data.errors : [];
      const firstUsefulError = backendErrors.find((item: any) => {
        const message = typeof item?.message === 'string' ? item.message.trim() : '';
        return message && message !== 'Validation failed';
      });

      if (firstUsefulError?.path) {
        const fieldName = String(firstUsefulError.path)
          .replace(/^body\./, '')
          .replace(/^params\./, '')
          .replace(/^query\./, '');

        if (fieldName === 'username') {
          setFieldErrors((prev) => ({ ...prev, username: firstUsefulError.message }));
        }

        if (fieldName === 'email') {
          setFieldErrors((prev) => ({ ...prev, email: firstUsefulError.message }));
        }

        if (fieldName === 'password') {
          setFieldErrors((prev) => ({ ...prev, password: 'Password must be at least 6 characters long.' }));
        }
      }

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
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Create an account
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Build and curate your personal second brain
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 text-xs font-medium text-red-600 bg-red-50 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            type="text"
            placeholder="johndoe"
            value={username}
            onChange={(e) => handleFieldChange('username', e.target.value)}
            error={fieldErrors.username}
            required
          />

          <Input
            label="Email"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            error={fieldErrors.email}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => handleFieldChange('password', e.target.value)}
            error={fieldErrors.password}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
            error={fieldErrors.confirmPassword}
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            disabled={loading || !isFormValid}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
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