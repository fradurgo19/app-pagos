-- RPC: si el actor es area_coordinator borra por ids; si no, solo borra filas con user_id = actor
DROP FUNCTION IF EXISTS public.bulk_delete_utility_bills(uuid, uuid[]);
DROP FUNCTION IF EXISTS public.bulk_delete_utility_bills(uuid, text[]);

CREATE OR REPLACE FUNCTION public.bulk_delete_utility_bills(p_actor_id uuid, p_ids text[])
RETURNS TABLE(deleted_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_coordinator boolean;
  id_arr uuid[];
BEGIN
  id_arr := ARRAY(SELECT (unnest(p_ids))::uuid);

  SELECT (role = 'area_coordinator') INTO is_coordinator
  FROM public.profiles WHERE id = p_actor_id LIMIT 1;

  IF is_coordinator THEN
    RETURN QUERY DELETE FROM public.utility_bills WHERE id = ANY(id_arr) RETURNING id;
  ELSE
    RETURN QUERY DELETE FROM public.utility_bills
    WHERE user_id = p_actor_id AND id = ANY(id_arr) RETURNING id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.bulk_delete_utility_bills(uuid, text[]) TO anon;
GRANT EXECUTE ON FUNCTION public.bulk_delete_utility_bills(uuid, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bulk_delete_utility_bills(uuid, text[]) TO service_role;
