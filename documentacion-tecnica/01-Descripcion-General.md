# Descripción General del Sistema - APPpagos

## ¿Qué es APPpagos?

APPpagos es un sistema web desarrollado para gestionar y controlar las facturas de servicios públicos de una organización. Permite registrar, aprobar, monitorear y analizar los gastos en servicios como electricidad, agua, gas, internet, telefonía y otros servicios administrativos.

## Propósito y Objetivos

### Objetivo Principal
Centralizar y automatizar la gestión de facturas de servicios públicos, facilitando el control presupuestario y la toma de decisiones basada en datos.

### Objetivos Específicos
- **Registro centralizado**: Todas las facturas se registran en un solo lugar
- **Control de aprobaciones**: Sistema de flujo de trabajo para aprobación de facturas
- **Análisis y reportes**: Dashboard con gráficos y métricas para análisis de gastos
- **Control presupuestario**: Alertas cuando se acercan a los límites presupuestarios
- **Trazabilidad**: Historial completo de cada factura con documentos adjuntos

## Funcionalidades Principales

### 1. Gestión de Usuarios
- Registro e inicio de sesión seguro
- Dos tipos de usuarios:
  - **Usuario Básico**: Puede crear y gestionar sus propias facturas
  - **Coordinador de Área**: Puede ver, aprobar y gestionar facturas de su ubicación

### 2. Registro de Facturas
- Formulario completo para registrar facturas con:
  - Tipo de servicio (electricidad, agua, gas, internet, etc.)
  - Proveedor y número de factura
  - Monto y período de facturación
  - Fecha de vencimiento
  - Centro de costos y ubicación
  - Documento adjunto (PDF, JPG, PNG)
- Guardado como borrador o envío directo para aprobación

### 3. Dashboard y Análisis
- **KPIs principales**:
  - Total mensual de gastos
  - Variación mes a mes
  - Facturas pendientes
  - Facturas vencidas
- **Gráficos interactivos**:
  - Tendencia de gastos (últimos 6 meses)
  - Distribución por tipo de servicio
  - Desglose por centro de costos/ubicación

### 4. Gestión de Facturas
- Tabla completa con todas las facturas
- Búsqueda en tiempo real
- Filtros múltiples (período, servicio, ubicación, estado)
- Ordenamiento por cualquier columna
- Aprobación de facturas (solo coordinadores)
- Exportación a CSV/Excel

### 5. Sistema de Notificaciones
- Recordatorios de vencimiento (3 días antes)
- Alertas de presupuesto (al alcanzar 80% del límite)
- Notificaciones de aprobación
- Notificaciones de facturas aprobadas

## Casos de Uso

### Caso 1: Usuario registra una factura nueva
1. El usuario inicia sesión en el sistema
2. Va a "Nueva Factura"
3. Completa el formulario con los datos de la factura
4. Adjunta el documento de la factura (PDF o imagen)
5. Guarda como borrador o envía para aprobación
6. El sistema envía notificación al coordinador de área

### Caso 2: Coordinador aprueba facturas
1. El coordinador ve el dashboard con facturas pendientes
2. Revisa los detalles de cada factura
3. Aproba o rechaza las facturas
4. El sistema actualiza el estado y notifica al usuario

### Caso 3: Análisis de gastos
1. El coordinador accede al dashboard
2. Selecciona un período específico
3. Visualiza los gráficos de tendencia y distribución
4. Exporta los datos para análisis adicional
5. Identifica áreas de optimización de costos

## Beneficios del Sistema

- ✅ **Reducción de tiempo**: Proceso de registro y aprobación más rápido
- ✅ **Mejor control**: Visibilidad completa de todos los gastos
- ✅ **Toma de decisiones**: Datos en tiempo real para decisiones informadas
- ✅ **Trazabilidad**: Historial completo de cada factura
- ✅ **Organización**: Documentos digitalizados y organizados
- ✅ **Alertas proactivas**: Notificaciones automáticas de vencimientos y presupuestos

## Tecnologías Utilizadas

- **Frontend**: React 18 con TypeScript
- **Backend**: Node.js con Express
- **Base de Datos**: PostgreSQL (Supabase)
- **Autenticación**: JWT (JSON Web Tokens)
- **Almacenamiento**: Supabase Storage para documentos
- **Despliegue**: Vercel (Frontend) y servidor propio (Backend)

## Próximos Pasos

Para conocer más detalles técnicos, consulta los siguientes documentos:
- [Arquitectura Técnica](02-Arquitectura-Tecnica.md)
- [Configuración e Instalación](03-Configuracion-Instalacion.md)
- [Base de Datos](04-Base-de-Datos.md)

