import { authApi, creditApi, setAuthToken, type ApiError } from '@/lib/api';
import {
  crearPrestamo as crearPrestamoLocal,
  marcarPrestamoVencido as marcarPrestamoVencidoLocal,
  pagarPrestamo as pagarPrestamoLocal,
  setCurrentUser,
  crearUsuario as crearUsuarioLocal,
  obtenerUsuarioPorDNI as obtenerUsuarioPorDNIlocal,
  evaluarUsuario as evaluarUsuarioLocal,
} from '@/lib/store';
import type { Prestamo, ReporteEvaluacion, Usuario } from '@/lib/types';

const API_ENABLED = Boolean(process.env.NEXT_PUBLIC_API_BASE_URL?.trim());
const ALLOW_LOCAL_FALLBACK = process.env.NEXT_PUBLIC_ENABLE_LOCAL_FALLBACK !== 'false';

function fallbackToLocalStore(message: string, error: unknown): never {
  if (!ALLOW_LOCAL_FALLBACK) {
    throw error instanceof Error ? error : new Error(message);
  }

  throw error instanceof Error ? error : new Error(message);
}

export async function registrarUsuario(datos: {
  nombres: string;
  apellidos: string;
  dni: string;
  email: string;
  telefono: string;
}): Promise<Usuario> {
  if (!API_ENABLED) {
    return crearUsuarioLocal(datos);
  }

  try {
    const response = await authApi.register(datos);
    setAuthToken(response.token);
    setCurrentUser(response.user);
    return response.user;
  } catch (error) {
    console.warn('[fiapeService] register failed', error);
    if (ALLOW_LOCAL_FALLBACK) {
      return crearUsuarioLocal(datos);
    }
    throw error instanceof Error ? error : new Error('No se pudo registrar el usuario');
  }
}

export async function iniciarSesion(dni: string, email: string): Promise<Usuario> {
  if (!API_ENABLED) {
    const usuario = obtenerUsuarioPorDNIlocal(dni);
    if (!usuario || usuario.email !== email) {
      throw new Error('DNI o email no encontrado');
    }
    setCurrentUser(usuario);
    return usuario;
  }

  try {
    const response = await authApi.login({ dni, email });
    setAuthToken(response.token);
    setCurrentUser(response.user);
    return response.user;
  } catch (error) {
    console.warn('[fiapeService] login failed', error);
    if (ALLOW_LOCAL_FALLBACK) {
      const usuario = obtenerUsuarioPorDNIlocal(dni);
      if (!usuario || usuario.email !== email) {
        throw new Error('DNI o email no encontrado');
      }
      setCurrentUser(usuario);
      return usuario;
    }
    throw error instanceof Error ? error : new Error('No se pudo iniciar sesión');
  }
}

export async function evaluarUsuarioBackend(usuario: Usuario): Promise<ReporteEvaluacion> {
  if (!API_ENABLED) {
    return evaluarUsuarioLocal(usuario, usuario.dni);
  }

  try {
    const response = await creditApi.evaluate({ usuarioId: usuario.id });
    setCurrentUser(response.user);
    return response.reporte;
  } catch (error) {
    console.warn('[fiapeService] evaluate failed', error);
    if (ALLOW_LOCAL_FALLBACK) {
      return evaluarUsuarioLocal(usuario, usuario.dni);
    }
    throw error instanceof Error ? error : new Error('No se pudo evaluar el usuario');
  }
}

export async function crearPrestamoBackend(usuarioId: string, monto: number): Promise<Prestamo> {
  if (!API_ENABLED) {
    return crearPrestamoLocal(usuarioId, monto);
  }

  try {
    const response = await creditApi.createLoan({ usuarioId, monto });
    setCurrentUser(response.user);
    return response.prestamo;
  } catch (error) {
    console.warn('[fiapeService] create loan failed', error);
    if (ALLOW_LOCAL_FALLBACK) {
      return crearPrestamoLocal(usuarioId, monto);
    }
    throw error instanceof Error ? error : new Error('No se pudo crear el préstamo');
  }
}

export async function pagarPrestamoBackend(usuarioId: string, prestamoId: string, monto: number): Promise<void> {
  if (!API_ENABLED) {
    pagarPrestamoLocal(usuarioId, prestamoId, monto);
    return;
  }

  try {
    const response = await creditApi.payLoan({ usuarioId, prestamoId, monto });
    setCurrentUser(response.user);
  } catch (error) {
    console.warn('[fiapeService] pay loan failed', error);
    if (ALLOW_LOCAL_FALLBACK) {
      pagarPrestamoLocal(usuarioId, prestamoId, monto);
      return;
    }
    throw error instanceof Error ? error : new Error('No se pudo procesar el pago');
  }
}

export async function marcarPrestamoVencidoBackend(usuarioId: string, prestamoId: string): Promise<void> {
  if (!API_ENABLED) {
    marcarPrestamoVencidoLocal(usuarioId, prestamoId);
    return;
  }

  try {
    const response = await creditApi.markOverdue({ usuarioId, prestamoId });
    setCurrentUser(response.user);
  } catch (error) {
    console.warn('[fiapeService] overdue loan failed', error);
    if (ALLOW_LOCAL_FALLBACK) {
      marcarPrestamoVencidoLocal(usuarioId, prestamoId);
      return;
    }
    throw error instanceof Error ? error : new Error('No se pudo marcar el préstamo como vencido');
  }
}
