import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit2, Download, Eye, ArrowLeft } from 'lucide-react';
import { getQuoteById } from '../services/quotes.service';
import { showError } from '../utils/notifications';
import { getProducts, getMaterials } from '../services/catalogService';
import { getPresetValues } from '../services/presetService';

export function QuoteView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [taxRate, setTaxRate] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [quoteData, productsData, materialsData] = await Promise.all([
          getQuoteById(id!),
          getProducts(),
          getMaterials(),
        ]);

        setQuote(quoteData);
        setProducts(productsData);
        setMaterials(materialsData);

        const presetValues = getPresetValues();
        setTaxRate(presetValues.taxRate / 100);
      } catch (error) {
        showError('Failed to load quote details');
        navigate('/quotes');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, navigate]);

  const getProductName = (productId?: string) => {
    if (!productId) return 'Custom Item';
    const product = products.find((p) => p.id === productId);
    return product?.name || 'Unknown Product';
  };

  const getMaterialName = (materialId?: string) => {
    if (!materialId) return 'Default';
    const material = materials.find((m) => m.id === materialId);
    return material?.name || 'Unknown Material';
  };

  const formatDimensions = (item: any) => {
    return `${item.height}"H x ${item.width}"W x ${item.depth}"D`;
  };

  const calculateTotals = () => {
    const subtotal = quote.total || 0;
    const adjustedSubtotal = quote.adjusted_total || subtotal;
    const tax = adjustedSubtotal * taxRate;
    const total = adjustedSubtotal + tax;

    return { subtotal, adjustedSubtotal, tax, total };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!quote) return null;

  const totals = calculateTotals();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => navigate('/quotes')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quotes
        </button>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quote Details</h1>
          <div className="mt-2 text-gray-600 space-y-1">
            <p>Quote ID: {quote.id?.slice(0, 8)}</p>
            <p>Created: {new Date(quote.created_at).toLocaleDateString()}</p>
            {quote.valid_until && (
              <p>
                Valid Until: {new Date(quote.valid_until).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.open(`/client/quote/${quote.id}`, '_blank')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </button>
          <button
            onClick={() => navigate(`/quotes/${quote.id}/edit`)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Quote
          </button>
          <button
            onClick={() => {
              /* Download PDF */
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Client Information */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Client Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {quote.client_name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{quote.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{quote.phone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Project Name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {quote.project_name}
                  </dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">
                    Installation Address
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                    {quote.installation_address}
                  </dd>
                </div>
              </div>
            </div>
          </div>

          {/* Quote Items */}
          {quote.spaces?.map((space: any) => (
            <div
              key={space.id}
              className="bg-white shadow-lg rounded-lg overflow-hidden"
            >
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {space.name}
                </h3>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Product
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Material
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Dimensions
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          Qty
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Unit Price
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {space.items?.map((item: any) => (
                        <tr key={item.id}>
                          <td className="px-3 py-4 text-sm text-gray-900">
                            {getProductName(item.product_id)}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900">
                            {getMaterialName(item.material_id)}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900">
                            {formatDimensions(item)}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900 text-center">
                            {item.quantity}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900 text-right">
                            ${item.unit_price.toFixed(2)}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900 text-right">
                            ${item.total_price.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          {/* Quote Summary */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden sticky top-6">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Quote Summary
              </h2>
              <dl className="space-y-3">
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Subtotal</dt>
                  <dd className="text-gray-900">
                    ${totals.subtotal.toFixed(2)}
                  </dd>
                </div>
                {quote.adjustment_type && (
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-500">
                      {quote.adjustment_type === 'discount'
                        ? 'Discount'
                        : 'Surcharge'}{' '}
                      ({quote.adjustment_percentage}%)
                    </dt>
                    <dd className="text-gray-900">
                      {quote.adjustment_type === 'discount' ? '-' : '+'}$
                      {Math.abs(
                        totals.subtotal - totals.adjustedSubtotal
                      ).toFixed(2)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">
                    Tax ({(taxRate * 100).toFixed(1)}%)
                  </dt>
                  <dd className="text-gray-900">${totals.tax.toFixed(2)}</dd>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <dt className="text-base font-medium text-gray-900">Total</dt>
                  <dd className="text-base font-medium text-indigo-600">
                    ${totals.total.toFixed(2)}
                  </dd>
                </div>
              </dl>

              {quote.notes && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Notes
                  </h3>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {quote.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
