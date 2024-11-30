import { supabase } from '../../lib/supabase';
import { CabinetItem } from '../../types/quote';
import { logError, logDebug } from '../../utils/logger';
import { itemSchema } from './validation';

export async function updateItem(id: string, updates: Partial<CabinetItem>) {
  const context = 'updateItem';
  try {
    // Validate updates
    const validatedUpdates = itemSchema.partial().parse(updates);

    const { data, error } = await supabase
      .from('items')
      .update(validatedUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logError(context, error);
      throw error;
    }

    return data;
  } catch (error) {
    logError(context, error);
    throw new Error('Failed to update item');
  }
}

export async function deleteItem(id: string) {
  const context = 'deleteItem';
  try {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (error) {
      logError(context, error);
      throw error;
    }
  } catch (error) {
    logError(context, error);
    throw new Error('Failed to delete item');
  }
}

export async function getItemsBySpaceId(spaceId: string) {
  const context = 'getItemsBySpaceId';
  try {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        product:products(*),
        material:materials(*)
      `)
      .eq('space_id', spaceId)
      .order('sort_order');

    if (error) {
      logError(context, error);
      throw error;
    }

    return data || [];
  } catch (error) {
    logError(context, error);
    throw new Error('Failed to fetch items');
  }
}

export async function calculateItemTotal(item: Partial<CabinetItem>): Promise<number> {
  const quantity = item.quantity || 1;
  const unitPrice = item.unit_price || item.price || 0;
  return quantity * unitPrice;
}