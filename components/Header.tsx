'use client';

import { Button } from '@/components/ui/button';
import { setCurrentUser } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export function Header({ titulo }: { titulo: string }) {
  const router = useRouter();

  const handleLogout = () => {
    setCurrentUser(null);
    router.push('/auth');
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Fiape</h1>
          <p className="text-sm opacity-90">{titulo}</p>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar sesión
        </Button>
      </div>
    </header>
  );
}
