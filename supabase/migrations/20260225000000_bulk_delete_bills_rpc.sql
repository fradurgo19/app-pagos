-- RPC para bulk-delete de facturas: corre con privilegios del definer y evita RLS.
-- El backend puede llamarla con anon key; solo borra filas donde user_id = p_user_id.

CREATE OR REPLACE FUNCTION public.bulk_delete_utility_bills(p_user_id uuid, p_ids uuid[])
RETURNS TABLE(deleted_id uuid)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM utility_bills
  WHERE user_id = p_user_id AND id = ANY(p_ids)
  RETURNING id;
$$;

-- Permitir a anon y authenticated (backend usa anon key)
GRANT EXECUTE ON FUNCTION public.bulk_delete_utility_bills(uuid, uuid[]) TO anon;
GRANT EXECUTE ON FUNCTION public.bulk_delete_utility_bills(uuid, uuid[]) TO authenticated;

COMMENT ON FUNCTION public.bulk_delete_utility_bills(uuid, uuid[]) IS 'Elimina facturas por IDs solo si pertenecen a p_user_id; para uso del backend sin service_role.';
