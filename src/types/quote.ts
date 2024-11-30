export interface CabinetItem {
  id: string;
  product_id?: string;
  material_id?: string;
  width: number;
  height: number;
  depth: number;
  price: number;
  unit_price?: number;
  total_price?: number;
  spaceName?: string;
  sort_order?: number;
  notes?: string;
}

export interface Space {
  id: string;
  name: string;
  items: CabinetItem[];
  dimensions?: string;
  notes?: string;
  sort_order?: number;
  quote_id?: string;
}

export interface Quote {
  id?: string;
  client_name: string;
  email: string;
  phone: string;
  project_name: string;
  installation_address: string;
  spaces: Space[];
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  total: number;
  adjustment_type?: 'discount' | 'surcharge';
  adjustment_percentage?: number;
  adjusted_total?: number;
  notes?: string;
  valid_until?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}
