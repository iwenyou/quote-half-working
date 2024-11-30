-- Drop existing policies
DROP POLICY IF EXISTS "quotes_select" ON quotes;
DROP POLICY IF EXISTS "quotes_insert" ON quotes;
DROP POLICY IF EXISTS "quotes_update" ON quotes;
DROP POLICY IF EXISTS "quotes_delete" ON quotes;
DROP POLICY IF EXISTS "orders_select" ON orders;
DROP POLICY IF EXISTS "orders_insert" ON orders;
DROP POLICY IF EXISTS "orders_update" ON orders;
DROP POLICY IF EXISTS "orders_delete" ON orders;
DROP POLICY IF EXISTS "receipts_select" ON receipts;
DROP POLICY IF EXISTS "receipts_insert" ON receipts;
DROP POLICY IF EXISTS "receipts_update" ON receipts;
DROP POLICY IF EXISTS "receipts_delete" ON receipts;

-- Quotes policies
CREATE POLICY "quotes_select" ON quotes
FOR SELECT USING (
  auth.role() = 'authenticated' AND
  (
    auth.jwt()->>'role' IN ('admin', 'sales') OR
    user_id = auth.uid() OR
    status IN ('approved', 'pending')
  )
);

CREATE POLICY "quotes_insert" ON quotes
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  auth.jwt()->>'role' IN ('admin', 'sales') AND
  user_id = auth.uid() AND
  created_by = auth.uid()
);

CREATE POLICY "quotes_update" ON quotes
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  auth.jwt()->>'role' IN ('admin', 'sales') AND
  (user_id = auth.uid() OR created_by = auth.uid())
);

CREATE POLICY "quotes_delete" ON quotes
FOR DELETE USING (
  auth.role() = 'authenticated' AND
  auth.jwt()->>'role' IN ('admin', 'sales') AND
  (user_id = auth.uid() OR created_by = auth.uid())
);

-- Orders policies
CREATE POLICY "orders_select" ON orders
FOR SELECT USING (
  auth.role() = 'authenticated' AND
  (
    auth.jwt()->>'role' IN ('admin', 'sales') OR
    user_id = auth.uid() OR
    (quote_id IS NOT NULL AND status != 'cancelled')
  )
);

CREATE POLICY "orders_insert" ON orders
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  auth.jwt()->>'role' IN ('admin', 'sales') AND
  user_id = auth.uid() AND
  created_by = auth.uid()
);

CREATE POLICY "orders_update" ON orders
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  auth.jwt()->>'role' IN ('admin', 'sales') AND
  (user_id = auth.uid() OR created_by = auth.uid())
);

CREATE POLICY "orders_delete" ON orders
FOR DELETE USING (
  auth.role() = 'authenticated' AND
  auth.jwt()->>'role' IN ('admin', 'sales') AND
  (user_id = auth.uid() OR created_by = auth.uid())
);

-- Receipts policies
CREATE POLICY "receipts_select" ON receipts
FOR SELECT USING (
  auth.role() = 'authenticated' AND
  (
    auth.jwt()->>'role' IN ('admin', 'sales') OR
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = receipts.order_id
      AND (
        orders.user_id = auth.uid() OR
        orders.status != 'cancelled'
      )
    )
  )
);

CREATE POLICY "receipts_insert" ON receipts
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  auth.jwt()->>'role' IN ('admin', 'sales') AND
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_id
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "receipts_update" ON receipts
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  auth.jwt()->>'role' IN ('admin', 'sales') AND
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_id
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "receipts_delete" ON receipts
FOR DELETE USING (
  auth.role() = 'authenticated' AND
  auth.jwt()->>'role' IN ('admin', 'sales') AND
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_id
    AND orders.user_id = auth.uid()
  )
);