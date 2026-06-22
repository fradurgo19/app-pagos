/**
 * Interruptor de la app provisional.
 *
 * Prioridad:
 *   1. Variable de entorno (Vercel / .env)
 *   2. PROVISIONAL_APP_DISABLED_DEFAULT (este archivo)
 *
 * Desactivar:  VITE_AUTH_DISABLED=true   o default true + redeploy
 * Reactivar:   VITE_AUTH_DISABLED=false  o default false + redeploy
 */
const PROVISIONAL_APP_DISABLED_DEFAULT = true;

const parseEnvFlag = (value: string | undefined): boolean | undefined => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
};

export const isProvisionalAppDisabled = (): boolean => {
  const envOverride = parseEnvFlag(import.meta.env.VITE_AUTH_DISABLED);
  return envOverride ?? PROVISIONAL_APP_DISABLED_DEFAULT;
};

export const AUTH_DISABLED = isProvisionalAppDisabled();

/** URL opcional de la nueva app (botón en pantalla de mantenimiento) */
export const SUNSET_APP_URL = import.meta.env.VITE_SUNSET_APP_URL || '';
