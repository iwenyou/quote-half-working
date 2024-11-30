-- Function to calculate item total price
CREATE OR REPLACE FUNCTION calculate_item_total_price()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_price = NEW.unit_price * NEW.quantity;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update quote total
CREATE OR REPLACE FUNCTION update_quote_total()
RETURNS TRIGGER AS $$
DECLARE
  new_total NUMERIC;
  adjusted_amount NUMERIC;
BEGIN
  -- Calculate new total from all items
  SELECT COALESCE(SUM(total_price), 0)
  INTO new_total
  FROM items i
  JOIN spaces s ON s.id = i.space_id
  WHERE s.quote_id = (
    CASE
      WHEN TG_TABLE_NAME = 'quotes' THEN NEW.id
      WHEN TG_TABLE_NAME = 'spaces' THEN NEW.quote_id
      WHEN TG_TABLE_NAME = 'items' THEN (SELECT quote_id FROM spaces WHERE id = NEW.space_id)
    END
  );

  -- Update quote
  UPDATE quotes
  SET total = new_total,
      adjusted_total = CASE
        WHEN adjustment_type = 'discount' THEN new_total * (1 - adjustment_percentage / 100)
        WHEN adjustment_type = 'surcharge' THEN new_total * (1 + adjustment_percentage / 100)
        ELSE new_total
      END
  WHERE id = (
    CASE
      WHEN TG_TABLE_NAME = 'quotes' THEN NEW.id
      WHEN TG_TABLE_NAME = 'spaces' THEN NEW.quote_id
      WHEN TG_TABLE_NAME = 'items' THEN (SELECT quote_id FROM spaces WHERE id = NEW.space_id)
    END
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER calculate_item_total
  BEFORE INSERT OR UPDATE OF quantity, unit_price ON items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_item_total_price();

CREATE TRIGGER update_quote_total_on_item
  AFTER INSERT OR UPDATE OR DELETE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_quote_total();

CREATE TRIGGER update_quote_total_on_space
  AFTER INSERT OR UPDATE OR DELETE ON spaces
  FOR EACH ROW
  EXECUTE FUNCTION update_quote_total();

-- Function to copy a quote
CREATE OR REPLACE FUNCTION copy_quote(quote_id UUID, user_id UUID)
RETURNS UUID AS $$
DECLARE
  new_quote_id UUID;
  new_space_id UUID;
BEGIN
  -- Copy quote
  INSERT INTO quotes (
    user_id,
    created_by,
    client_name,
    email,
    phone,
    project_name,
    installation_address,
    status,
    notes
  )
  SELECT
    user_id,
    user_id,
    client_name || ' (Copy)',
    email,
    phone,
    project_name || ' (Copy)',
    installation_address,
    'draft',
    notes
  FROM quotes
  WHERE id = quote_id
  RETURNING id INTO new_quote_id;

  -- Copy spaces
  FOR new_space_id IN
    WITH new_spaces AS (
      INSERT INTO spaces (
        quote_id,
        name,
        description,
        dimensions,
        notes,
        sort_order
      )
      SELECT
        new_quote_id,
        name,
        description,
        dimensions,
        notes,
        sort_order
      FROM spaces
      WHERE quote_id = quote_id
      RETURNING id, (SELECT id FROM spaces WHERE quote_id = quote_id AND sort_order = spaces.sort_order) as old_space_id
    )
    -- Copy items
    INSERT INTO items (
      space_id,
      product_id,
      material_id,
      name,
      description,
      width,
      height,
      depth,
      quantity,
      unit_price,
      total_price,
      sort_order,
      notes
    )
    SELECT
      new_spaces.id,
      product_id,
      material_id,
      name,
      description,
      width,
      height,
      depth,
      quantity,
      unit_price,
      total_price,
      sort_order,
      notes
    FROM items
    JOIN new_spaces ON new_spaces.old_space_id = items.space_id
    RETURNING space_id
  LOOP
    -- Space copied
  END LOOP;

  RETURN new_quote_id;
END;
$$ LANGUAGE plpgsql;