import { z } from 'zod';
import { Quote, Space, CabinetItem } from '../types/quote';
import { showError } from './notifications';
import { logDebug } from './logger';

const cabinetItemSchema = z.object({
  id: z.string(),
  product_id: z.string().optional(),
  material_id: z.string().optional(),
  width: z.number().positive('Width must be greater than 0'),
  height: z.number().positive('Height must be greater than 0'),
  depth: z.number().positive('Depth must be greater than 0'),
  price: z.number().nonnegative('Price cannot be negative'),
  unit_price: z.number().optional(),
  total_price: z.number().optional(),
  spaceName: z.string().optional(),
  sort_order: z.number().optional(),
  notes: z.string().optional(),
});

const spaceSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Space name is required'),
  items: z.array(cabinetItemSchema),
  dimensions: z.string().optional(),
  notes: z.string().optional(),
  sort_order: z.number().optional(),
  quote_id: z.string().optional(),
});

const quoteSchema = z.object({
  client_name: z.string().min(1, 'Client name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  project_name: z.string().min(1, 'Project name is required'),
  installation_address: z.string().min(1, 'Installation address is required'),
  spaces: z.array(spaceSchema).min(1, 'At least one space is required'),
  status: z.enum(['draft', 'pending', 'approved', 'rejected']),
  total: z.number().nonnegative('Total cannot be negative'),
  adjustment_type: z.enum(['discount', 'surcharge']).optional(),
  adjustment_percentage: z.number().min(0).max(100).optional(),
  adjusted_total: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  valid_until: z.string().optional(),
});

export function validateQuote(data: any): Quote | null {
  try {
    logDebug('validateQuote', 'Validating quote data', { data });
    const validatedData = quoteSchema.parse(data);
    return validatedData;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      showError(errors.map((e) => `${e.path}: ${e.message}`).join('\n'));
      logDebug('validateQuote', 'Validation failed', { errors });
    } else {
      showError('An unexpected error occurred during validation');
      logDebug('validateQuote', 'Unexpected validation error', { error });
    }
    return null;
  }
}

export function validateSpace(data: any): Space | null {
  try {
    const validatedData = spaceSchema.parse(data);
    return validatedData;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      showError(errors.map((e) => `${e.path}: ${e.message}`).join('\n'));
    } else {
      showError('An unexpected error occurred during validation');
    }
    return null;
  }
}

export function validateCabinetItem(data: any): CabinetItem | null {
  try {
    const validatedData = cabinetItemSchema.parse(data);
    return validatedData;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      showError(errors.map((e) => `${e.path}: ${e.message}`).join('\n'));
    } else {
      showError('An unexpected error occurred during validation');
    }
    return null;
  }
}
