import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit2, Trash2, Download, Share2, Copy } from 'lucide-react';
import { getQuotes, deleteQuote, copyQuote, updateQuoteStatus } from '../../services/quotes.service';
import { showSuccess, showError } from '../../utils/notifications';
import { EmptyState } from './EmptyState';

export function QuoteList() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const data = await getQuotes();
      setQuotes(data);
    } catch (error) {
      showError('Failed to fetch quotes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this quote?')) return;

    try {
      await deleteQuote(id);
      showSuccess('Quote deleted successfully');
      fetchQuotes();
    } catch (error) {
      showError('Failed to delete quote');
    }
  };

  const handleCopy = async (id: string) => {
    try {
      await copyQuote(id);
      showSuccess('Quote copied successfully');
      fetchQuotes();
    } catch (error) {
      showError('Failed to copy quote');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateQuoteStatus(id, status);
      showSuccess('Quote status updated successfully');
      fetchQuotes();
    } catch (error) {
      showError('Failed to update quote status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!quotes.length) {
    return <EmptyState />;
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quote ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quotes.map((quote) => (
              <tr key={quote.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                  {quote.id?.slice(0, 8)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {quote.client_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {quote.project_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(quote.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${(quote.adjusted_total || quote.total || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={quote.status}
                    onChange={(e) => handleStatusChange(quote.id, e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-3">
                    <Link
                      to={`/quotes/${quote.id}/view`}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/quotes/${quote.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleCopy(quote.id)}
                      className="text-purple-600 hover:text-purple-900"
                      title="Copy Quote"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <Link
                      to={`/client/quote/${quote.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-900"
                      title="Client View"
                    >
                      <Share2 className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => {/* Download PDF */}}
                      className="text-gray-600 hover:text-gray-900"
                      title="Download PDF"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(quote.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}