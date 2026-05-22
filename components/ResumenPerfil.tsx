import { Usuario } from '@/lib/types';
import { NIVELES_CREDITO } from '@/lib/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Star, AlertTriangle } from 'lucide-react';

export function ResumenPerfil({ usuario }: { usuario: Usuario }) {
  const nivelConfig = NIVELES_CREDITO[usuario.nivelActual - 1];
  const proximoNivel = usuario.nivelActual < 10 ? NIVELES_CREDITO[usuario.nivelActual] : null;
  
  const porcentajePuntos = proximoNivel
    ? Math.min((usuario.puntosTotal / proximoNivel.puntosRequeridos) * 100, 100)
    : 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Perfil del usuario */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mi Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Nombre</p>
            <p className="font-semibold">{usuario.nombres} {usuario.apellidos}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Nivel de Historial</p>
            <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
              usuario.tipoHistorial === 'CON_HISTORIAL'
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {usuario.tipoHistorial === 'CON_HISTORIAL' ? '✓ CON HISTORIAL' : '○ SIN HISTORIAL'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nivel actual y progreso */}
      <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Mi Nivel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-2xl font-bold text-primary">{usuario.nivelActual}</span>
              <span className="text-xs text-muted-foreground">{usuario.nivelActual}/10</span>
            </div>
            <div className="w-full bg-secondary/20 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(usuario.nivelActual / 10) * 100}%` }}
              />
            </div>
          </div>
          {proximoNivel && (
            <p className="text-xs text-muted-foreground">
              Próximo nivel requiere {proximoNivel.puntosRequeridos} puntos
            </p>
          )}
        </CardContent>
      </Card>

      {/* Saldo disponible */}
      <Card className="bg-gradient-to-br from-accent/5 to-transparent border-accent/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Monto Disponible
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-accent">S/ {usuario.saldoDisponible.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">
              Máximo por nivel: S/ {nivelConfig.monto}
            </p>
            <p className="text-xs text-muted-foreground">
              Tasa de interés: {nivelConfig.tasaInteres}%
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Puntos y progreso */}
      <Card className="bg-gradient-to-br from-secondary/5 to-transparent border-secondary/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="h-4 w-4" />
            Puntos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-2xl font-bold text-primary">{usuario.puntosTotal}</span>
              {proximoNivel && (
                <span className="text-xs text-muted-foreground">
                  {Math.max(0, proximoNivel.puntosRequeridos - usuario.puntosTotal)} para siguiente nivel
                </span>
              )}
            </div>
            {proximoNivel && (
              <div className="w-full bg-secondary/20 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${porcentajePuntos}%` }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alerta si está reportado */}
      {usuario.reportadoEnInfocorp && (
        <Card className="md:col-span-2 bg-destructive/10 border-destructive/20">
          <CardContent className="pt-6 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm text-destructive">Reportado en Infocorp</p>
              <p className="text-xs text-destructive/80">No puedes solicitar nuevos préstamos hasta regularizar tu situación</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
