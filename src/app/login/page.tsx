'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToastError, useToastSuccess } from '@/components/ui/Toast';

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
        throw new Error(data.error || 'Login mislukt');
      }

      showSuccess('Ingelogd', 'Welkom terug!');
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      showError('Login mislukt', error instanceof Error ? error.message : 'Probeer opnieuw');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Leads Dashboard
          </h1>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">Inloggen</h2>
          <p className="mt-2 text-gray-600">Log in om je leads te beheren</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="je@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Wachtwoord
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Wachtwoord"
              />
            </div>

            <Button type="submit" loading={loading} className="w-full">
              {loading ? 'Inloggen...' : 'Inloggen'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Nog geen account?{' '}
              <Link href="/register" className="text-purple-600 hover:text-purple-500 font-medium">
                Registreren
              </Link>
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600 mb-2">Demo credentials:</p>
              <div className="text-xs space-y-1 text-gray-500">
                <div>Email: admin@example.com</div>
                <div>Password: admin123</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setEmail('admin@example.com'); setPassword('admin123'); }}
                className="mt-2 w-full"
              >
                Demo account gebruiken
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
