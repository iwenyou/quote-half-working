import { z } from 'zod';

export const quoteSchema = z.object({
  client_name: z.string().min(1, "Client name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  project_name: z.string().min(1, "Project name is required"),
  installation_address: z.string().min(1, "Installation address is required"),
  status: z.enum(['draft', 'pending', 'approved', 'rejected']).default('draft'),
  total: z.number().min(0, "Total must be non-negative").default(0),
  adjustment_type: z.enum(['discount', 'surcharge']).optional(),
  adjustment_percentage: z.number().min(0).max(100).optional(),
  adjusted_total: z.number().min(0).optional(),
  notes: z.string().optional(),
  valid_until: z.string().optional()
});

export const spaceSchema = z.object({
  name: z.string().min(1, "Space name is required"),
  description: z.string().optional(),
  dimensions: z.string().optional(),
  notes: z.string().optional(),
  sort_order: z.number().default(0),
  items: z.array(z.any()).optional() // Will be validated separately
});

export const itemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  product_id: z.string().uuid().optional(),
  material_id: z.string().uuid().optional(),
  width: z.number().positive("Width must be positive"),
  height: z.number().positive("Height must be positive"),
  depth: z.number().positive("Depth must be positive"),
  quantity: z.number().int().positive("Quantity must be positive").default(1),
  unit_price: z.number().min(0, "Unit price cannot be negative"),
  total_price: z.number().min(0, "Total price cannot be negative"),
  sort_order: z.number().default(0),
  notes: z.string().optional()
});