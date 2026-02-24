-- Permitir a usuarios eliminar sus propias facturas en cualquier estado (no solo draft).
-- La política "Users can delete own draft bills" solo permite status = 'draft'.
-- Esta política permite DELETE cuando auth.uid() = user_id (cualquier status).
-- Nota: El backend debe usar SUPABASE_SERVICE_KEY (service role) para que los
-- deletes desde la API bypass RLS; con anon key auth.uid() es null y no se elimina nada.

CREATE POLICY "Users can delete own bills"
  ON utility_bills FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
