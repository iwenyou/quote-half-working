import { supabase } from '../lib/supabase';
import { logError, logDebug } from './logger';

export async function verifyAuthRole() {
  const context = 'verifyAuthRole';
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    
    if (!session) {
      logDebug(context, 'No active session found');
      return { verified: false, error: 'No active session' };
    }

    const role = session.user?.user_metadata?.role;
    logDebug(context, 'User role from metadata', { role });

    if (!role || !['admin', 'sales'].includes(role)) {
      return { verified: false, error: 'Invalid or missing role' };
    }

    return { verified: true, role };
  } catch (error) {
    logError(context, error);
    return { verified: false, error: 'Verification failed' };
  }
}

export async function testQuoteAccess() {
  const context = 'testQuoteAccess';
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    // Test quote listing
    const { data: listData, error: listError } = await supabase
      .from('quotes')
      .select('*')
      .limit(1);

    if (listError) {
      logError(context, listError);
      return { success: false, error: 'Failed to list quotes' };
    }

    // Test quote creation
    const testQuote = {
      client_name: 'Test Client',
      email: 'test@example.com',
      phone: '555-0123',
      project_name: 'Test Project',
      installation_address: 'Test Address',
      total: 100,
      status: 'draft',
      created_by: user.id
    };

    const { data: createData, error: createError } = await supabase
      .from('quotes')
      .insert([testQuote])
      .select()
      .single();

    if (createError) {
      logError(context, createError);
      return { success: false, error: 'Failed to create quote' };
    }

    // Test quote update
    const { error: updateError } = await supabase
      .from('quotes')
      .update({ status: 'pending' })
      .eq('id', createData.id);

    if (updateError) {
      logError(context, updateError);
      return { success: false, error: 'Failed to update quote' };
    }

    // Clean up
    const { error: deleteError } = await supabase
      .from('quotes')
      .delete()
      .eq('id', createData.id);

    if (deleteError) {
      logError(context, deleteError);
      return { success: false, error: 'Failed to clean up test quote' };
    }

    return { success: true };
  } catch (error) {
    logError(context, error);
    return { success: false, error: 'Quote access test failed' };
  }
}

export async function testOrderAccess() {
  const context = 'testOrderAccess';
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    // Test order listing
    const { data: listData, error: listError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);

    if (listError) {
      logError(context, listError);
      return { success: false, error: 'Failed to list orders' };
    }

    // Test order creation
    const testOrder = {
      client_name: 'Test Client',
      email: 'test@example.com',
      phone: '555-0123',
      project_name: 'Test Project',
      installation_address: 'Test Address',
      total: 100,
      status: 'pending',
      created_by: user.id
    };

    const { data: createData, error: createError } = await supabase
      .from('orders')
      .insert([testOrder])
      .select()
      .single();

    if (createError) {
      logError(context, createError);
      return { success: false, error: 'Failed to create order' };
    }

    // Test order update
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'in_progress' })
      .eq('id', createData.id);

    if (updateError) {
      logError(context, updateError);
      return { success: false, error: 'Failed to update order' };
    }

    // Clean up
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', createData.id);

    if (deleteError) {
      logError(context, deleteError);
      return { success: false, error: 'Failed to clean up test order' };
    }

    return { success: true };
  } catch (error) {
    logError(context, error);
    return { success: false, error: 'Order access test failed' };
  }
}

export async function testReceiptAccess() {
  const context = 'testReceiptAccess';
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    // First create a test order
    const testOrder = {
      client_name: 'Test Client',
      email: 'test@example.com',
      phone: '555-0123',
      project_name: 'Test Project',
      installation_address: 'Test Address',
      total: 100,
      status: 'pending',
      created_by: user.id
    };

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([testOrder])
      .select()
      .single();

    if (orderError) {
      logError(context, orderError);
      return { success: false, error: 'Failed to create test order for receipt' };
    }

    // Test receipt creation
    const testReceipt = {
      order_id: orderData.id,
      payment_percentage: 50,
      amount: 50,
      status: 'draft'
    };

    const { data: receiptData, error: receiptError } = await supabase
      .from('receipts')
      .insert([testReceipt])
      .select()
      .single();

    if (receiptError) {
      await supabase.from('orders').delete().eq('id', orderData.id);
      logError(context, receiptError);
      return { success: false, error: 'Failed to create receipt' };
    }

    // Test receipt update
    const { error: updateError } = await supabase
      .from('receipts')
      .update({ status: 'sent' })
      .eq('id', receiptData.id);

    if (updateError) {
      logError(context, updateError);
      return { success: false, error: 'Failed to update receipt' };
    }

    // Clean up
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderData.id);

    if (deleteError) {
      logError(context, deleteError);
      return { success: false, error: 'Failed to clean up test data' };
    }

    return { success: true };
  } catch (error) {
    logError(context, error);
    return { success: false, error: 'Receipt access test failed' };
  }
}

export async function testUserProfileAccess() {
  const context = 'testUserProfileAccess';
  try {
    // Test profile read
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      logError(context, userError);
      return { success: false, error: 'Failed to get user profile' };
    }

    // Test metadata update
    const { error: updateError } = await supabase.auth.updateUser({
      data: { lastAccessTest: new Date().toISOString() }
    });

    if (updateError) {
      logError(context, updateError);
      return { success: false, error: 'Failed to update user metadata' };
    }

    return { success: true };
  } catch (error) {
    logError(context, error);
    return { success: false, error: 'User profile access test failed' };
  }
}

export async function testSettingsAccess() {
  const context = 'testSettingsAccess';
  try {
    // Test preset values access
    const { data: presetData, error: presetError } = await supabase
      .from('preset_values')
      .select('*')
      .limit(1)
      .single();

    if (presetError) {
      logError(context, presetError);
      return { success: false, error: 'Failed to access preset values' };
    }

    // Test template settings access
    const { data: templateData, error: templateError } = await supabase
      .from('template_settings')
      .select('*')
      .limit(1)
      .single();

    if (templateError) {
      logError(context, templateError);
      return { success: false, error: 'Failed to access template settings' };
    }

    return { success: true };
  } catch (error) {
    logError(context, error);
    return { success: false, error: 'Settings access test failed' };
  }
}