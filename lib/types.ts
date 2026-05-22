// Tipos y interfaces para Fiape

export type HistorialCrediticio = 'CON_HISTORIAL' | 'SIN_HISTORIAL';
export type EstadoPrestamo = 'ACTIVO' | 'PAGADO' | 'VENCIDO';

export interface Usuario {
  id: string;
  nombres: string;
  apellidos: string;
  dni: string; // único
  email: string;
  telefono: string;
  fechaRegistro: string;
  evaluado: boolean;
  tipoHistorial: HistorialCrediticio | null;
  nivelActual: number; // 1-10
  saldoDisponible: number;
  puntosTotal: number;
  prestamosActivos: Prestamo[];
  historicoCredito: Prestamo[];
  reportadoEnInfocorp: boolean;
}

export interface Prestamo {
  id: string;
  usuarioId: string;
  monto: number;
  tasaInteres: number;
  nivelPrestamo: number;
  fechaDesembolso: string;
  fechaVencimiento: string;
  estado: EstadoPrestamo;
  montoPagado: number;
  puntosGanados: number;
  puntosDescuentados: number;
}

export interface NivelCredito {
  nivel: number;
  monto: number;
  tasaInteres: number;
  puntosRequeridos: number;
}

export interface ReporteEvaluacion {
  scoreCrediticio: number;
  clasificacion: HistorialCrediticio;
  nivelInicial: number;
  montoMaximo: number;
  tasaInteres: number;
  recomendaciones: string[];
}
