'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getCurrentUser, evaluarUsuario } from '@/lib/store';
import { Usuario, ReporteEvaluacion } from '@/lib/types';
import { AlertCircle, CheckCircle, TrendingUp, Zap } from 'lucide-react';

export default function EvaluacionPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluando, setEvaluando] = useState(false);
  const [reporte, setReporte] = useState<ReporteEvaluacion | null>(null);
  const [completado, setCompletado] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUsuario(user);
      setLoading(false);
    }
  }, []);

  const handleEvaluar = async () => {
    if (!usuario) return;

    setEvaluando(true);
    
    // Simular delay de evaluación (2 segundos)
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const nuevoReporte = evaluarUsuario(usuario, usuario.dni);
      setReporte(nuevoReporte);
      setCompletado(true);
      
      // Actualizar usuario en estado
      const usuarioActualizado = getCurrentUser();
      if (usuarioActualizado) {
        setUsuario(usuarioActualizado);
      }
    } catch (err) {
      console.error('Error en evaluación:', err);
    } finally {
      setEvaluando(false);
    }
  };

  const handleContinuar = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <ProtectedRoute requiereEvaluacion={true}>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-background py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Fiape</h1>
            <p className="text-muted-foreground">Evaluación de Crédito Inteligente</p>
          </div>

          {!completado ? (
            <>
              {/* Tarjeta de evaluación */}
              <Card className="mb-6 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-accent" />
                    Sistema de IA de Evaluación
                  </CardTitle>
                  <CardDescription>
                    Analizaremos tu perfil crediticio usando tecnología de inteligencia artificial
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Información del usuario */}
                  <div className="bg-secondary/10 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-2">Datos a evaluar:</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-foreground">Nombre:</span>
                        <p className="text-muted-foreground">{usuario?.nombres} {usuario?.apellidos}</p>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">DNI:</span>
                        <p className="text-muted-foreground">****{usuario?.dni.slice(-4)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Email:</span>
                        <p className="text-muted-foreground text-xs truncate">{usuario?.email}</p>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Teléfono:</span>
                        <p className="text-muted-foreground">****{usuario?.telefono.slice(-4)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Información sobre el análisis */}
                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                    <p className="text-sm text-foreground mb-2">
                      ✓ El análisis incluye:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Validación de identidad (DNI)</li>
                      <li>• Análisis de patrones crediticios</li>
                      <li>• Determinación de nivel de riesgo</li>
                      <li>• Asignación de nivel inicial</li>
                    </ul>
                  </div>

                  {/* Botón de evaluación */}
                  <Button 
                    onClick={handleEvaluar}
                    disabled={evaluando}
                    className="w-full h-12 text-base"
                    size="lg"
                  >
                    {evaluando ? (
                      <>
                        <span className="inline-block animate-spin mr-2">⚙️</span>
                        Analizando tu perfil...
                      </>
                    ) : (
                      'Iniciar Evaluación'
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Información adicional */}
              <Card className="bg-secondary/5 border-secondary/20">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground text-center">
                    Esto solo tomará unos segundos. Tus datos están protegidos y seguros.
                  </p>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Resultado de evaluación */}
              <div className="space-y-6">
                {/* Score crediticio */}
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Evaluación Completada
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Score */}
                    <div className="flex justify-center">
                      <div className="relative w-40 h-40">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-secondary/30"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeDasharray={`${(reporte?.scoreCrediticio || 0) * 2.83} 283`}
                            className="text-primary transition-all duration-1000"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold text-primary">{reporte?.scoreCrediticio || 0}</span>
                          <span className="text-xs text-muted-foreground">de 100</span>
                        </div>
                      </div>
                    </div>

                    {/* Clasificación */}
                    <div className="text-center">
                      <div className={`inline-block px-4 py-2 rounded-full font-semibold text-sm ${
                        reporte?.clasificacion === 'CON_HISTORIAL'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {reporte?.clasificacion === 'CON_HISTORIAL'
                          ? '✓ CON HISTORIAL CREDITICIO'
                          : '○ SIN HISTORIAL CREDITICIO'}
                      </div>
                    </div>

                    {/* Detalles */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-secondary/10 rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-1">Nivel Inicial</p>
                        <p className="text-2xl font-bold text-primary">{reporte?.nivelInicial}</p>
                        <p className="text-xs text-muted-foreground mt-1">de 10 niveles</p>
                      </div>
                      <div className="bg-secondary/10 rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-1">Monto Máximo</p>
                        <p className="text-2xl font-bold text-primary">S/ {reporte?.montoMaximo}</p>
                        <p className="text-xs text-muted-foreground mt-1">disponible ahora</p>
                      </div>
                      <div className="bg-secondary/10 rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-1">Tasa de Interés</p>
                        <p className="text-2xl font-bold text-accent">{reporte?.tasaInteres}%</p>
                        <p className="text-xs text-muted-foreground mt-1">anual</p>
                      </div>
                      <div className="bg-secondary/10 rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-1">Estado</p>
                        <p className="text-2xl font-bold text-green-600">✓ Activo</p>
                        <p className="text-xs text-muted-foreground mt-1">listo para usar</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recomendaciones */}
                {reporte?.recomendaciones && (
                  <Card className="border-accent/20 bg-accent/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="h-5 w-5 text-accent" />
                        Recomendaciones
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {reporte.recomendaciones.map((rec, idx) => (
                          <li key={idx} className="flex gap-2 text-sm text-foreground">
                            <span className="text-accent font-bold">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Botón continuar */}
                <Button 
                  onClick={handleContinuar}
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  Continuar a Dashboard
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
