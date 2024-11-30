import React from 'react';
import { Order } from '../../types/order';
import { OrderStatusBadge } from './OrderStatusBadge';
import { showSuccess, showError } from '../../utils/notifications';
import { updateOrder } from '../../services/orders.service';

interface OrderHeaderProps {
  order: Order;
  onOrderUpdate: (order: Order) => void;
}

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

export function OrderHeader({ order, onOrderUpdate }: OrderHeaderProps) {
  const handleStatusChange = async (newStatus: string) => {
    try {
      const updatedOrder = await updateOrder(order.id, { status: newStatus });
      showSuccess('Order status updated successfully');
      onOrderUpdate(updatedOrder);
    } catch (error) {
      showError('Failed to update order status');
    }
  };

  return (
    <div className="flex justify-between items-start mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
        <div className="mt-2 text-gray-600 space-y-1">
          <p>Order ID: {order.id.slice(0, 8)}</p>
          <p>Created: {new Date(order.created_at).toLocaleDateString()}</p>
          {order.quote_id && <p>Quote ID: {order.quote_id.slice(0, 8)}</p>}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <select
          value={order.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <OrderStatusBadge status={order.status} />
      </div>
    </div>
  );
}