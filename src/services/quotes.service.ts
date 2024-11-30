import { supabase } from '../lib/supabase';
import { z } from 'zod';
import { logError, logDebug } from '../utils/logger';
import { Quote, Space, CabinetItem } from '../types/quote';

export async function getQuotes() {
  const context = 'getQuotes';
  try {
    logDebug(context, 'Fetching quotes');
    
    const { data, error } = await supabase
      .from('quotes')
      .select(`
        *,
        spaces (
          *,
          items (*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      logError(context, error);
      throw error;
    }

    logDebug(context, `Found ${data?.length || 0} quotes`);
    return data || [];
  } catch (error) {
    logError(context, error);
    throw new Error('Failed to fetch quotes');
  }
}

export async function getQuoteById(id: string) {
  const context = 'getQuoteById';
  try {
    logDebug(context, `Fetching quote ${id}`);

    const { data, error } = await supabase
      .from('quotes')
      .select(`
        *,
        spaces (
          *,
          items (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      logError(context, error);
      throw error;
    }

    return data;
  } catch (error) {
    logError(context, error);
    throw new Error('Failed to fetch quote');
  }
}

async function createSpaceWithItems(quoteId: string, space: Space) {
  const context = 'createSpaceWithItems';
  try {
    // Create space
    const { data: spaceData, error: spaceError } = await supabase
      .from('spaces')
      .insert([{
        quote_id: quoteId,
        name: space.name,
        description: space.description,
        dimensions: space.dimensions,
        notes: space.notes,
        sort_order: space.sort_order || 0
      }])
      .select()
      .single();

    if (spaceError) throw spaceError;

    // Create items if they exist
    if (space.items && space.items.length > 0) {
      const items = space.items.map(item => ({
        space_id: spaceData.id,
        product_id: item.product_id,
        material_id: item.material_id,
        name: item.name || 'Custom Item',
        description: item.description,
        width: item.width,
        height: item.height,
        depth: item.depth,
        quantity: item.quantity || 1,
        unit_price: item.unit_price || item.price,
        total_price: item.total_price || item.price,
        sort_order: item.sort_order || 0,
        notes: item.notes
      }));

      const { error: itemsError } = await supabase
        .from('items')
        .insert(items);

      if (itemsError) throw itemsError;
    }

    return spaceData;
  } catch (error) {
    logError(context, error);
    throw error;
  }
}

export async function createQuote(quote: Quote): Promise<Quote> {
  const context = 'createQuote';
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    logDebug(context, 'Creating quote', { quote });

    // Create quote
    const { data: quoteData, error: quoteError } = await supabase
      .from('quotes')
      .insert([{
        created_by: user.id,
        client_name: quote.client_name,
        email: quote.email,
        phone: quote.phone,
        project_name: quote.project_name,
        installation_address: quote.installation_address,
        status: quote.status,
        total: quote.total,
        adjustment_type: quote.adjustment_type,
        adjustment_percentage: quote.adjustment_percentage,
        adjusted_total: quote.adjusted_total,
        notes: quote.notes,
        valid_until: quote.valid_until
      }])
      .select()
      .single();

    if (quoteError) throw quoteError;

    // Create spaces and items
    if (quote.spaces && quote.spaces.length > 0) {
      for (const space of quote.spaces) {
        await createSpaceWithItems(quoteData.id, space);
      }
    }

    logDebug(context, 'Quote created successfully', { quoteId: quoteData.id });
    return quoteData;
  } catch (error) {
    const errorDetails = logError(context, error);
    throw new Error(`Failed to create quote: ${errorDetails.message}`);
  }
}

export async function updateQuote(id: string, updates: Partial<Quote>) {
  const context = 'updateQuote';
  try {
    const { data, error } = await supabase
      .from('quotes')
      .update({
        client_name: updates.client_name,
        email: updates.email,
        phone: updates.phone,
        project_name: updates.project_name,
        installation_address: updates.installation_address,
        status: updates.status,
        total: updates.total,
        adjustment_type: updates.adjustment_type,
        adjustment_percentage: updates.adjustment_percentage,
        adjusted_total: updates.adjusted_total,
        notes: updates.notes,
        valid_until: updates.valid_until
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logError(context, error);
    throw new Error('Failed to update quote');
  }
}

export async function updateQuoteStatus(id: string, status: Quote['status']) {
  const context = 'updateQuoteStatus';
  try {
    const { data, error } = await supabase
      .from('quotes')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logError(context, error);
    throw new Error('Failed to update quote status');
  }
}

export async function deleteQuote(id: string) {
  const context = 'deleteQuote';
  try {
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    logError(context, error);
    throw new Error('Failed to delete quote');
  }
}

export async function copyQuote(id: string): Promise<Quote> {
  const context = 'copyQuote';
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    // Get original quote with spaces and items
    const originalQuote = await getQuoteById(id);
    if (!originalQuote) throw new Error('Quote not found');

    // Create new quote
    const { data: newQuote, error: createError } = await supabase
      .from('quotes')
      .insert([{
        created_by: user.id,
        client_name: `${originalQuote.client_name} (Copy)`,
        email: originalQuote.email,
        phone: originalQuote.phone,
        project_name: `${originalQuote.project_name} (Copy)`,
        installation_address: originalQuote.installation_address,
        status: 'draft',
        total: originalQuote.total,
        adjustment_type: originalQuote.adjustment_type,
        adjustment_percentage: originalQuote.adjustment_percentage,
        adjusted_total: originalQuote.adjusted_total,
        notes: originalQuote.notes
      }])
      .select()
      .single();

    if (createError) throw createError;

    // Copy spaces and items
    if (originalQuote.spaces) {
      for (const space of originalQuote.spaces) {
        await createSpaceWithItems(newQuote.id, space);
      }
    }

    logDebug(context, 'Quote copied successfully', { originalId: id, newId: newQuote.id });
    return newQuote;
  } catch (error) {
    const errorDetails = logError(context, error);
    throw new Error(`Failed to copy quote: ${errorDetails.message}`);
  }
}