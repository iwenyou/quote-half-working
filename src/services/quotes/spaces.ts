import { supabase } from '../../lib/supabase';
import { Space } from '../../types/quote';
import { logError, logDebug } from '../../utils/logger';
import { spaceSchema, itemSchema } from './validation';

export async function createSpaceWithItems(quoteId: string, space: Space) {
  const context = 'createSpaceWithItems';
  try {
    logDebug(context, 'Creating space with items', { quoteId });

    // Validate space data
    const validatedSpace = spaceSchema.parse({
      name: space.name,
      description: space.description,
      dimensions: space.dimensions,
      notes: space.notes,
      sort_order: space.sort_order || 0
    });

    // Create space
    const { data: spaceData, error: spaceError } = await supabase
      .from('spaces')
      .insert([{
        quote_id: quoteId,
        ...validatedSpace
      }])
      .select()
      .single();

    if (spaceError) {
      logError(context, spaceError);
      throw spaceError;
    }

    // Create items if they exist
    if (space.items?.length) {
      const validatedItems = space.items.map(item => itemSchema.parse({
        name: item.name || 'Custom Item',
        description: item.description,
        product_id: item.product_id,
        material_id: item.material_id,
        width: item.width,
        height: item.height,
        depth: item.depth,
        quantity: item.quantity || 1,
        unit_price: item.unit_price || item.price,
        total_price: item.total_price || item.price,
        sort_order: item.sort_order || 0,
        notes: item.notes
      }));

      const items = validatedItems.map(item => ({
        space_id: spaceData.id,
        ...item
      }));

      const { error: itemsError } = await supabase
        .from('items')
        .insert(items);

      if (itemsError) {
        logError(context, itemsError);
        throw itemsError;
      }
    }

    return spaceData;
  } catch (error) {
    logError(context, error);
    throw error;
  }
}

export async function updateSpace(id: string, updates: Partial<Space>) {
  const context = 'updateSpace';
  try {
    // Validate updates
    const validatedUpdates = spaceSchema.partial().parse(updates);

    const { data, error } = await supabase
      .from('spaces')
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
    throw new Error('Failed to update space');
  }
}

export async function deleteSpace(id: string) {
  const context = 'deleteSpace';
  try {
    const { error } = await supabase
      .from('spaces')
      .delete()
      .eq('id', id);

    if (error) {
      logError(context, error);
      throw error;
    }
  } catch (error) {
    logError(context, error);
    throw new Error('Failed to delete space');
  }
}

export async function getSpacesByQuoteId(quoteId: string) {
  const context = 'getSpacesByQuoteId';
  try {
    const { data, error } = await supabase
      .from('spaces')
      .select(`
        *,
        items (*)
      `)
      .eq('quote_id', quoteId)
      .order('sort_order');

    if (error) {
      logError(context, error);
      throw error;
    }

    return data || [];
  } catch (error) {
    logError(context, error);
    throw new Error('Failed to fetch spaces');
  }
}