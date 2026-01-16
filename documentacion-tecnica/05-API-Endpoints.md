# API y Endpoints - APPpagos

## Base URL

**Desarrollo:** `http://localhost:3000`  
**Producción:** `https://api.apppagos.com` (configurar según tu dominio)

## Autenticación

Todas las rutas protegidas requieren un token JWT en el header:

```
Authorization: Bearer <token>
```

El token se obtiene al iniciar sesión y tiene una validez de 7 días.

## Endpoints de Autenticación

### POST `/api/auth/register`

Registra un nuevo usuario en el sistema.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123",
  "fullName": "Juan Pérez",
  "location": "Oficina Bogotá"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid-del-usuario",
    "email": "usuario@ejemplo.com",
    "fullName": "Juan Pérez",
    "role": "basic_user",
    "location": "Oficina Bogotá"
  },
  "token": "jwt-token-aqui"
}
```

**Errores:**
- `400`: Email ya existe o datos inválidos
- `500`: Error del servidor

---

### POST `/api/auth/login`

Inicia sesión con email y contraseña.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid-del-usuario",
    "email": "usuario@ejemplo.com",
    "fullName": "Juan Pérez",
    "role": "basic_user",
    "department": "IT",
    "location": "Oficina Bogotá"
  },
  "token": "jwt-token-aqui"
}
```

**Errores:**
- `401`: Credenciales inválidas
- `400`: Email o contraseña faltantes

---

### GET `/api/auth/profile`

Obtiene el perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "uuid-del-usuario",
  "email": "usuario@ejemplo.com",
  "fullName": "Juan Pérez",
  "role": "basic_user",
  "department": "IT",
  "location": "Oficina Bogotá",
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

**Errores:**
- `401`: Token no proporcionado o inválido

---

## Endpoints de Facturas

### GET `/api/bills`

Obtiene la lista de facturas con filtros opcionales.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `period` (opcional): Período en formato YYYY-MM (ej: "2025-11")
- `serviceType` (opcional): Tipo de servicio (electricity, water, gas, etc.)
- `location` (opcional): Ubicación
- `status` (opcional): Estado (draft, pending, approved, overdue, paid)
- `search` (opcional): Búsqueda en número de factura o proveedor
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Items por página (default: 50)

**Ejemplo:**
```
GET /api/bills?period=2025-11&status=pending&page=1&limit=20
```

**Response (200 OK):**
```json
{
  "bills": [
    {
      "id": "uuid-factura",
      "userId": "uuid-usuario",
      "serviceType": "electricity",
      "provider": "EPM",
      "description": "Factura mensual",
      "value": 150000,
      "period": "2025-11",
      "invoiceNumber": "FAC-12345",
      "contractNumber": "CT-789",
      "totalAmount": 150000,
      "consumption": 250,
      "unitOfMeasure": "kWh",
      "costCenter": "Oficina Principal",
      "location": "Oficina Bogotá",
      "dueDate": "2025-12-15",
      "documentUrl": "https://storage.supabase.co/...",
      "documentName": "factura_nov.pdf",
      "status": "pending",
      "notes": "Revisar consumo",
      "approvedBy": null,
      "approvedAt": null,
      "createdAt": "2025-11-01T10:00:00Z",
      "updatedAt": "2025-11-01T10:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 20,
    "totalItems": 45,
    "totalPages": 3
  }
}
```

**Errores:**
- `401`: No autenticado
- `403`: Sin permisos

---

### GET `/api/bills/:id`

Obtiene los detalles de una factura específica.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "uuid-factura",
  "userId": "uuid-usuario",
  "serviceType": "electricity",
  "provider": "EPM",
  "description": "Factura mensual",
  "value": 150000,
  "period": "2025-11",
  "invoiceNumber": "FAC-12345",
  "contractNumber": "CT-789",
  "totalAmount": 150000,
  "consumption": 250,
  "unitOfMeasure": "kWh",
  "costCenter": "Oficina Principal",
  "location": "Oficina Bogotá",
  "dueDate": "2025-12-15",
  "documentUrl": "https://storage.supabase.co/...",
  "documentName": "factura_nov.pdf",
  "status": "pending",
  "notes": "Revisar consumo",
  "approvedBy": null,
  "approvedAt": null,
  "createdAt": "2025-11-01T10:00:00Z",
  "updatedAt": "2025-11-01T10:00:00Z"
}
```

**Errores:**
- `401`: No autenticado
- `403`: Sin permisos para ver esta factura
- `404`: Factura no encontrada

---

### POST `/api/bills`

Crea una nueva factura.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
- `serviceType`: Tipo de servicio (required)
- `provider`: Proveedor (required)
- `description`: Descripción (optional)
- `value`: Valor base (required, number)
- `period`: Período YYYY-MM (required)
- `invoiceNumber`: Número de factura (optional)
- `contractNumber`: Número de contrato (optional)
- `totalAmount`: Monto total (required, number)
- `consumption`: Consumo (optional, number)
- `unitOfMeasure`: Unidad de medida (optional)
- `costCenter`: Centro de costos (optional)
- `location`: Ubicación (required)
- `dueDate`: Fecha de vencimiento YYYY-MM-DD (required)
- `status`: Estado (draft o pending) (required)
- `notes`: Notas (optional)
- `document`: Archivo PDF, JPG o PNG (optional, max 10MB)

**Response (201 Created):**
```json
{
  "id": "uuid-factura-nueva",
  "userId": "uuid-usuario",
  "serviceType": "electricity",
  "provider": "EPM",
  "totalAmount": 150000,
  "status": "pending",
  "createdAt": "2025-11-01T10:00:00Z"
}
```

**Errores:**
- `400`: Datos inválidos o faltantes
- `401`: No autenticado
- `413`: Archivo muy grande (>10MB)
- `415`: Tipo de archivo no permitido

---

### PUT `/api/bills/:id`

Actualiza una factura existente.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "provider": "EPM Actualizado",
  "totalAmount": 160000,
  "status": "pending",
  "notes": "Actualización de monto"
}
```

**Nota:** Solo se pueden actualizar facturas en estado 'draft' o 'pending'. Los coordinadores pueden cambiar el estado a 'approved'.

**Response (200 OK):**
```json
{
  "id": "uuid-factura",
  "provider": "EPM Actualizado",
  "totalAmount": 160000,
  "status": "pending",
  "updatedAt": "2025-11-01T11:00:00Z"
}
```

**Errores:**
- `400`: Datos inválidos
- `401`: No autenticado
- `403`: Sin permisos o factura no editable
- `404`: Factura no encontrada

---

### DELETE `/api/bills/:id`

Elimina una factura. Solo se pueden eliminar facturas en estado 'draft'.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Factura eliminada correctamente"
}
```

**Errores:**
- `401`: No autenticado
- `403`: Sin permisos o factura no eliminable
- `404`: Factura no encontrada

---

### POST `/api/bills/:id/approve`

Aprueba una factura pendiente. Solo disponible para coordinadores de área.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "uuid-factura",
  "status": "approved",
  "approvedBy": "uuid-coordinador",
  "approvedAt": "2025-11-01T12:00:00Z"
}
```

**Errores:**
- `401`: No autenticado
- `403`: No es coordinador o sin permisos
- `404`: Factura no encontrada
- `400`: Factura no está en estado 'pending'

---

## Endpoints de Dashboard

### GET `/api/dashboard/kpis`

Obtiene los KPIs principales del dashboard.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `period` (opcional): Período en formato YYYY-MM (default: mes actual)

**Response (200 OK):**
```json
{
  "monthlyTotal": 2500000,
  "monthlyChange": 5.5,
  "pendingCount": 12,
  "overdueCount": 3
}
```

---

### GET `/api/dashboard/charts`

Obtiene los datos para los gráficos del dashboard.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `period` (opcional): Período en formato YYYY-MM
- `months` (opcional): Número de meses para tendencia (default: 6)

**Response (200 OK):**
```json
{
  "trend": [
    { "month": "2025-06", "total": 2000000 },
    { "month": "2025-07", "total": 2200000 },
    { "month": "2025-08", "total": 2100000 },
    { "month": "2025-09", "total": 2300000 },
    { "month": "2025-10", "total": 2400000 },
    { "month": "2025-11", "total": 2500000 }
  ],
  "byService": [
    { "serviceType": "electricity", "total": 800000 },
    { "serviceType": "water", "total": 500000 },
    { "serviceType": "internet", "total": 400000 }
  ],
  "byLocation": [
    { "location": "Oficina Bogotá", "total": 1500000 },
    { "location": "Oficina Medellín", "total": 1000000 }
  ]
}
```

---

## Endpoints de Usuarios (Solo Coordinadores)

### GET `/api/users`

Obtiene la lista de usuarios. Solo disponible para coordinadores.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "users": [
    {
      "id": "uuid-usuario",
      "email": "usuario@ejemplo.com",
      "fullName": "Juan Pérez",
      "role": "basic_user",
      "location": "Oficina Bogotá",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

## Códigos de Estado HTTP

- `200 OK`: Petición exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Datos inválidos o faltantes
- `401 Unauthorized`: No autenticado o token inválido
- `403 Forbidden`: Sin permisos para la operación
- `404 Not Found`: Recurso no encontrado
- `413 Payload Too Large`: Archivo muy grande
- `415 Unsupported Media Type`: Tipo de archivo no permitido
- `500 Internal Server Error`: Error del servidor

## Ejemplos de Uso

### Ejemplo: Crear una factura con archivo

```javascript
const formData = new FormData();
formData.append('serviceType', 'electricity');
formData.append('provider', 'EPM');
formData.append('totalAmount', '150000');
formData.append('period', '2025-11');
formData.append('location', 'Oficina Bogotá');
formData.append('dueDate', '2025-12-15');
formData.append('status', 'pending');
formData.append('document', fileInput.files[0]);

const response = await fetch('http://localhost:3000/api/bills', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Ejemplo: Obtener facturas con filtros

```javascript
const params = new URLSearchParams({
  period: '2025-11',
  status: 'pending',
  page: '1',
  limit: '20'
});

const response = await fetch(`http://localhost:3000/api/bills?${params}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Próximos Pasos

- Consulta la [documentación de seguridad](06-Seguridad-Autenticacion.md) para entender la autenticación
- Revisa la [documentación de base de datos](04-Base-de-Datos.md) para entender los datos

