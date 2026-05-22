'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ResumenPerfil } from '@/components/ResumenPerfil';
import { getCurrentUser } from '@/lib/store';
import { Usuario } from '@/lib/types';
import { Plus, History, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUsuario(user);
    }
    setLoading(false);
  }, []);

  if (loading || !usuario) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  const puedeCrearPrestamo = 
    usuario.prestamosActivos.length === 0 && 
    !usuario.reportadoEnInfocorp &&
    usuario.saldoDisponible > 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header titulo="Panel de Control" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Resumen de perfil */}
          <ResumenPerfil usuario={usuario} />

          {/* Botones de acción */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Button
              onClick={() => router.push('/solicitar-prestamo')}
              disabled={!puedeCrearPrestamo}
              className="h-12 text-base"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Solicitar Nuevo Préstamo
            </Button>
            <Button
              onClick={() => router.push('/mis-prestamos')}
              variant="outline"
              className="h-12 text-base"
              size="lg"
            >
              <History className="h-5 w-5 mr-2" />
              Mis Préstamos
            </Button>
          </div>

          {/* Alerta si no puede crear préstamo */}
          {!puedeCrearPrestamo && (
            <Card className="mb-8 border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-yellow-900">
                    {usuario.reportadoEnInfocorp 
                      ? 'Cuenta suspendida'
                      : usuario.prestamosActivos.length > 0
                      ? 'Tienes un préstamo activo'
                      : 'Sin saldo disponible'
                    }
                  </p>
                  <p className="text-sm text-yellow-800 mt-1">
                    {usuario.reportadoEnInfocorp 
                      ? 'Tu cuenta ha sido reportada en Infocorp. Contacta a nuestro equipo para regularizar tu situación.'
                      : usuario.prestamosActivos.length > 0
                      ? 'Paga tu préstamo actual para solicitar otro.'
                      : 'Tu nivel no tiene monto disponible actualmente.'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Préstamos activos */}
          {usuario.prestamosActivos.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Préstamos Activos</h2>
              <div className="space-y-4">
                {usuario.prestamosActivos.map((prestamo) => {
                  const ahora = new Date();
                  const vencimiento = new Date(prestamo.fechaVencimiento);
                  const diasRestantes = Math.ceil((vencimiento.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
                  const estaVencido = diasRestantes < 0;
                  const montoConInteres = prestamo.monto * (1 + prestamo.tasaInteres / 100);

                  return (
                    <Card key={prestamo.id} className="border-primary/20">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">
                              Préstamo - Nivel {prestamo.nivelPrestamo}
                            </CardTitle>
                            <CardDescription>
                              ID: {prestamo.id.slice(-8)}
                            </CardDescription>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            estaVencido
                              ? 'bg-destructive/10 text-destructive'
                              : diasRestantes <= 5
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {estaVencido
                              ? '⚠️ VENCIDO'
                              : diasRestantes <= 0
                              ? '⏰ HOY VENCE'
                              : `${diasRestantes}d restantes`
                            }
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Monto Solicitado</p>
                            <p className="font-semibold">S/ {prestamo.monto.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Con Interés ({prestamo.tasaInteres}%)</p>
                            <p className="font-semibold">S/ {montoConInteres.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Fecha Vencimiento</p>
                            <p className="font-semibold">{new Date(prestamo.fechaVencimiento).toLocaleDateString('es-PE')}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Estado</p>
                            <p className="font-semibold text-primary">Activo</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => router.push('/mis-prestamos')}
                          className="w-full"
                        >
                          Pagar Préstamo
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Historial de préstamos */}
          {usuario.historicoCredito.filter(p => p.estado !== 'ACTIVO').length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Historial de Crédito</h2>
              <div className="space-y-3">
                {usuario.historicoCredito
                  .filter(p => p.estado !== 'ACTIVO')
                  .slice(-5)
                  .map((prestamo) => (
                    <Card key={prestamo.id} className="bg-secondary/5">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-sm">
                              S/ {prestamo.monto} - Nivel {prestamo.nivelPrestamo}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(prestamo.fechaDesembolso).toLocaleDateString('es-PE')}
                            </p>
                          </div>
                          <div className={`px-3 py-1 rounded text-xs font-medium ${
                            prestamo.estado === 'PAGADO'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-destructive/10 text-destructive'
                          }`}>
                            {prestamo.estado === 'PAGADO' ? '✓ Pagado' : 'Vencido'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
