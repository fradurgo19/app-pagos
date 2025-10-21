// Configuración centralizada de la API
export const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '' : 'http://localhost:3000');

// Debug: Log para verificar qué URL se está usando
console.log('🔧 API_URL configurada:', API_URL);
console.log('🔧 VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('🔧 PROD mode:', import.meta.env.PROD);

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

