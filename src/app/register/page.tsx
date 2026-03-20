'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToastError, useToastSuccess } from '@/components/ui/Toast';
import { validateEmail, validatePassword } from '@/lib/utils';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const showError = useToastError();
  const showSuccess = useToastSuccess();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = 'Naam is verplicht';
    if (!email) newErrors.email = 'Email is verplicht';
    else if (!validateEmail(email)) newErrors.email = 'Ongeldig email adres';
    if (!password) newErrors.password = 'Wachtwoord is verplicht';
    else {
      const pw = validatePassword(password);
      if (!pw.valid) newErrors.password = pw.errors[0];
    }
    if (password !== confirmPassword) newErrors.confirmPassword = 'Wachtwoorden komen niet overeen';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registratie mislukt');

      showSuccess('Account aangemaakt', 'Welkom!');
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      showError('Registratie mislukt', error instanceof Error ? error.message : 'Probeer opnieuw');
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
          <h2 className="mt-4 text-3xl font-bold text-gray-900">Registreren</h2>
          <p className="mt-2 text-gray-600">Maak een account aan</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Naam</label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Je naam" />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="je@email.com" />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Wachtwoord</label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 tekens" />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Bevestig wachtwoord</label>
              <Input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Herhaal wachtwoord" />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>
            <Button type="submit" loading={loading} className="w-full">
              {loading ? 'Aanmaken...' : 'Account aanmaken'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Al een account?{' '}
              <Link href="/login" className="text-purple-600 hover:text-purple-500 font-medium">
                Inloggen
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
