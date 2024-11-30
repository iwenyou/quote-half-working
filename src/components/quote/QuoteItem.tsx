import React from 'react';
import { Trash2 } from 'lucide-react';
import { CabinetItem } from '../../types/quote';
import { useProductPricing } from '../../hooks/useProductPricing';
import { logDebug } from '../../utils/logger';

interface QuoteItemProps {
  item: CabinetItem;
  onUpdate: (id: string, updates: Partial<CabinetItem>) => void;
  onDelete: (id: string) => void;
}

export function QuoteItem({ item, onUpdate, onDelete }: QuoteItemProps) {
  const {
    products,
    selectedProduct,
    displayedPrice,
    getAvailableMaterials,
    handleProductChange
  } = useProductPricing(item.product_id, item.price);

  const handleProductSelect = (productId: string) => {
    logDebug('handleProductSelect', 'Product selected', { productId });
    
    const { price, material } = handleProductChange(productId, {
      width: item.width,
      height: item.height,
      depth: item.depth
    });

    onUpdate(item.id, {
      product_id: productId,
      price: price,
      unit_price: price,
      total_price: price,
      material_id: material
    });
  };

  const handleDimensionChange = (dimension: 'width' | 'height' | 'depth', value: number) => {
    logDebug('handleDimensionChange', `Updating ${dimension}`, { value });

    if (item.product_id) {
      const { price } = handleProductChange(item.product_id, {
        ...item,
        [dimension]: value
      });
      
      onUpdate(item.id, {
        [dimension]: value,
        price: price,
        unit_price: price,
        total_price: price
      });
    } else {
      onUpdate(item.id, {
        [dimension]: value
      });
    }
  };

  return (
    <tr>
      <td className="px-3 py-4 whitespace-nowrap">
        <select
          value={item.product_id || ''}
          onChange={(e) => handleProductSelect(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Select a product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} - {product.category?.name}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
        <select
          value={item.material_id || ''}
          onChange={(e) => onUpdate(item.id, { material_id: e.target.value })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          disabled={!selectedProduct}
        >
          <option value="">Select material</option>
          {getAvailableMaterials().map((material) => (
            <option key={material.id} value={material.id}>
              {material.name}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
        <input
          type="number"
          value={item.width || 0}
          onChange={(e) => handleDimensionChange('width', Number(e.target.value))}
          className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Width"
          min="0"
          step="0.1"
        />
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
        <input
          type="number"
          value={item.height || 0}
          onChange={(e) => handleDimensionChange('height', Number(e.target.value))}
          className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Height"
          min="0"
          step="0.1"
        />
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
        <input
          type="number"
          value={item.depth || 0}
          onChange={(e) => handleDimensionChange('depth', Number(e.target.value))}
          className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Depth"
          min="0"
          step="0.1"
        />
      </td>
      <td className="px-3 py-4 whitespace-nowrap text-right">
        ${(item.total_price || item.price || 0).toFixed(2)}
      </td>
      <td className="px-3 py-4 whitespace-nowrap text-right">
        <button 
          onClick={() => onDelete(item.id)}
          className="text-red-600 hover:text-red-900"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}