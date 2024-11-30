-- Drop existing policies that we'll replace
DROP POLICY IF EXISTS "Sales quotes insert" ON quotes;
DROP POLICY IF EXISTS "Sales quotes update" ON quotes;
DROP POLICY IF EXISTS "Sales orders insert" ON orders;
DROP POLICY IF EXISTS "Sales orders update" ON orders;
DROP POLICY IF EXISTS "Allow test quote insertions" ON quotes;
DROP POLICY IF EXISTS "Allow test order insertions" ON orders;
DROP POLICY IF EXISTS "Allow test receipt insertions" ON receipts;
DROP POLICY IF EXISTS "Allow test cleanup" ON quotes;
DROP POLICY IF EXISTS "Allow test cleanup" ON orders;
DROP POLICY IF EXISTS "Allow test cleanup" ON receipts;

-- Simplified quotes policies
CREATE POLICY "Role-based quotes access"
ON quotes
FOR ALL
USING (
  auth.jwt()->>'role' IN ('admin', 'sales') AND
  auth.uid() IS NOT NULL
)
WITH CHECK (
  auth.jwt()->>'role' IN ('admin', 'sales') AND
  auth.uid() IS NOT NULL AND
  user_id = auth.uid() AND
  created_by = auth.uid()
);

-- Simplified orders policies
CREATE POLICY "Role-based orders access"
ON orders
FOR ALL
USING (
  auth.jwt()->>'role' IN ('admin', 'sales') AND
  auth.uid() IS NOT NULL
)
WITH CHECK (
  auth.jwt()->>'role' IN ('admin', 'sales') AND
  auth.uid() IS NOT NULL AND
  user_id = auth.uid() AND
  created_by = auth.uid()
);

-- Simplified receipts policies
CREATE POLICY "Role-based receipts access"
ON receipts
FOR ALL
USING (
  auth.jwt()->>'role' IN ('admin', 'sales') AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = receipts.order_id
    AND orders.user_id = auth.uid()
  )
)
WITH CHECK (
  auth.jwt()->>'role' IN ('admin', 'sales') AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = receipts.order_id
    AND orders.user_id = auth.uid()
  )
);

-- Public access for client views
CREATE POLICY "Public quote view"
ON quotes
FOR SELECT
USING (status IN ('approved', 'pending'));

CREATE POLICY "Public order view"
ON orders
FOR SELECT
USING (
  quote_id IS NOT NULL AND
  status != 'cancelled'
);

CREATE POLICY "Public receipt view"
ON receipts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = receipts.order_id
    AND orders.status != 'cancelled'
  )
);