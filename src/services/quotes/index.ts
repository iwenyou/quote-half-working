import { supabase } from '../../lib/supabase';
import { Quote } from '../../types/quote';
import { logError, logDebug } from '../../utils/logger';
import { quoteSchema } from './validation';
import { createSpaceWithItems, getSpacesByQuoteId } from './spaces';

export * from './spaces';
export * from './items';

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
          items (
            *,
            product:products(*),
            material:materials(*)
          )
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
          items (
            *,
            product:products(*),
            material:materials(*)
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      logError(context, error);
      throw error;
    }

    if (!data) {
      throw new Error('Quote not found');
    }

    return data;
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

    // Validate quote data
    const validatedData = quoteSchema.parse({
      client_name: quote.client_name,
      email: quote.email,
      phone: quote.phone,
      project_name: quote.project_name,
      installation_address: quote.installation_address,
      status: quote.status || 'draft',
      total: quote.total || 0,
      adjustment_type: quote.adjustment_type,
      adjustment_percentage: quote.adjustment_percentage,
      adjusted_total: quote.adjusted_total,
      notes: quote.notes,
      valid_until: quote.valid_until
    });

    // Create quote
    const { data: quoteData, error: quoteError } = await supabase
      .from('quotes')
      .insert([{
        created_by: user.id,
        ...validatedData
      }])
      .select()
      .single();

    if (quoteError) {
      logError(context, quoteError);
      throw quoteError;
    }

    // Create spaces and items
    if (quote.spaces?.length) {
      for (const space of quote.spaces) {
        await createSpaceWithItems(quoteData.id, space);
      }
    }

    // Fetch the complete quote with all relations
    const createdQuote = await getQuoteById(quoteData.id);
    logDebug(context, 'Quote created successfully', { quoteId: quoteData.id });
    
    return createdQuote;
  } catch (error) {
    logError(context, error);
    throw error;
  }
}

export async function updateQuote(id: string, updates: Partial<Quote>) {
  const context = 'updateQuote';
  try {
    // Validate updates
    const validatedUpdates = quoteSchema.partial().parse(updates);

    const { data, error } = await supabase
      .from('quotes')
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

    if (error) {
      logError(context, error);
      throw error;
    }

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

    if (error) {
      logError(context, error);
      throw error;
    }
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

    if (createError) {
      logError(context, createError);
      throw createError;
    }

    // Copy spaces and items
    if (originalQuote.spaces?.length) {
      for (const space of originalQuote.spaces) {
        await createSpaceWithItems(newQuote.id, space);
      }
    }

    // Fetch the complete quote with all relations
    const copiedQuote = await getQuoteById(newQuote.id);
    logDebug(context, 'Quote copied successfully', { originalId: id, newId: newQuote.id });
    
    return copiedQuote;
  } catch (error) {
    logError(context, error);
    throw error;
  }
}