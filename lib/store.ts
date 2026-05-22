import { Usuario, Prestamo } from './types';
import { NIVEL_INICIAL, PUNTOS_CONFIG, NIVELES_CREDITO, DIAS_PLAZO_PRESTAMO } from './config';

const STORAGE_KEY = 'fiape_data';
const CURRENT_USER_KEY = 'fiape_current_user';

interface StorageData {
  usuarios: Usuario[];
}

// Inicializar storage
function getStorageData(): StorageData {
  if (typeof window === 'undefined') {
    return { usuarios: [] };
  }
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { usuarios: [] };
  } catch {
    return { usuarios: [] };
  }
}

function saveStorageData(data: StorageData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    console.error('[v0] Error al guardar datos en localStorage');
  }
}

// Usuario actual (sesión)
export function getCurrentUser(): Usuario | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(usuario: Usuario | null) {
  if (typeof window === 'undefined') return;
  
  try {
    if (usuario) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(usuario));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch {
    console.error('[v0] Error al establecer usuario actual');
  }
}

// Crear usuario
export function crearUsuario(datos: {
  nombres: string;
  apellidos: string;
  dni: string;
  email: string;
  telefono: string;
}): Usuario {
  const storage = getStorageData();
  
  // Verificar que el DNI no exista
  if (storage.usuarios.some(u => u.dni === datos.dni)) {
    throw new Error('Este DNI ya está registrado');
  }

  const nuevoUsuario: Usuario = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...datos,
    fechaRegistro: new Date().toISOString(),
    evaluado: false,
    tipoHistorial: null,
    nivelActual: 1,
    saldoDisponible: 0,
    puntosTotal: 0,
    prestamosActivos: [],
    historicoCredito: [],
    reportadoEnInfocorp: false,
  };

  storage.usuarios.push(nuevoUsuario);
  saveStorageData(storage);
  setCurrentUser(nuevoUsuario);

  return nuevoUsuario;
}

// Obtener usuario por DNI
export function obtenerUsuarioPorDNI(dni: string): Usuario | undefined {
  const storage = getStorageData();
  return storage.usuarios.find(u => u.dni === dni);
}

// Actualizar usuario
export function actualizarUsuario(usuario: Usuario) {
  const storage = getStorageData();
  const index = storage.usuarios.findIndex(u => u.id === usuario.id);
  
  if (index !== -1) {
    storage.usuarios[index] = usuario;
    saveStorageData(storage);
    setCurrentUser(usuario);
  }
}

// Evaluar usuario (IA simulada)
export function evaluarUsuario(usuario: Usuario, dni: string) {
  // Algoritmo determinístico basado en los últimos 3 dígitos del DNI
  const ultimos3Digitos = dni.slice(-3);
  const suma = ultimos3Digitos.split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  
  // Si la suma es par: CON_HISTORIAL, si es impar: SIN_HISTORIAL
  const tipoHistorial = suma % 2 === 0 ? 'CON_HISTORIAL' as const : 'SIN_HISTORIAL' as const;
  
  // Calcular score crediticio (0-100) basado en el patrón del DNI
  const scoreCrediticio = ((suma * 7) % 100);
  
  // Establecer nivel inicial según tipo de historial
  const nivelInicial = NIVEL_INICIAL[tipoHistorial];
  const nivelConfig = NIVELES_CREDITO[nivelInicial - 1];
  
  // Actualizar usuario
  const usuarioActualizado = {
    ...usuario,
    evaluado: true,
    tipoHistorial,
    nivelActual: nivelInicial,
    saldoDisponible: nivelConfig.monto,
  };

  actualizarUsuario(usuarioActualizado);

  return {
    scoreCrediticio,
    clasificacion: tipoHistorial,
    nivelInicial,
    montoMaximo: nivelConfig.monto,
    tasaInteres: nivelConfig.tasaInteres,
    recomendaciones: 
      tipoHistorial === 'CON_HISTORIAL'
        ? [
            'Tienes acceso a créditos de mayor monto',
            'Tu tasa de interés inicial es competitiva',
            'Mantén tus pagos al día para seguir progresando',
          ]
        : [
            'Comienza con montos pequeños para ganar confianza',
            'Cada pago a tiempo te acerca a mejores condiciones',
            'Progresa de nivel según tu desempeño',
          ],
  };
}

// Crear préstamo
export function crearPrestamo(usuarioId: string, monto: number): Prestamo {
  const storage = getStorageData();
  const usuario = storage.usuarios.find(u => u.id === usuarioId);
  
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  // Validar que el usuario no tenga más de 1 préstamo activo
  if (usuario.prestamosActivos.length > 0) {
    throw new Error('Ya tienes un préstamo activo. Paga primero para solicitar otro.');
  }

  // Validar que el monto no exceda el máximo del nivel
  const nivelConfig = NIVELES_CREDITO[usuario.nivelActual - 1];
  if (monto > nivelConfig.monto) {
    throw new Error(`El monto máximo para tu nivel es S/ ${nivelConfig.monto}`);
  }

  const ahora = new Date();
  const vencimiento = new Date(ahora);
  vencimiento.setDate(vencimiento.getDate() + DIAS_PLAZO_PRESTAMO);

  const nuevoPrestamo: Prestamo = {
    id: `loan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    usuarioId,
    monto,
    tasaInteres: nivelConfig.tasaInteres,
    nivelPrestamo: usuario.nivelActual,
    fechaDesembolso: ahora.toISOString(),
    fechaVencimiento: vencimiento.toISOString(),
    estado: 'ACTIVO',
    montoPagado: 0,
    puntosGanados: 0,
    puntosDescuentados: 0,
  };

  usuario.prestamosActivos.push(nuevoPrestamo);
  usuario.historicoCredito.push(nuevoPrestamo);
  
  // Actualizar saldo disponible
  usuario.saldoDisponible = nivelConfig.monto - monto;

  storage.usuarios[storage.usuarios.indexOf(usuario)] = usuario;
  saveStorageData(storage);
  setCurrentUser(usuario);

  return nuevoPrestamo;
}

// Pagar préstamo
export function pagarPrestamo(usuarioId: string, prestamoId: string, monto: number) {
  const storage = getStorageData();
  const usuario = storage.usuarios.find(u => u.id === usuarioId);
  
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  const prestamo = usuario.prestamosActivos.find(p => p.id === prestamoId);
  if (!prestamo) {
    throw new Error('Préstamo no encontrado');
  }

  const ahora = new Date();
  const fechaVencimiento = new Date(prestamo.fechaVencimiento);
  const estaVencido = ahora > fechaVencimiento;
  
  // Calcular el monto total con interés
  const montoConInteres = prestamo.monto * (1 + prestamo.tasaInteres / 100);
  
  if (monto < montoConInteres) {
    throw new Error(`Debes pagar S/ ${montoConInteres.toFixed(2)} para liquidar completamente`);
  }

  // Actualizar estado del préstamo
  prestamo.estado = 'PAGADO';
  prestamo.montoPagado = monto;

  // Asignar puntos
  if (estaVencido) {
    prestamo.puntosGanados = PUNTOS_CONFIG.PRESTAMO_PAGADO_CON_RETRASO;
  } else {
    prestamo.puntosGanados = PUNTOS_CONFIG.PRESTAMO_PAGADO_A_TIEMPO;
  }

  usuario.puntosTotal += prestamo.puntosGanados;

  // Remover de préstamos activos
  usuario.prestamosActivos = usuario.prestamosActivos.filter(p => p.id !== prestamoId);
  
  // Liberar monto disponible
  const nivelConfig = NIVELES_CREDITO[usuario.nivelActual - 1];
  usuario.saldoDisponible = nivelConfig.monto;

  // Verificar si sube de nivel
  verificarSubidaNivel(usuario);

  storage.usuarios[storage.usuarios.indexOf(usuario)] = usuario;
  saveStorageData(storage);
  setCurrentUser(usuario);
}

// Marcar préstamo como vencido (impago)
export function marcarPrestamoVencido(usuarioId: string, prestamoId: string) {
  const storage = getStorageData();
  const usuario = storage.usuarios.find(u => u.id === usuarioId);
  
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  const prestamo = usuario.prestamosActivos.find(p => p.id === prestamoId);
  if (!prestamo) {
    throw new Error('Préstamo no encontrado');
  }

  prestamo.estado = 'VENCIDO';
  prestamo.puntosDescuentados = PUNTOS_CONFIG.PRESTAMO_IMPAGO;
  usuario.puntosTotal += prestamo.puntosDescuentados;

  usuario.reportadoEnInfocorp = true;
  usuario.prestamosActivos = usuario.prestamosActivos.filter(p => p.id !== prestamoId);

  storage.usuarios[storage.usuarios.indexOf(usuario)] = usuario;
  saveStorageData(storage);
  setCurrentUser(usuario);
}

// Verificar si el usuario sube de nivel
function verificarSubidaNivel(usuario: Usuario) {
  const proxNivel = usuario.nivelActual + 1;
  
  if (proxNivel <= 10) {
    const proximoNivelConfig = NIVELES_CREDITO[proxNivel - 1];
    
    if (usuario.puntosTotal >= proximoNivelConfig.puntosRequeridos) {
      usuario.nivelActual = proxNivel;
      usuario.saldoDisponible = proximoNivelConfig.monto;
    }
  }
}
