import { supabase } from '../lib/supabase';
import { z } from 'zod';
import { logError, logDebug } from '../utils/logger';
import { Order } from '../types/order';

const OrderSchema = z.object({
  quote_id: z.string().uuid().optional(),
  client_name: z.string().min(1, "Client name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  project_name: z.string().min(1, "Project name is required"),
  installation_address: z.string().min(1, "Installation address is required"),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  total: z.number().min(0, "Total must be non-negative"),
  adjustment_type: z.enum(['discount', 'surcharge']).optional(),
  adjustment_percentage: z.number().min(0).max(100).optional(),
  adjusted_total: z.number().min(0).optional()
});

export type CreateOrderInput = z.infer<typeof OrderSchema>;

export async function getOrders() {
  const context = 'getOrders';
  try {
    logDebug(context, 'Fetching orders');
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        quote:quotes(id, client_name, project_name),
        receipts(
          id,
          payment_percentage,
          amount,
          status,
          sent_at,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      logError(context, error);
      throw error;
    }

    logDebug(context, `Found ${data?.length || 0} orders`);
    return data || [];
  } catch (error) {
    logError(context, error);
    throw new Error('Failed to fetch orders');
  }
}

export async function getOrderById(id: string) {
  const context = 'getOrderById';
  try {
    logDebug(context, `Fetching order ${id}`);

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        quote:quotes(id, client_name, project_name),
        receipts(
          id,
          payment_percentage,
          amount,
          status,
          sent_at,
          created_at
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
    throw new Error('Failed to fetch order');
  }
}

export async function createOrder(orderData: CreateOrderInput): Promise<Order> {
  const context = 'createOrder';
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    logDebug(context, 'Creating order', { orderData });

    const validatedData = OrderSchema.parse(orderData);

    const { data, error } = await supabase
      .from('orders')
      .insert([{
        ...validatedData,
        created_by: user.id
      }])
      .select()
      .single();

    if (error) {
      logError(context, error);
      throw error;
    }

    logDebug(context, 'Order created successfully', { orderId: data.id });
    return data;
  } catch (error) {
    const errorDetails = logError(context, error);
    throw new Error(`Failed to create order: ${errorDetails.message}`);
  }
}

export async function updateOrder(id: string, updates: Partial<CreateOrderInput>) {
  const context = 'updateOrder';
  try {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logError(context, error);
    throw new Error('Failed to update order');
  }
}

export async function deleteOrder(id: string) {
  const context = 'deleteOrder';
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    logError(context, error);
    throw new Error('Failed to delete order');
  }
}

export async function createReceipt(orderId: string, paymentPercentage: number, amount: number) {
  const context = 'createReceipt';
  try {
    const { data, error } = await supabase
      .from('receipts')
      .insert([{
        order_id: orderId,
        payment_percentage: paymentPercentage,
        amount: amount,
        status: 'draft'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logError(context, error);
    throw new Error('Failed to create receipt');
  }
}

export async function updateReceiptStatus(id: string, status: 'sent') {
  const context = 'updateReceiptStatus';
  try {
    const { data, error } = await supabase
      .from('receipts')
      .update({
        status,
        sent_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logError(context, error);
    throw new Error('Failed to update receipt status');
  }
}

export async function deleteReceipt(id: string) {
  const context = 'deleteReceipt';
  try {
    const { error } = await supabase
      .from('receipts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    logError(context, error);
    throw new Error('Failed to delete receipt');
  }
}