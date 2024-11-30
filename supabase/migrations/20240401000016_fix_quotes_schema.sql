-- Drop existing quotes-related tables if they exist
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS spaces;
DROP TABLE IF EXISTS quotes;

-- Create quotes table with updated schema
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  client_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  project_name TEXT NOT NULL,
  installation_address TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'approved', 'rejected')) DEFAULT 'draft',
  total NUMERIC NOT NULL CHECK (total >= 0),
  adjustment_type TEXT CHECK (adjustment_type IN ('discount', 'surcharge')),
  adjustment_percentage NUMERIC CHECK (adjustment_percentage BETWEEN 0 AND 100),
  adjusted_total NUMERIC CHECK (adjusted_total >= 0),
  notes TEXT,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create spaces table
CREATE TABLE spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  dimensions TEXT,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create items table with enhanced schema
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  material_id UUID REFERENCES materials(id),
  name TEXT NOT NULL,
  description TEXT,
  width NUMERIC NOT NULL CHECK (width > 0),
  height NUMERIC NOT NULL CHECK (height > 0),
  depth NUMERIC NOT NULL CHECK (depth > 0),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC NOT NULL CHECK (total_price >= 0),
  sort_order INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add triggers for updated_at columns
CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spaces_updated_at
  BEFORE UPDATE ON spaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_quotes_created_by ON quotes(created_by);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created_at ON quotes(created_at);
CREATE INDEX idx_spaces_quote_id ON spaces(quote_id);
CREATE INDEX idx_spaces_sort_order ON spaces(sort_order);
CREATE INDEX idx_items_space_id ON items(space_id);
CREATE INDEX idx_items_product_id ON items(product_id);
CREATE INDEX idx_items_material_id ON items(material_id);
CREATE INDEX idx_items_sort_order ON items(sort_order);