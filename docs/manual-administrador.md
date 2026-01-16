# Sistema de Gestión

Control y seguimiento de facturas empresariales

Este manual explica, de forma breve, cómo usar los módulos principales del sistema con permisos de administrador.

Sitio base: `https://app-pagos-rho.vercel.app`

---

## 1) Ingresar a la aplicación
1. Abre tu navegador (Chrome/Edge recomendado).
2. Ve a `https://app-pagos-rho.vercel.app`.
3. Inicia sesión con tu usuario y contraseña de administrador.

---

## 2) Módulo de Facturación
Ruta: `Nueva factura` → [`/new-bill`](https://app-pagos-rho.vercel.app/new-bill)

- Crear factura: completa cliente, ítems, impuestos y guarda/emite.
- Editar/Anular (si tu rol lo permite): abre la factura desde el listado y realiza la acción disponible.

Buenas prácticas:
- Verifica datos del cliente y NIT antes de emitir.
- Revisa impuestos y totales.

---

## 3) Módulo de Reportes
Ruta: `Reportes` → [`/reports`](https://app-pagos-rho.vercel.app/reports)

- Filtros por fecha, estado, cliente.
- Exporta resultados con el botón de exportación o imprime a PDF (ver sección 7).
- Úsalo para seguimiento de ventas, estados de cobro y auditoría.

---

## 4) Gestión de Usuarios (si está disponible)
- Crear usuarios: define nombre, email y rol.
- Editar usuarios: actualizar datos, activar/desactivar.
- Roles y permisos: asigna roles según responsabilidades.

Recomendaciones de seguridad:
- Usa contraseñas seguras y cambia periódicamente.
- Desactiva cuentas inactivas.

---

## 5) Configuración (si está disponible)
- Parámetros de empresa: razón social, NIT, direcciones.
- Impuestos y series de numeración.
- Preferencias de facturación y formatos.

Antes de guardar:
- Revisa que los cambios no afecten la numeración activa ni impuestos vigentes.

---

## 6) Auditoría y control (si está disponible)
- Revisar bitácoras: accesos, cambios de configuración, acciones de usuarios.
- Cruces de información: compara reportes por períodos.

---

## 7) Exportar/Descargar a PDF desde el navegador
1. Presiona `Ctrl + P` (Windows) en la página que deseas exportar.
2. En "Destino" elige "Guardar como PDF".
3. Ajusta márgenes y orientación si es necesario.
4. Haz clic en "Guardar".

---

## 8) Resolución de problemas
- Si un módulo no carga: refresca (`Ctrl + R`) y verifica conexión.
- Si no ves opciones de administrador: cierra sesión y vuelve a entrar; confirma tu rol con TI.
- Errores recurrentes: captura pantalla y envía a soporte.

---

Referencias:
- Nueva factura: [`https://app-pagos-rho.vercel.app/new-bill`](https://app-pagos-rho.vercel.app/new-bill)
- Reportes: [`https://app-pagos-rho.vercel.app/reports`](https://app-pagos-rho.vercel.app/reports)
