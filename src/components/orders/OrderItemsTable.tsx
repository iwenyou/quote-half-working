import React from 'react';
import { OrderItem } from '../../types/order';
import { getProducts, getMaterials } from '../../services/catalogService';

interface OrderItemsTableProps {
  items: OrderItem[];
}

export function OrderItemsTable({ items }: OrderItemsTableProps) {
  const products = getProducts();
  const materials = getMaterials();

  const getProductName = (productId?: string) => {
    if (!productId) return 'Custom Item';
    const product = products.find(p => p.id === productId);
    return product?.name || 'Unknown Product';
  };

  const getMaterialName = (materialId?: string) => {
    if (!materialId) return 'Default';
    const material = materials.find(m => m.id === materialId);
    return material?.name || 'Unknown Material';
  };

  const formatDimensions = (item: OrderItem) => {
    return `${item.height}"H x ${item.width}"W x ${item.depth}"D`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Space
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Product
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Material
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Dimensions
            </th>
            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Price
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="px-3 py-4 text-sm text-gray-900">
                {item.spaceName}
              </td>
              <td className="px-3 py-4 text-sm text-gray-900">
                {getProductName(item.productId)}
              </td>
              <td className="px-3 py-4 text-sm text-gray-900">
                {getMaterialName(item.material)}
              </td>
              <td className="px-3 py-4 text-sm text-gray-900">
                {formatDimensions(item)}
              </td>
              <td className="px-3 py-4 text-sm text-gray-900 text-right">
                ${item.price.toFixed(2)}
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-4 text-center text-gray-500">
                No items found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}