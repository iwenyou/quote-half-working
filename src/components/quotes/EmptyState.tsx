import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="text-center py-12">
      <FileText className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No quotes</h3>
      <p className="mt-1 text-sm text-gray-500">
        Get started by creating a new quote
      </p>
      <div className="mt-6">
        <Link
          to="/generate-quote"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Quote
        </Link>
      </div>
    </div>
  );
}