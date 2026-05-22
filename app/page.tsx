'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/store';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const usuario = getCurrentUser();
    
    if (!usuario) {
      router.push('/auth');
    } else if (!usuario.evaluado) {
      router.push('/evaluacion');
    } else {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Cargando Fiape...</p>
      </div>
    </div>
  );
}
