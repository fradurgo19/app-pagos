# ✅ Checklist de Pruebas - APPpagos

## 🎯 Guía Completa de Testing en Desarrollo

Antes de migrar a producción, verifica que **todas** estas funcionalidades funcionan correctamente.

---

## 📋 CHECKLIST DE FUNCIONALIDADES

### 🔐 1. Autenticación

#### Registro de Usuario
- [ ] Ve a: http://localhost:5173/signup
- [ ] Crea un nuevo usuario con:
  - Email: `test@apppagos.com`
  - Password: `test123`
  - Nombre: `Usuario de Prueba`
  - Ubicación: `Oficina Test`
- [ ] ✅ **Esperado**: Redirección automática al dashboard
- [ ] ✅ **Verificar**: Nombre aparece en la navbar (arriba derecha)

#### Inicio de Sesión
- [ ] Cierra sesión (botón "Cerrar Sesión" arriba derecha)
- [ ] Ve a: http://localhost:5173/login
- [ ] Inicia sesión con: `admin@apppagos.com` / `admin123`
- [ ] ✅ **Esperado**: Entrada exitosa al dashboard
- [ ] ✅ **Verificar**: Nombre "Juan Administrador" aparece en navbar
- [ ] ✅ **Verificar**: Rol "Coordinador de área" se muestra

#### Persistencia de Sesión
- [ ] Con sesión activa, recarga la página (F5)
- [ ] ✅ **Esperado**: Sigues autenticado (no te redirige a login)
- [ ] Cierra el navegador completamente
- [ ] Abre de nuevo: http://localhost:5173
- [ ] ✅ **Esperado**: Sigues autenticado

#### Protección de Rutas
- [ ] Cierra sesión
- [ ] Intenta acceder directamente a: http://localhost:5173/bills
- [ ] ✅ **Esperado**: Redirección a /login

---

### 📊 2. Dashboard (Panel de Control)

#### KPIs (Indicadores)
- [ ] Ve a: http://localhost:5173/
- [ ] ✅ **Verificar**: Card "Total Mensual" muestra un monto
- [ ] ✅ **Verificar**: Card "Facturas Pendientes" muestra un número
- [ ] ✅ **Verificar**: Card "Facturas Vencidas" muestra un número
- [ ] ✅ **Verificar**: Card "Facturas Aprobadas" muestra un número
- [ ] ✅ **Verificar**: Porcentaje de cambio (▲ verde o ▼ rojo) aparece

#### Filtro de Período
- [ ] Cambia el selector de "Período" a otro mes
- [ ] ✅ **Esperado**: Los KPIs se actualizan
- [ ] ✅ **Esperado**: Los gráficos se actualizan

#### Gráficos
- [ ] ✅ **Verificar**: Gráfico "Tendencia de Gastos (6 Meses)" aparece
- [ ] ✅ **Verificar**: Gráfico "Mes Actual por Tipo de Servicio" aparece
- [ ] ✅ **Verificar**: Gráfico "Distribución por Centro de Costos" (circular) aparece
- [ ] Pasa el mouse sobre los gráficos
- [ ] ✅ **Esperado**: Tooltips con información aparecen

#### Acciones Rápidas
- [ ] ✅ **Verificar**: Card "Acciones Rápidas" con 3 botones aparece
  - Crear Nueva Factura
  - Ver Todas las Facturas
  - Exportar Reportes

---

### 📝 3. Crear Nueva Factura

#### Navegación
- [ ] Click en "Nueva Factura" en la navbar
- [ ] O click en botón "+" (PlusCircle) en navbar
- [ ] ✅ **Esperado**: Redirección a /new-bill

#### Formulario - Sección 1: Información de la Factura
- [ ] ✅ **Verificar**: Título "Información de la Factura"
- [ ] Selecciona "Tipo de Servicio": Electricidad
- [ ] Ingresa "Proveedor": Codensa
- [ ] Selecciona "Período": Mes actual
- [ ] Ingresa "Número de Factura": TEST-001
- [ ] Ingresa "Descripción": Prueba de factura

#### Formulario - Sección 2: Monto y Consumo
- [ ] Ingresa "Monto de la Factura": 250000
- [ ] Ingresa "Monto Total": 250000
- [ ] Ingresa "Consumo": 350
- [ ] Selecciona "Unidad de Medida": kWh

#### Formulario - Sección 3: Ubicación y Vencimiento
- [ ] Ingresa "Centro de Costos": Contabilidad
- [ ] Ingresa "Ubicación": Oficina Bogotá
- [ ] Selecciona "Fecha de Vencimiento": 15 días desde hoy

#### Formulario - Sección 4: Documento y Notas
- [ ] Ingresa "Notas": Esta es una factura de prueba
- [ ] (Opcional) Intenta cargar un archivo PDF o imagen
- [ ] ✅ **Esperado**: Archivo se muestra con nombre y tamaño

#### Validaciones
- [ ] Borra el campo "Proveedor" y click "Enviar Factura"
- [ ] ✅ **Esperado**: Mensaje de error "El proveedor es requerido"
- [ ] ✅ **Verificar**: Campos requeridos muestran errores en rojo

#### Guardar como Borrador
- [ ] Completa todos los campos requeridos
- [ ] Click en "Guardar como Borrador"
- [ ] ✅ **Esperado**: Redirección a /bills
- [ ] ✅ **Verificar**: Factura aparece con estado "Borrador"

#### Enviar Factura
- [ ] Crea otra factura
- [ ] Click en "Enviar Factura"
- [ ] ✅ **Esperado**: Redirección a /bills
- [ ] ✅ **Verificar**: Factura aparece con estado "Pendiente"

---

### 📋 4. Gestión de Facturas (/bills)

#### Lista de Facturas
- [ ] Ve a: http://localhost:5173/bills
- [ ] ✅ **Verificar**: Tabla con facturas aparece
- [ ] ✅ **Verificar**: Columnas visibles:
  - Período
  - Servicio
  - Proveedor
  - Monto
  - Vencimiento
  - Ubicación
  - Estado
  - Acciones

#### Búsqueda
- [ ] En la barra de búsqueda, escribe: "Codensa"
- [ ] ✅ **Esperado**: Solo facturas de Codensa aparecen
- [ ] Borra la búsqueda
- [ ] ✅ **Esperado**: Todas las facturas vuelven a aparecer

#### Filtros
- [ ] **Tipo de Servicio**: Selecciona "Electricidad"
- [ ] ✅ **Esperado**: Solo facturas de electricidad
- [ ] **Ubicación**: Selecciona una ubicación específica
- [ ] ✅ **Esperado**: Facturas filtradas por ubicación
- [ ] **Estado**: Selecciona "Pendiente"
- [ ] ✅ **Esperado**: Solo facturas pendientes
- [ ] Combina filtros (Electricidad + Pendiente)
- [ ] ✅ **Esperado**: Filtros se acumulan
- [ ] Resetea todos a "Todos"

#### Ordenamiento
- [ ] Click en header "Monto"
- [ ] ✅ **Esperado**: Facturas ordenadas por monto ascendente
- [ ] Click de nuevo en "Monto"
- [ ] ✅ **Esperado**: Orden descendente
- [ ] Prueba ordenar por:
  - [ ] Período
  - [ ] Servicio
  - [ ] Vencimiento
  - [ ] Estado

#### Selección Múltiple
- [ ] Marca el checkbox de 2-3 facturas
- [ ] ✅ **Verificar**: Barra azul aparece: "X facturas seleccionadas"
- [ ] ✅ **Verificar**: Botón "Eliminar Seleccionadas" aparece
- [ ] Click en checkbox del header
- [ ] ✅ **Esperado**: Todas las facturas se seleccionan

#### Exportar a CSV
- [ ] Click en botón "Exportar" (arriba derecha)
- [ ] ✅ **Esperado**: Descarga archivo CSV
- [ ] Abre el archivo CSV
- [ ] ✅ **Verificar**: Contiene todas las facturas con headers en español

#### Acciones por Factura

**Ver Detalles** (ícono ojo):
- [ ] Click en ícono de ojo (👁️) en una factura
- [ ] ✅ **Esperado**: Modal o vista con detalles completos

**Descargar Documento** (si tiene):
- [ ] En factura con documento, click en ícono de descarga
- [ ] ✅ **Esperado**: Descarga del PDF/imagen

**Eliminar** (solo borradores):
- [ ] Click en ícono de basura en una factura "Borrador"
- [ ] ✅ **Esperado**: Confirmación "¿Estás seguro...?"
- [ ] Confirma
- [ ] ✅ **Esperado**: Factura eliminada de la lista

**Aprobar** (solo coordinadores):
- [ ] Con usuario admin (coordinador)
- [ ] Click en ícono de check (✓) en factura "Pendiente"
- [ ] ✅ **Esperado**: Estado cambia a "Aprobado"
- [ ] ✅ **Verificar**: Ícono de check desaparece

---

### 👥 5. Roles y Permisos

#### Usuario Básico
- [ ] Cierra sesión
- [ ] Inicia sesión con: `usuario1@apppagos.com` / `user123`
- [ ] Ve a /bills
- [ ] ✅ **Verificar**: Solo ves TUS facturas
- [ ] ✅ **Verificar**: NO ves ícono de check (✓) para aprobar
- [ ] ✅ **Verificar**: Solo puedes eliminar borradores propios

#### Coordinador de Área
- [ ] Cierra sesión
- [ ] Inicia sesión con: `admin@apppagos.com` / `admin123`
- [ ] Ve a /bills
- [ ] ✅ **Verificar**: Ves facturas de tu ubicación
- [ ] ✅ **Verificar**: Puedes aprobar facturas pendientes (ícono ✓)

---

### 🎨 6. Interfaz y UX

#### Responsive Design
- [ ] Abre DevTools (F12) → Toggle Device Toolbar
- [ ] Prueba en:
  - [ ] Mobile (375px)
  - [ ] Tablet (768px)
  - [ ] Desktop (1920px)
- [ ] ✅ **Verificar**: La interfaz se adapta correctamente
- [ ] ✅ **Verificar**: Navbar se ajusta en móvil
- [ ] ✅ **Verificar**: Tablas son scrollables en móvil

#### Estados de Carga
- [ ] Refresca la página en /bills
- [ ] ✅ **Esperado**: Spinner de carga aparece brevemente
- [ ] En formulario, click "Enviar Factura"
- [ ] ✅ **Esperado**: Botón muestra estado de carga

#### Mensajes de Error
- [ ] Intenta crear factura sin llenar campos requeridos
- [ ] ✅ **Verificar**: Mensajes de error en español
- [ ] ✅ **Verificar**: Campos con error tienen borde rojo
- [ ] Intenta login con credenciales incorrectas
- [ ] ✅ **Esperado**: "Credenciales inválidas" en español

---

## 🔧 OPTIMIZACIONES A REALIZAR

### Backend (API)

#### 1. **Agregar Validación de Datos**
- [ ] Validar inputs antes de insertar en BD
- [ ] Sanitizar strings para prevenir SQL injection
- [ ] Validar formatos de fecha, email, números

#### 2. **Logging y Monitoreo**
- [ ] Agregar logs estructurados
- [ ] Registrar errores en archivo
- [ ] Agregar timestamps a todas las operaciones

#### 3. **Manejo de Errores Mejorado**
- [ ] Crear middleware de manejo de errores
- [ ] Respuestas de error consistentes
- [ ] Códigos HTTP apropiados

#### 4. **Performance**
- [ ] Agregar índices en PostgreSQL (ya están)
- [ ] Implementar paginación en lista de facturas
- [ ] Cachear consultas frecuentes

#### 5. **Seguridad**
- [ ] Rate limiting en endpoints de auth
- [ ] Validar permisos en todas las rutas
- [ ] Agregar CORS restrictivo para producción
- [ ] Implementar refresh tokens

---

### Frontend (React)

#### 1. **Manejo de Estados**
- [ ] Agregar React Query para caché de datos
- [ ] Implementar optimistic updates
- [ ] Manejar estados de error globalmente

#### 2. **Performance**
- [ ] Verificar que lazy loading funciona
- [ ] Agregar React.memo en componentes pesados
- [ ] Optimizar re-renders innecesarios

#### 3. **Accesibilidad**
- [ ] Verificar navegación con teclado (Tab)
- [ ] Probar con lector de pantalla
- [ ] Verificar contraste de colores

#### 4. **PWA (Opcional)**
- [ ] Agregar Service Worker
- [ ] Hacer app instalable
- [ ] Funcionalidad offline

---

## 🚀 PREPARACIÓN PARA PRODUCCIÓN

### Archivos a Crear:

He preparado los siguientes documentos:

1. **TESTING_CHECKLIST.md** (este archivo)
   - Checklist completo de pruebas

2. **OPTIMIZACIONES.md** (siguiente)
   - Código optimizado
   - Mejores prácticas

3. **MIGRACION_PRODUCCION.md** (siguiente)
   - Guía paso a paso para migrar a:
     - Vercel (frontend)
     - Supabase (base de datos)
     - Supabase Storage (archivos)

4. **Scripts de migración**
   - Script SQL para Supabase
   - Configuración de Vercel
   - Variables de entorno

---

## 📊 PRUEBAS DE INTEGRACIÓN

### Escenario 1: Ciclo Completo de Factura

1. [ ] Registra nuevo usuario
2. [ ] Crea factura como borrador
3. [ ] Edita el borrador
4. [ ] Envía la factura (estado: Pendiente)
5. [ ] Inicia sesión como coordinador
6. [ ] Aprueba la factura
7. [ ] ✅ **Verificar**: Estado = "Aprobado"
8. [ ] ✅ **Verificar**: Aparece en dashboard como aprobada

### Escenario 2: Búsqueda y Filtrado

1. [ ] Crea 3 facturas de diferentes servicios
2. [ ] Busca por proveedor específico
3. [ ] Filtra por tipo de servicio
4. [ ] Combina búsqueda + filtros
5. [ ] Exporta resultados filtrados
6. [ ] ✅ **Verificar**: CSV contiene solo facturas filtradas

### Escenario 3: Permisos de Usuario

1. [ ] Usuario básico intenta aprobar factura
2. [ ] ✅ **Esperado**: Botón de aprobar no aparece
3. [ ] Coordinador ve facturas de otras ubicaciones
4. [ ] ✅ **Esperado**: Solo ve facturas de su ubicación

---

## 🐛 TESTING DE ERRORES

### Conexión de Red
- [ ] Con servidores corriendo, simula error de red (DevTools → Network → Offline)
- [ ] Intenta crear factura
- [ ] ✅ **Esperado**: Mensaje de error apropiado
- [ ] Reactiva red
- [ ] ✅ **Esperado**: App funciona de nuevo

### Base de Datos
- [ ] Detén PostgreSQL temporalmente
- [ ] Intenta crear factura
- [ ] ✅ **Esperado**: Error manejado correctamente
- [ ] Reinicia PostgreSQL
- [ ] ✅ **Esperado**: App se recupera

### Sesión Expirada
- [ ] Inicia sesión
- [ ] Borra el token de localStorage (DevTools → Application → Local Storage)
- [ ] Intenta navegar a /bills
- [ ] ✅ **Esperado**: Redirección a /login

---

## 📈 PRUEBAS DE PERFORMANCE

### Tiempo de Carga
- [ ] Con DevTools abierto (F12) → Network tab
- [ ] Recarga la página
- [ ] ✅ **Verificar**: Página carga en < 2 segundos
- [ ] ✅ **Verificar**: Bundle JS < 500KB

### Múltiples Facturas
- [ ] Crea 20+ facturas (o usa datos de prueba)
- [ ] Ve a /bills
- [ ] ✅ **Verificar**: Tabla carga rápidamente
- [ ] Filtra y ordena
- [ ] ✅ **Verificar**: Operaciones son instantáneas

---

## 💾 PRUEBAS DE DATOS

### Validaciones de Formulario
- [ ] Monto negativo → ❌ Error
- [ ] Fecha en el pasado → ⚠️ Advertencia
- [ ] Período inválido → ❌ Error
- [ ] Email duplicado en registro → ❌ Error
- [ ] Contraseña < 6 caracteres → ❌ Error

### Integridad de Datos
- [ ] Crea factura
- [ ] Verifica en PostgreSQL:
  ```sql
  psql -U postgres -d apppagos
  SELECT * FROM utility_bills ORDER BY created_at DESC LIMIT 1;
  ```
- [ ] ✅ **Verificar**: Datos coinciden exactamente

---

## 🎯 CHECKLIST FINAL PRE-PRODUCCIÓN

### Funcionalidad
- [ ] ✅ Todas las funciones principales probadas
- [ ] ✅ No hay errores en consola del navegador
- [ ] ✅ No hay errores en logs del backend
- [ ] ✅ Validaciones funcionan correctamente
- [ ] ✅ Roles y permisos funcionan

### Performance
- [ ] ✅ Página carga rápido (< 2s)
- [ ] ✅ Operaciones son responsive
- [ ] ✅ No hay memory leaks
- [ ] ✅ Lazy loading funciona

### Seguridad
- [ ] ✅ Contraseñas encriptadas
- [ ] ✅ Tokens JWT funcionan
- [ ] ✅ Rutas protegidas
- [ ] ✅ Validaciones de entrada

### UX
- [ ] ✅ Interfaz en español
- [ ] ✅ Mensajes de error claros
- [ ] ✅ Responsive design funciona
- [ ] ✅ Estados de carga visibles

---

## 📝 REPORTE DE BUGS

Anota aquí cualquier problema que encuentres:

| # | Descripción | Severidad | Página | Estado |
|---|-------------|-----------|--------|--------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

**Severidad:**
- 🔴 Crítico: Bloquea funcionalidad principal
- 🟡 Alto: Afecta UX significativamente
- 🟢 Medio: Issue menor
- ⚪ Bajo: Cosmético

---

## ✅ CUANDO COMPLETES TODO

Una vez que:
1. ✅ Todas las funcionalidades están probadas
2. ✅ No hay bugs críticos
3. ✅ Performance es aceptable
4. ✅ UX es buena

**Estarás listo para:**
- 🚀 Migrar a producción (Vercel + Supabase)
- 📦 Deployar en Neon
- 🌐 Compartir con usuarios reales

---

**Próximo paso:** Revisa `OPTIMIZACIONES.md` y `MIGRACION_PRODUCCION.md` que voy a crear ahora.

