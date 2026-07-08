# Contrato de API para Fiape

Este frontend ya está preparado para consumir un backend en Java + Spring Boot.

## Variables de entorno

Crear un archivo `.env.local` con:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_API_TIMEOUT_MS=10000
```

## Endpoints esperados

### 1) Autenticación

#### POST /auth/register
Request:
```json
{
  "nombres": "Juan",
  "apellidos": "Pérez",
  "dni": "12345678",
  "email": "juan@mail.com",
  "telefono": "987654321"
}
```

Response:
```json
{
  "user": {
    "id": "user_1",
    "nombres": "Juan",
    "apellidos": "Pérez",
    "dni": "12345678",
    "email": "juan@mail.com",
    "telefono": "987654321",
    "fechaRegistro": "2026-07-06T00:00:00.000Z",
    "evaluado": false,
    "tipoHistorial": null,
    "nivelActual": 1,
    "saldoDisponible": 0,
    "puntosTotal": 0,
    "prestamosActivos": [],
    "historicoCredito": [],
    "reportadoEnInfocorp": false
  },
  "token": "jwt-token"
}
```

#### POST /auth/login
Request:
```json
{
  "dni": "12345678",
  "email": "juan@mail.com"
}
```

Response:
```json
{
  "user": { "...": "..." },
  "token": "jwt-token"
}
```

#### GET /auth/me
Response:
```json
{
  "user": { "...": "..." },
  "token": "jwt-token"
}
```

### 2) Evaluación crediticia

#### POST /credit/evaluate
Request:
```json
{
  "usuarioId": "user_1"
}
```

Response:
```json
{
  "reporte": {
    "scoreCrediticio": 74,
    "clasificacion": "CON_HISTORIAL",
    "nivelInicial": 5,
    "montoMaximo": 150,
    "tasaInteres": 16,
    "recomendaciones": [
      "Tienes acceso a créditos de mayor monto",
      "Mantén tus pagos al día"
    ]
  },
  "user": { "...": "..." }
}
```

### 3) Préstamos

#### POST /loans
Request:
```json
{
  "usuarioId": "user_1",
  "monto": 100
}
```

Response:
```json
{
  "prestamo": {
    "id": "loan_1",
    "usuarioId": "user_1",
    "monto": 100,
    "tasaInteres": 16,
    "nivelPrestamo": 5,
    "fechaDesembolso": "2026-07-06T00:00:00.000Z",
    "fechaVencimiento": "2026-08-05T00:00:00.000Z",
    "estado": "ACTIVO",
    "montoPagado": 0,
    "puntosGanados": 0,
    "puntosDescuentados": 0
  },
  "user": { "...": "..." }
}
```

#### POST /loans/pay
Request:
```json
{
  "usuarioId": "user_1",
  "prestamoId": "loan_1",
  "monto": 116
}
```

Response:
```json
{
  "user": { "...": "..." },
  "prestamo": { "...": "..." }
}
```

#### POST /loans/overdue
Request:
```json
{
  "usuarioId": "user_1",
  "prestamoId": "loan_1"
}
```

Response:
```json
{
  "user": { "...": "..." },
  "prestamo": { "...": "..." }
}
```

## Estructuras de datos esperadas

- Usuario: ver [lib/types.ts](../lib/types.ts)
- Préstamo: ver [lib/types.ts](../lib/types.ts)
- Reporte de evaluación: ver [lib/types.ts](../lib/types.ts)

## Respuesta corta para el backend

Sí, basta con configurar la URL del backend en el archivo .env del frontend:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

Con eso, el frontend hará todas las peticiones al backend. La base de datos real debe ser la del backend, no la del frontend. El frontend solo envía datos y recibe datos; no guarda la información de forma persistente en producción.

## Modelo de dominio recomendado en Spring Boot

Para que el frontend funcione correctamente, el backend debe crear estas entidades y relaciones:

### 1) Usuario
Entidad principal del sistema.

Campos recomendados:
- id: UUID o Long
- nombres: String
- apellidos: String
- dni: String (único)
- email: String (único)
- telefono: String
- fechaRegistro: LocalDateTime
- evaluado: boolean
- tipoHistorial: String o enum (`CON_HISTORIAL`, `SIN_HISTORIAL`) nullable
- nivelActual: int
- saldoDisponible: BigDecimal
- puntosTotal: int
- reportadoEnInfocorp: boolean

Relaciones:
- 1 usuario -> muchos préstamos
- 1 usuario -> muchas evaluaciones crediticias

### 2) Prestamo
Representa cada solicitud de crédito del usuario.

Campos recomendados:
- id: UUID o Long
- usuarioId: FK hacia Usuario
- monto: BigDecimal
- tasaInteres: BigDecimal o double
- nivelPrestamo: int
- fechaDesembolso: LocalDateTime
- fechaVencimiento: LocalDateTime
- estado: String o enum (`ACTIVO`, `PAGADO`, `VENCIDO`)
- montoPagado: BigDecimal
- puntosGanados: int
- puntosDescuentados: int

Relación:
- muchos préstamos pertenecen a un usuario

### 3) EvaluacionCredito
Guarda el resultado de la evaluación enviada al frontend.

Campos recomendados:
- id: UUID o Long
- usuarioId: FK hacia Usuario
- scoreCrediticio: int
- clasificacion: String o enum (`CON_HISTORIAL`, `SIN_HISTORIAL`)
- nivelInicial: int
- montoMaximo: BigDecimal
- tasaInteres: BigDecimal o double
- recomendaciones: String[] o texto JSON
- fechaEvaluacion: LocalDateTime

Relación:
- muchas evaluaciones pertenecen a un usuario

### 4) NivelCredito (tabla de catálogo o enum)
Este no es obligatorio si lo manejan con reglas de negocio, pero es lo más limpio.

Campos recomendados:
- nivel: int (PK)
- montoMaximo: BigDecimal
- tasaInteres: BigDecimal
- puntosRequeridos: int

Relaciones:
- un nivel puede estar asociado a muchos usuarios y muchos préstamos

## Relación real entre entidades

La relación lógica debería ser esta:

- Usuario tiene muchos Prestamos
- Usuario tiene muchas EvaluacionCredito
- Usuario tiene un nivel actual, que puede venir de NivelCredito
- Prestamo pertenece a un Usuario y a un NivelCredito (por el nivel en que se emitió)

## Qué debe hacer cada endpoint usando estas entidades

### POST /auth/register
- Crear un Usuario nuevo
- Guardar sus datos básicos
- Devolver el usuario creado

### POST /auth/login
- Buscar Usuario por dni y email
- Devolver el usuario encontrado

### POST /credit/evaluate
- Buscar el Usuario
- Crear una nueva EvaluacionCredito
- Actualizar el Usuario con:
  - evaluado = true
  - tipoHistorial
  - nivelActual
  - saldoDisponible
  - puntosTotal si aplica
- Devolver la evaluación y el usuario actualizado

### POST /loans
- Validar que el usuario exista
- Validar que no tenga un préstamo ACTIVO
- Crear un Prestamo nuevo
- Actualizar el saldoDisponible del Usuario
- Devolver el préstamo creado y el usuario actualizado

### POST /loans/pay
- Buscar el Prestamo por id
- Actualizar estado a PAGADO
- Actualizar montoPagado
- Actualizar puntos del Usuario
- Actualizar saldoDisponible
- Devolver el préstamo y el usuario

### POST /loans/overdue
- Buscar el Prestamo
- Cambiar estado a VENCIDO
- Marcar usuario como reportadoEnInfocorp = true
- Devolver el préstamo y el usuario

## Resumen ejecutivo
Si quieres que funcione bien y sea mantenible, el backend necesita al menos estas 3 entidades principales:
1. Usuario
2. Prestamo
3. EvaluacionCredito

Y opcionalmente una cuarta:
4. NivelCredito

Eso es suficiente para cubrir exactamente lo que el frontend envía y recibe.
