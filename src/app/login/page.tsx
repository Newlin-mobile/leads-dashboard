'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToastError, useToastSuccess } from '@/components/ui/Toast';

const appName = process.env.NEXT_PUBLIC_APP_NAME || 'MyTool';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const showError = useToastError();
  const showSuccess = useToastSuccess();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      showSuccess('Login successful', 'Welcome back!');
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      showError('Login failed', error instanceof Error ? error.message : 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary">
        <div className="flex items-center justify-center w-full p-12">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-6">{appName}</h1>
            <p className="text-xl text-purple-100 max-w-md">
              The developer tool that helps you build better software, faster.
            </p>
            <div className="mt-12 space-y-4 text-left max-w-md">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-3" />
                <span>Lightning fast development</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-3" />
                <span>Enterprise-grade security</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-3" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-bold text-gradient-primary lg:hidden">
              {appName}
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Welcome back
            </h2>
            <p className="mt-2 text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link href="/forgot-password" className="text-purple-600 hover:text-purple-500">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-purple-600 hover:text-purple-500 font-medium">
                Sign up for free
              </Link>
            </p>
          </div>

          {/* Demo credentials for development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600 mb-2">Demo credentials:</p>
              <div className="text-xs space-y-1 text-gray-500">
                <div>Email: admin@example.com</div>
                <div>Password: admin123</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEmail('admin@example.com');
                  setPassword('admin123');
                }}
                className="mt-2 w-full"
              >
                Use Demo Account
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}