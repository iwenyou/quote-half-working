-- Drop existing policies
DROP POLICY IF EXISTS "quotes_select" ON quotes;
DROP POLICY IF EXISTS "quotes_insert" ON quotes;
DROP POLICY IF EXISTS "quotes_update" ON quotes;
DROP POLICY IF EXISTS "quotes_delete" ON quotes;

-- Quotes policies
CREATE POLICY "quotes_select" ON quotes
FOR SELECT USING (
  auth.role() = 'authenticated' AND
  (
    auth.jwt()->>'role' IN ('admin', 'sales') OR
    created_by = auth.uid() OR
    status IN ('approved', 'pending')
  )
);

CREATE POLICY "quotes_insert" ON quotes
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  auth.jwt()->>'role' IN ('admin', 'sales') AND
  created_by = auth.uid()
);

CREATE POLICY "quotes_update" ON quotes
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  auth.jwt()->>'role' IN ('admin', 'sales') AND
  created_by = auth.uid()
);

CREATE POLICY "quotes_delete" ON quotes
FOR DELETE USING (
  auth.role() = 'authenticated' AND
  auth.jwt()->>'role' IN ('admin', 'sales') AND
  created_by = auth.uid()
);

-- Spaces policies
CREATE POLICY "spaces_select" ON spaces
FOR SELECT USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM quotes
    WHERE quotes.id = spaces.quote_id
    AND (
      auth.jwt()->>'role' IN ('admin', 'sales') OR
      quotes.created_by = auth.uid() OR
      quotes.status IN ('approved', 'pending')
    )
  )
);

CREATE POLICY "spaces_insert" ON spaces
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  auth.jwt()->>'role' IN ('admin', 'sales') AND
  EXISTS (
    SELECT 1 FROM quotes
    WHERE quotes.id = quote_id
    AND quotes.created_by = auth.uid()
  )
);

CREATE POLICY "spaces_update" ON spaces
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  auth.jwt()->>'role' IN ('admin', 'sales') AND
  EXISTS (
    SELECT 1 FROM quotes
    WHERE quotes.id = quote_id
    AND quotes.created_by = auth.uid()
  )
);

CREATE POLICY "spaces_delete" ON spaces
FOR DELETE USING (
  auth.role() = 'authenticated' AND
  auth.jwt()->>'role' IN ('admin', 'sales') AND
  EXISTS (
    SELECT 1 FROM quotes
    WHERE quotes.id = quote_id
    AND quotes.created_by = auth.uid()
  )
);

-- Items policies
CREATE POLICY "items_select" ON items
FOR SELECT USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM spaces
    JOIN quotes ON quotes.id = spaces.quote_id
    WHERE spaces.id = items.space_id
    AND (
      auth.jwt()->>'role' IN ('admin', 'sales') OR
      quotes.created_by = auth.uid() OR
      quotes.status IN ('approved', 'pending')
    )
  )
);

CREATE POLICY "items_insert" ON items
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  auth.jwt()->>'role' IN ('admin', 'sales') AND
  EXISTS (
    SELECT 1 FROM spaces
    JOIN quotes ON quotes.id = spaces.quote_id
    WHERE spaces.id = space_id
    AND quotes.created_by = auth.uid()
  )
);

CREATE POLICY "items_update" ON items
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  auth.jwt()->>'role' IN ('admin', 'sales') AND
  EXISTS (
    SELECT 1 FROM spaces
    JOIN quotes ON quotes.id = spaces.quote_id
    WHERE spaces.id = space_id
    AND quotes.created_by = auth.uid()
  )
);

CREATE POLICY "items_delete" ON items
FOR DELETE USING (
  auth.role() = 'authenticated' AND
  auth.jwt()->>'role' IN ('admin', 'sales') AND
  EXISTS (
    SELECT 1 FROM spaces
    JOIN quotes ON quotes.id = spaces.quote_id
    WHERE spaces.id = space_id
    AND quotes.created_by = auth.uid()
  )
);