# Arquitectura Técnica - APPpagos

## Visión General de la Arquitectura

El sistema APPpagos está construido con una arquitectura de tres capas (frontend, backend y base de datos), siguiendo las mejores prácticas de desarrollo web moderno.

```
┌─────────────────┐
│   Frontend      │  React + TypeScript + Vite
│   (Cliente)     │  Puerto: 5173 (desarrollo)
└────────┬────────┘
         │ HTTP/REST API
         │
┌────────▼────────┐
│   Backend       │  Node.js + Express
│   (Servidor)    │  Puerto: 3000
└────────┬────────┘
         │ SQL Queries
         │
┌────────▼────────┐
│   Base de       │  PostgreSQL (Supabase)
│   Datos         │  Puerto: 5432
└─────────────────┘
```

## Stack Tecnológico

### Frontend
- **React 18.3.1**: Biblioteca de JavaScript para construir interfaces de usuario
- **TypeScript 5.5.3**: Superset de JavaScript con tipado estático
- **Vite 5.4.2**: Herramienta de construcción rápida para desarrollo
- **React Router 7.9.3**: Enrutamiento del lado del cliente
- **TailwindCSS 3.4.1**: Framework de CSS utility-first
- **Recharts 3.2.1**: Biblioteca para gráficos y visualizaciones
- **Lucide React**: Iconos modernos y ligeros

### Backend
- **Node.js**: Entorno de ejecución de JavaScript
- **Express 4.18.2**: Framework web minimalista
- **PostgreSQL (pg 8.11.3)**: Cliente para base de datos PostgreSQL
- **JWT (jsonwebtoken 9.0.2)**: Autenticación basada en tokens
- **Multer 1.4.5**: Middleware para manejo de archivos
- **CORS 2.8.5**: Soporte para Cross-Origin Resource Sharing

### Base de Datos
- **PostgreSQL 17**: Sistema de gestión de bases de datos relacional
- **Supabase**: Plataforma que proporciona PostgreSQL como servicio
- **Row Level Security (RLS)**: Seguridad a nivel de fila implementada

### Servicios Adicionales
- **Supabase Storage**: Almacenamiento de archivos (documentos de facturas)
- **Servicios de Email**: Soporte para múltiples proveedores (SendGrid, Mailgun, Resend, Nodemailer)

## Estructura del Proyecto

```
project/
├── src/                    # Código fuente del frontend
│   ├── atoms/             # Componentes básicos (Button, Input, Card)
│   ├── molecules/         # Componentes compuestos (KPICard, SearchBar)
│   ├── organisms/         # Componentes complejos (Navbar, BillForm, Charts)
│   ├── templates/         # Plantillas de página (AuthLayout, ProtectedLayout)
│   ├── pages/             # Páginas principales (Dashboard, Bills, Login)
│   ├── hooks/             # Hooks personalizados de React
│   ├── services/          # Servicios de API y lógica de negocio
│   ├── context/           # Context API para estado global
│   ├── types/             # Definiciones de TypeScript
│   └── utils/             # Funciones auxiliares
│
├── backend/               # Código del servidor backend
│   ├── server.js          # Servidor Express principal
│   ├── emailService.js    # Servicio de envío de correos
│   ├── supabaseClient.js  # Cliente de Supabase
│   └── uploads/           # Carpeta temporal para archivos
│
├── database/              # Scripts de base de datos
│   ├── setup-local-postgres.sql
│   └── seed-data.sql
│
├── supabase/              # Migraciones de Supabase
│   └── migrations/
│
└── documentacion-tecnica/ # Esta carpeta
```

## Patrón de Diseño: Atomic Design

El frontend sigue el patrón **Atomic Design**, organizando los componentes en niveles:

1. **Atoms** (Átomos): Componentes básicos e indivisibles
   - Button, Input, Card, Badge, Select, Textarea

2. **Molecules** (Moléculas): Combinaciones de átomos
   - KPICard, FileUpload, SearchBar, FilterBar, BillDetailsModal

3. **Organisms** (Organismos): Componentes complejos
   - Navbar, BillForm, BillsTable, DashboardCharts

4. **Templates** (Plantillas): Estructuras de página
   - AuthLayout, ProtectedLayout

5. **Pages** (Páginas): Páginas completas
   - DashboardPage, BillsPage, LoginPage, etc.

## Flujo de Datos

### Autenticación
```
Usuario → Frontend → POST /api/auth/login
                    ↓
                 Backend valida credenciales
                    ↓
                 Genera JWT token
                    ↓
                 Frontend guarda token en localStorage
                    ↓
                 Token se envía en headers de todas las peticiones
```

### Registro de Factura
```
Usuario completa formulario → Frontend valida datos
                            ↓
                         POST /api/bills (con token JWT)
                            ↓
                         Backend valida token y datos
                            ↓
                         Sube documento a Supabase Storage
                            ↓
                         Inserta factura en PostgreSQL
                            ↓
                         Envía notificación por email
                            ↓
                         Retorna factura creada al frontend
```

### Consulta de Facturas
```
Frontend → GET /api/bills?filters (con token JWT)
          ↓
       Backend verifica token
          ↓
       Consulta PostgreSQL con filtros
          ↓
       Aplica Row Level Security (RLS)
          ↓
       Retorna solo facturas permitidas
          ↓
       Frontend muestra en tabla
```

## Seguridad

### Autenticación
- **JWT Tokens**: Tokens firmados con expiración de 7 días
- **Bcrypt**: Contraseñas encriptadas en la base de datos
- **Middleware de autenticación**: Todas las rutas protegidas verifican el token

### Autorización
- **Control de acceso basado en roles**: Usuario básico vs Coordinador de área
- **Row Level Security (RLS)**: Políticas a nivel de base de datos
- **Validación de permisos**: Backend verifica permisos antes de operaciones

### Protección de Datos
- **HTTPS**: Todas las comunicaciones encriptadas en producción
- **CORS**: Configurado para permitir solo orígenes autorizados
- **Validación de entrada**: Todos los datos se validan antes de procesar

## Comunicación entre Componentes

### Frontend ↔ Backend
- **Protocolo**: HTTP/HTTPS
- **Formato**: JSON
- **Autenticación**: Header `Authorization: Bearer <token>`
- **CORS**: Habilitado para desarrollo, restringido en producción

### Backend ↔ Base de Datos
- **Protocolo**: PostgreSQL (TCP/IP)
- **Conexión**: Pool de conexiones (máximo 10 conexiones simultáneas)
- **SSL**: Habilitado en producción (Supabase requiere SSL)

### Backend ↔ Supabase Storage
- **API REST**: Cliente de Supabase para subir/descargar archivos
- **Autenticación**: Service Role Key para acceso directo

## Rendimiento y Optimizaciones

### Frontend
- **Code Splitting**: Carga diferida de componentes con React.lazy()
- **Debouncing**: Búsquedas con retraso para reducir peticiones
- **Optimistic Updates**: Actualización inmediata de UI antes de confirmación del servidor
- **Lazy Loading**: Gráficos se cargan solo cuando son visibles

### Backend
- **Connection Pooling**: Reutilización de conexiones a la base de datos
- **Índices de base de datos**: Consultas optimizadas con índices en columnas frecuentes
- **Validación temprana**: Rechazo de peticiones inválidas antes de procesar

### Base de Datos
- **Índices**: En user_id, period, service_type, status, due_date
- **RLS eficiente**: Políticas optimizadas para consultas rápidas

## Escalabilidad

El sistema está diseñado para escalar horizontalmente:

- **Frontend**: Puede desplegarse en CDN (Vercel)
- **Backend**: Puede ejecutarse en múltiples instancias con balanceador de carga
- **Base de Datos**: Supabase maneja el escalado automáticamente

## Monitoreo y Logging

- **Console logs**: Para desarrollo y debugging
- **Error handling**: Captura y registro de errores en todas las capas
- **Validación de respuestas**: Verificación de éxito/error en todas las peticiones

## Próximos Pasos

Para más detalles sobre implementación específica:
- [Configuración e Instalación](03-Configuracion-Instalacion.md)
- [Base de Datos](04-Base-de-Datos.md)
- [API y Endpoints](05-API-Endpoints.md)

