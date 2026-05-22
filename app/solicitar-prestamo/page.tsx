'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getCurrentUser, crearPrestamo } from '@/lib/store';
import { Usuario } from '@/lib/types';
import { NIVELES_CREDITO } from '@/lib/config';
import { AlertCircle, CheckCircle, DollarSign } from 'lucide-react';

export default function SolicitarPrestamoPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [monto, setMonto] = useState('');
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUsuario(user);
    }
    setLoading(false);
  }, []);

  if (loading || !usuario) {
    return <div>Cargando...</div>;
  }

  const nivelConfig = NIVELES_CREDITO[usuario.nivelActual - 1];
  const montoNumerico = parseFloat(monto) || 0;
  const tasaInteres = nivelConfig.tasaInteres;
  const interesesCalculados = montoNumerico * (tasaInteres / 100);
  const montoTotal = montoNumerico + interesesCalculados;
  const diasPlazo = 30;
  const fechaVencimiento = new Date();
  fechaVencimiento.setDate(fechaVencimiento.getDate() + diasPlazo);

  const puedeGestionar =
    usuario.prestamosActivos.length === 0 &&
    !usuario.reportadoEnInfocorp &&
    montoNumerico > 0 &&
    montoNumerico <= nivelConfig.monto;

  const handleSolicitar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setExito(false);

    // Validaciones
    if (!monto || montoNumerico <= 0) {
      setError('Ingresa un monto válido');
      return;
    }

    if (montoNumerico > nivelConfig.monto) {
      setError(`El monto máximo para tu nivel es S/ ${nivelConfig.monto}`);
      return;
    }

    if (usuario.prestamosActivos.length > 0) {
      setError('Ya tienes un préstamo activo');
      return;
    }

    if (usuario.reportadoEnInfocorp) {
      setError('Tu cuenta está suspendida');
      return;
    }

    setProcesando(true);
    try {
      const nuevoUsuario = getCurrentUser();
      if (!nuevoUsuario) {
        setError('Sesión expirada');
        return;
      }

      crearPrestamo(nuevoUsuario.id, montoNumerico);
      setExito(true);
      setMonto('');

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al crear el préstamo');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header titulo="Solicitar Préstamo" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!exito ? (
            <>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Solicitud de Préstamo</CardTitle>
                  <CardDescription>
                    Configura el monto que deseas solicitar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSolicitar} className="space-y-6">
                    {error && (
                      <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                      </div>
                    )}

                    {/* Información del nivel */}
                    <div className="bg-secondary/10 rounded-lg p-4 space-y-3">
                      <p className="text-sm font-semibold">Tu Nivel: {usuario.nivelActual}</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Monto Máximo</p>
                          <p className="font-semibold">S/ {nivelConfig.monto}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Tasa de Interés</p>
                          <p className="font-semibold">{nivelConfig.tasaInteres}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Plazo</p>
                          <p className="font-semibold">{diasPlazo} días</p>
                        </div>
                      </div>
                    </div>

                    {/* Selector de monto */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <DollarSign className="inline h-4 w-4 mr-1" />
                        Monto a Solicitar
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="1"
                          max={nivelConfig.monto}
                          step="1"
                          placeholder="Ingresa el monto"
                          value={monto}
                          onChange={(e) => setMonto(e.target.value)}
                          className="flex-1"
                        />
                        <span className="flex items-center text-muted-foreground font-medium">S/</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Monto disponible: S/ {usuario.saldoDisponible} - Máximo: S/ {nivelConfig.monto}
                      </p>
                    </div>

                    {/* Selector rápido de montos */}
                    {montoNumerico === 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">O elige un monto rápido:</p>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            Math.round(nivelConfig.monto * 0.25),
                            Math.round(nivelConfig.monto * 0.5),
                            nivelConfig.monto,
                          ].map((m) => (
                            <Button
                              key={m}
                              type="button"
                              variant="outline"
                              onClick={() => setMonto(m.toString())}
                              className="text-sm"
                            >
                              S/ {m}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resumen del préstamo */}
                    {montoNumerico > 0 && (
                      <Card className="bg-accent/5 border-accent/20">
                        <CardHeader>
                          <CardTitle className="text-base">Resumen de tu Préstamo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Monto Solicitado</p>
                              <p className="text-lg font-bold">S/ {montoNumerico.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Intereses ({tasaInteres}%)</p>
                              <p className="text-lg font-bold text-accent">S/ {interesesCalculados.toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="border-t border-accent/20 pt-3">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">Monto Total a Pagar</span>
                              <span className="text-xl font-bold text-primary">S/ {montoTotal.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="bg-background/50 rounded p-2 text-xs text-muted-foreground">
                            <p>Fecha de Vencimiento: {fechaVencimiento.toLocaleDateString('es-PE')}</p>
                            <p>Plazo: {diasPlazo} días desde hoy</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Términos y condiciones */}
                    <div className="bg-secondary/5 rounded-lg p-4 text-xs text-muted-foreground">
                      <p className="font-semibold mb-2">Términos importantes:</p>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>El préstamo debe ser pagado en su totalidad dentro del plazo</li>
                        <li>Los pagos tardíos afectarán tus puntos y tu historial crediticio</li>
                        <li>En caso de incumplimiento, serás reportado a Infocorp</li>
                        <li>Solo puedes tener un préstamo activo a la vez</li>
                      </ul>
                    </div>

                    <Button
                      type="submit"
                      disabled={!puedeGestionar || procesando}
                      className="w-full h-12 text-base"
                      size="lg"
                    >
                      {procesando ? 'Procesando...' : 'Confirmar Solicitud'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="inline-block bg-green-100 rounded-full p-4 mb-4">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Préstamo Aprobado
                </h2>
                <p className="text-green-800 mb-6">
                  Tu préstamo por S/ {montoNumerico.toFixed(2)} ha sido desembolsado exitosamente.
                  Vencimiento: {fechaVencimiento.toLocaleDateString('es-PE')}
                </p>
                <p className="text-sm text-green-700">
                  Redirigiendo al dashboard...
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
