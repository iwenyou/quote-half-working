import React from 'react';
import { OrderFilters } from '../components/orders/OrderFilters';
import { OrderList } from '../components/orders/OrderList';

export function Orders() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="mt-2 text-gray-600">
            View and manage all orders
          </p>
        </div>
      </div>

      <OrderFilters />
      <OrderList />
    </div>
  );
}