'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getCurrentUser, pagarPrestamo, marcarPrestamoVencido } from '@/lib/store';
import { Usuario, Prestamo } from '@/lib/types';
import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

export default function MisPrestamoosPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState<Prestamo | null>(null);
  const [montoPago, setMontoPago] = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUsuario(user);
      if (user.prestamosActivos.length > 0) {
        setPrestamoSeleccionado(user.prestamosActivos[0]);
      }
    }
    setLoading(false);
  }, []);

  if (loading || !usuario) {
    return <div>Cargando...</div>;
  }

  const handlePagar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (!prestamoSeleccionado) {
      setError('Selecciona un préstamo');
      return;
    }

    const montoNumerico = parseFloat(montoPago) || 0;
    const montoConInteres = prestamoSeleccionado.monto * (1 + prestamoSeleccionado.tasaInteres / 100);

    if (montoNumerico <= 0) {
      setError('Ingresa un monto válido');
      return;
    }

    if (montoNumerico < montoConInteres) {
      setError(`Debes pagar al menos S/ ${montoConInteres.toFixed(2)} para liquidar completamente`);
      return;
    }

    setProcesando(true);
    try {
      const usuarioActual = getCurrentUser();
      if (!usuarioActual) {
        setError('Sesión expirada');
        return;
      }

      const ahora = new Date();
      const fechaVencimiento = new Date(prestamoSeleccionado.fechaVencimiento);
      const estaVencido = ahora > fechaVencimiento;

      if (estaVencido && !usuario.reportadoEnInfocorp) {
        marcarPrestamoVencido(usuarioActual.id, prestamoSeleccionado.id);
      } else {
        pagarPrestamo(usuarioActual.id, prestamoSeleccionado.id, montoNumerico);
      }

      const usuarioActualizado = getCurrentUser();
      if (usuarioActualizado) {
        setUsuario(usuarioActualizado);
      }

      setExito('Pago procesado exitosamente');
      setMontoPago('');
      setPrestamoSeleccionado(usuarioActualizado?.prestamosActivos[0] || null);

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al procesar el pago');
    } finally {
      setProcesando(false);
    }
  };

  const handleMarcarVencido = () => {
    if (!prestamoSeleccionado) return;

    if (confirm('¿Confirmas que no pagarás este préstamo? Esto afectará tu historial crediticio y serás reportado a Infocorp.')) {
      setProcesando(true);
      try {
        const usuarioActual = getCurrentUser();
        if (usuarioActual) {
          marcarPrestamoVencido(usuarioActual.id, prestamoSeleccionado.id);
          const usuarioActualizado = getCurrentUser();
          if (usuarioActualizado) {
            setUsuario(usuarioActualizado);
            setExito('El préstamo ha sido marcado como vencido y reportado');
            setTimeout(() => {
              router.push('/dashboard');
            }, 2000);
          }
        }
      } catch (err) {
        setError('Error al procesar');
      } finally {
        setProcesando(false);
      }
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header titulo="Gestión de Préstamos" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Préstamos activos */}
          {usuario.prestamosActivos.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold mb-4">Préstamos Activos</h2>
              <div className="grid gap-6">
                {usuario.prestamosActivos.map((prestamo) => {
                  const ahora = new Date();
                  const vencimiento = new Date(prestamo.fechaVencimiento);
                  const diasRestantes = Math.ceil((vencimiento.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
                  const estaVencido = diasRestantes < 0;
                  const montoConInteres = prestamo.monto * (1 + prestamo.tasaInteres / 100);
                  const esSeleccionado = prestamoSeleccionado?.id === prestamo.id;

                  return (
                    <Card
                      key={prestamo.id}
                      className={`cursor-pointer transition-all ${
                        esSeleccionado
                          ? 'border-primary ring-2 ring-primary/50'
                          : 'border-border'
                      }`}
                      onClick={() => setPrestamoSeleccionado(prestamo)}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              Préstamo - Nivel {prestamo.nivelPrestamo}
                            </CardTitle>
                            <CardDescription>
                              ID: {prestamo.id.slice(-8)} • Desembolsado: {new Date(prestamo.fechaDesembolso).toLocaleDateString('es-PE')}
                            </CardDescription>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                            estaVencido
                              ? 'bg-destructive/10 text-destructive'
                              : diasRestantes <= 5
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {estaVencido ? (
                              <>
                                <AlertCircle className="h-3 w-3" />
                                VENCIDO
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3" />
                                {diasRestantes}d restantes
                              </>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Detalles del préstamo */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Monto</p>
                            <p className="text-lg font-bold">S/ {prestamo.monto.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Interés ({prestamo.tasaInteres}%)</p>
                            <p className="text-lg font-bold text-accent">
                              S/ {(montoConInteres - prestamo.monto).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Total a Pagar</p>
                            <p className="text-lg font-bold text-primary">S/ {montoConInteres.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Fecha Vencimiento</p>
                            <p className="text-lg font-bold">{vencimiento.toLocaleDateString('es-PE')}</p>
                          </div>
                        </div>

                        {/* Formulario de pago - solo si está seleccionado */}
                        {esSeleccionado && (
                          <div className="border-t pt-6">
                            <form onSubmit={handlePagar} className="space-y-4">
                              {error && (
                                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                                  <AlertCircle className="h-4 w-4" />
                                  {error}
                                </div>
                              )}

                              {exito && (
                                <div className="flex items-center gap-2 p-3 bg-green-100 text-green-800 rounded-md text-sm">
                                  <CheckCircle className="h-4 w-4" />
                                  {exito}
                                </div>
                              )}

                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  Monto a Pagar
                                </label>
                                <div className="flex gap-2">
                                  <Input
                                    type="number"
                                    min={montoConInteres}
                                    step="0.01"
                                    placeholder={montoConInteres.toFixed(2)}
                                    value={montoPago}
                                    onChange={(e) => setMontoPago(e.target.value)}
                                    className="flex-1"
                                  />
                                  <span className="flex items-center text-muted-foreground font-medium">S/</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                  Mínimo requerido: S/ {montoConInteres.toFixed(2)}
                                </p>
                              </div>

                              {/* Botones de acción rápida */}
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setMontoPago(montoConInteres.toString())}
                                >
                                  Monto Exacto
                                </Button>
                              </div>

                              {/* Resumen si hay monto ingresado */}
                              {montoPago && (
                                <Card className="bg-secondary/5 border-secondary/20">
                                  <CardContent className="pt-4">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-muted-foreground">Pagarás:</span>
                                      <span className="text-lg font-bold text-primary">
                                        S/ {parseFloat(montoPago).toFixed(2)}
                                      </span>
                                    </div>
                                    {parseFloat(montoPago) > montoConInteres && (
                                      <p className="text-xs text-muted-foreground mt-2">
                                        Se abonará S/ {(parseFloat(montoPago) - montoConInteres).toFixed(2)} al saldo disponible
                                      </p>
                                    )}
                                  </CardContent>
                                </Card>
                              )}

                              <div className="flex gap-2">
                                <Button
                                  type="submit"
                                  disabled={!montoPago || procesando}
                                  className="flex-1"
                                >
                                  {procesando ? 'Procesando...' : 'Confirmar Pago'}
                                </Button>
                                {estaVencido && (
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleMarcarVencido}
                                    disabled={procesando}
                                  >
                                    No Pagar
                                  </Button>
                                )}
                              </div>

                              {estaVencido && (
                                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                                  <p className="text-xs text-destructive font-medium">
                                    ⚠️ Este préstamo está vencido. Si no lo pagas, serás reportado a Infocorp.
                                  </p>
                                </div>
                              )}
                            </form>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <div className="inline-block bg-secondary/10 rounded-full p-4 mb-4">
                  <TrendingUp className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No tienes préstamos activos</h2>
                <p className="text-muted-foreground mb-6">
                  Solicita tu primer préstamo para comenzar a construir tu historial crediticio
                </p>
                <Button onClick={() => router.push('/solicitar-prestamo')}>
                  Solicitar Préstamo
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Historial de crédito */}
          {usuario.historicoCredito.filter(p => p.estado !== 'ACTIVO').length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-4">Historial de Crédito</h2>
              <div className="space-y-3">
                {usuario.historicoCredito
                  .filter(p => p.estado !== 'ACTIVO')
                  .map((prestamo) => (
                    <Card key={prestamo.id} className="bg-secondary/5">
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
                          <div>
                            <p className="text-xs text-muted-foreground">Monto</p>
                            <p className="font-semibold">S/ {prestamo.monto}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Nivel</p>
                            <p className="font-semibold">{prestamo.nivelPrestamo}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Desembolsado</p>
                            <p className="font-semibold text-sm">{new Date(prestamo.fechaDesembolso).toLocaleDateString('es-PE')}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Puntos</p>
                            <p className={`font-semibold ${prestamo.puntosGanados > 0 ? 'text-green-600' : 'text-destructive'}`}>
                              {prestamo.puntosGanados > 0 ? '+' : ''}{prestamo.puntosGanados}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`inline-block px-3 py-1 rounded text-xs font-medium ${
                              prestamo.estado === 'PAGADO'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-destructive/10 text-destructive'
                            }`}>
                              {prestamo.estado === 'PAGADO' ? '✓ Pagado' : '✗ Vencido'}
                            </div>
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
