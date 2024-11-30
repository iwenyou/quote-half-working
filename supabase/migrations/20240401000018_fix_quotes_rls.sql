-- Drop existing policies
DROP POLICY IF EXISTS "quotes_select" ON quotes;
DROP POLICY IF EXISTS "quotes_insert" ON quotes;
DROP POLICY IF EXISTS "quotes_update" ON quotes;
DROP POLICY IF EXISTS "quotes_delete" ON quotes;
DROP POLICY IF EXISTS "spaces_select" ON spaces;
DROP POLICY IF EXISTS "spaces_insert" ON spaces;
DROP POLICY IF EXISTS "spaces_update" ON spaces;
DROP POLICY IF EXISTS "spaces_delete" ON spaces;
DROP POLICY IF EXISTS "items_select" ON items;
DROP POLICY IF EXISTS "items_insert" ON items;
DROP POLICY IF EXISTS "items_update" ON items;
DROP POLICY IF EXISTS "items_delete" ON items;

-- Enable RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Quotes policies
CREATE POLICY "anyone_can_read_quotes"
ON quotes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "admins_and_sales_can_create_quotes"
ON quotes FOR INSERT
TO authenticated
WITH CHECK (auth.jwt()->>'role' IN ('admin', 'sales'));

CREATE POLICY "admins_and_sales_can_update_quotes"
ON quotes FOR UPDATE
TO authenticated
USING (auth.jwt()->>'role' IN ('admin', 'sales'));

CREATE POLICY "admins_and_sales_can_delete_quotes"
ON quotes FOR DELETE
TO authenticated
USING (auth.jwt()->>'role' IN ('admin', 'sales'));

-- Spaces policies
CREATE POLICY "anyone_can_read_spaces"
ON spaces FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "admins_and_sales_can_create_spaces"
ON spaces FOR INSERT
TO authenticated
WITH CHECK (auth.jwt()->>'role' IN ('admin', 'sales'));

CREATE POLICY "admins_and_sales_can_update_spaces"
ON spaces FOR UPDATE
TO authenticated
USING (auth.jwt()->>'role' IN ('admin', 'sales'));

CREATE POLICY "admins_and_sales_can_delete_spaces"
ON spaces FOR DELETE
TO authenticated
USING (auth.jwt()->>'role' IN ('admin', 'sales'));

-- Items policies
CREATE POLICY "anyone_can_read_items"
ON items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "admins_and_sales_can_create_items"
ON items FOR INSERT
TO authenticated
WITH CHECK (auth.jwt()->>'role' IN ('admin', 'sales'));

CREATE POLICY "admins_and_sales_can_update_items"
ON items FOR UPDATE
TO authenticated
USING (auth.jwt()->>'role' IN ('admin', 'sales'));

CREATE POLICY "admins_and_sales_can_delete_items"
ON items FOR DELETE
TO authenticated
USING (auth.jwt()->>'role' IN ('admin', 'sales'));