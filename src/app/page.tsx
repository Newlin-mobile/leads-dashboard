import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center max-w-lg mx-auto px-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          <span className="bg-gradient-primary bg-clip-text text-transparent">Leads Dashboard</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Track je sales leads, manage je pipeline en hou overzicht over je acquisitie.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" className="text-lg px-8">
              Inloggen
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg" className="text-lg px-8">
              Account aanmaken
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
