-- Drop existing policies
DROP POLICY IF EXISTS "Role-based quotes access" ON quotes;
DROP POLICY IF EXISTS "Role-based orders access" ON orders;
DROP POLICY IF EXISTS "Role-based receipts access" ON receipts;

-- Simplified quotes policies with separate rules for different operations
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
  auth.jwt()->>'role' IN ('admin', 'sales')
);

CREATE POLICY "quotes_update" ON quotes
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  auth.jwt()->>'role' IN ('admin', 'sales')
);

CREATE POLICY "quotes_delete" ON quotes
FOR DELETE USING (
  auth.role() = 'authenticated' AND
  auth.jwt()->>'role' IN ('admin', 'sales')
);

-- Simplified orders policies
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
  auth.jwt()->>'role' IN ('admin', 'sales')
);

CREATE POLICY "orders_update" ON orders
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  auth.jwt()->>'role' IN ('admin', 'sales')
);

CREATE POLICY "orders_delete" ON orders
FOR DELETE USING (
  auth.role() = 'authenticated' AND
  auth.jwt()->>'role' IN ('admin', 'sales')
);

-- Simplified receipts policies
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
  auth.jwt()->>'role' IN ('admin', 'sales')
);

CREATE POLICY "receipts_update" ON receipts
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  auth.jwt()->>'role' IN ('admin', 'sales')
);

CREATE POLICY "receipts_delete" ON receipts
FOR DELETE USING (
  auth.role() = 'authenticated' AND
  auth.jwt()->>'role' IN ('admin', 'sales')
);