-- Add policies to allow test operations for authenticated users

-- Fix quotes policies
CREATE POLICY "Allow test quote insertions" ON quotes
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  (
    auth.jwt()->>'role' IN ('admin', 'sales') OR
    user_id = auth.uid()
  )
);

-- Fix orders policies
CREATE POLICY "Allow test order insertions" ON orders
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  (
    auth.jwt()->>'role' IN ('admin', 'sales') OR
    user_id = auth.uid()
  )
);

-- Fix receipts policies
CREATE POLICY "Allow test receipt insertions" ON receipts
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = receipts.order_id
    AND (
      auth.jwt()->>'role' IN ('admin', 'sales') OR
      orders.user_id = auth.uid()
    )
  )
);

-- Add cleanup policies
CREATE POLICY "Allow test cleanup" ON quotes
FOR DELETE
USING (
  auth.role() = 'authenticated' AND
  (
    auth.jwt()->>'role' IN ('admin', 'sales') OR
    user_id = auth.uid()
  )
);

CREATE POLICY "Allow test cleanup" ON orders
FOR DELETE
USING (
  auth.role() = 'authenticated' AND
  (
    auth.jwt()->>'role' IN ('admin', 'sales') OR
    user_id = auth.uid()
  )
);

CREATE POLICY "Allow test cleanup" ON receipts
FOR DELETE
USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = receipts.order_id
    AND (
      auth.jwt()->>'role' IN ('admin', 'sales') OR
      orders.user_id = auth.uid()
    )
  )
);