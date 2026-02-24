-- Reemplazar RPC para aceptar text[] (más compatible con el cliente)
DROP FUNCTION IF EXISTS public.bulk_delete_utility_bills(uuid, uuid[]);

CREATE OR REPLACE FUNCTION public.bulk_delete_utility_bills(p_user_id uuid, p_ids text[])
RETURNS TABLE(deleted_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  id_array uuid[];
BEGIN
  id_array := ARRAY(SELECT (unnest(p_ids))::uuid);
  RETURN QUERY
  DELETE FROM utility_bills
  WHERE user_id = p_user_id AND id = ANY(id_array)
  RETURNING utility_bills.id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.bulk_delete_utility_bills(uuid, text[]) TO anon;
GRANT EXECUTE ON FUNCTION public.bulk_delete_utility_bills(uuid, text[]) TO authenticated;
