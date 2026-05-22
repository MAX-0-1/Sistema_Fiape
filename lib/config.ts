import { NivelCredito } from './types';

// Configuración de 10 niveles con montos e intereses decrecientes
export const NIVELES_CREDITO: NivelCredito[] = [
  { nivel: 1, monto: 30, tasaInteres: 20, puntosRequeridos: 0 },
  { nivel: 2, monto: 50, tasaInteres: 19, puntosRequeridos: 100 },
  { nivel: 3, monto: 75, tasaInteres: 18, puntosRequeridos: 250 },
  { nivel: 4, monto: 100, tasaInteres: 17, puntosRequeridos: 400 },
  { nivel: 5, monto: 150, tasaInteres: 16, puntosRequeridos: 550 },
  { nivel: 6, monto: 200, tasaInteres: 15, puntosRequeridos: 700 },
  { nivel: 7, monto: 300, tasaInteres: 14, puntosRequeridos: 850 },
  { nivel: 8, monto: 400, tasaInteres: 13, puntosRequeridos: 1000 },
  { nivel: 9, monto: 500, tasaInteres: 12, puntosRequeridos: 1150 },
  { nivel: 10, monto: 750, tasaInteres: 11, puntosRequeridos: 1300 },
];

// Configuración de puntos
export const PUNTOS_CONFIG = {
  PRESTAMO_PAGADO_A_TIEMPO: 200,
  PRESTAMO_PAGADO_CON_RETRASO: 50,
  PRESTAMO_IMPAGO: -500,
};

// Días de plazo para pagar un préstamo
export const DIAS_PLAZO_PRESTAMO = 30;

// Nivel inicial según tipo de historial
export const NIVEL_INICIAL = {
  CON_HISTORIAL: 5,
  SIN_HISTORIAL: 1,
};
