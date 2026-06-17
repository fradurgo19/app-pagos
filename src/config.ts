// Configuración centralizada de la API
export const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '' : 'http://localhost:3000');

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** App provisional: desactiva login y acceso autenticado cuando es true */
export const AUTH_DISABLED = import.meta.env.VITE_AUTH_DISABLED === 'true';

/** URL opcional de la nueva app (botón en pantalla de acceso desactivado) */
export const SUNSET_APP_URL = import.meta.env.VITE_SUNSET_APP_URL || '';

