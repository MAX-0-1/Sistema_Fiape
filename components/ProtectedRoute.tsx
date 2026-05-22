'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/store';
import { Usuario } from '@/lib/types';

export function ProtectedRoute({ 
  children,
  requiereEvaluacion = false 
}: { 
  children: React.ReactNode;
  requiereEvaluacion?: boolean;
}) {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    
    if (!user) {
      router.push('/auth');
      return;
    }

    if (requiereEvaluacion && user.evaluado) {
      router.push('/dashboard');
      return;
    }

    if (!requiereEvaluacion && !user.evaluado) {
      router.push('/evaluacion');
      return;
    }

    setUsuario(user);
    setLoading(false);
  }, [router, requiereEvaluacion]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
