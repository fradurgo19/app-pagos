-- Reemplazar RPC: SQL puro, public.utility_bills, acepta text[] para compatibilidad con el cliente
DROP FUNCTION IF EXISTS public.bulk_delete_utility_bills(uuid, uuid[]);
DROP FUNCTION IF EXISTS public.bulk_delete_utility_bills(uuid, text[]);

CREATE OR REPLACE FUNCTION public.bulk_delete_utility_bills(p_user_id uuid, p_ids text[])
RETURNS TABLE(deleted_id uuid)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.utility_bills
  WHERE user_id = p_user_id
    AND id = ANY(ARRAY(SELECT (unnest(p_ids))::uuid))
  RETURNING id;
$$;

GRANT EXECUTE ON FUNCTION public.bulk_delete_utility_bills(uuid, text[]) TO anon;
GRANT EXECUTE ON FUNCTION public.bulk_delete_utility_bills(uuid, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bulk_delete_utility_bills(uuid, text[]) TO service_role;
