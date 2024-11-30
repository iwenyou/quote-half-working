import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { QuoteFilters } from '../components/quotes/QuoteFilters';
import { QuoteList } from '../components/quotes/QuoteList';

export function Quotes() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
          <p className="mt-2 text-gray-600">
            View and manage all your quotes
          </p>
        </div>
        <Link
          to="/generate-quote"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Quote
        </Link>
      </div>

      <QuoteFilters />
      <QuoteList />
    </div>
  );
}