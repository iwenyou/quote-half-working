import React, { useState } from 'react';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { Category } from '../../types/catalog';
import { CategoryModal } from './CategoryModal';
import { showSuccess, showError } from '../../utils/notifications';
import { saveCategory, deleteCategory } from '../../services/catalogService';

interface CategoryListProps {
  categories: Category[];
  onSelect: (id: string) => void;
  selectedCategoryId: string | null;
}

export function CategoryList({
  categories,
  onSelect,
  selectedCategoryId,
}: CategoryListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleEdit = (category: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleSave = async (category: Category) => {
    try {
      await saveCategory(category);
      showSuccess('Category saved successfully');
      setIsModalOpen(false);
      setEditingCategory(null);
    } catch (error) {
      showError(error);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await deleteCategory(id);
      showSuccess('Category deleted successfully');
      if (selectedCategoryId === id) {
        onSelect('');
      }
    } catch (error) {
      showError(error);
    }
  };

  return (
    <>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Categories</h2>
          <button
            onClick={handleAdd}
            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Category
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer ${
                selectedCategoryId === category.id ? 'bg-indigo-50' : ''
              }`}
              onClick={() => onSelect(category.id)}
            >
              <div>
                <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-gray-500">{category.description}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={(e) => handleEdit(category, e)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => handleDelete(category.id, e)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No categories found. Add one to get started.
            </div>
          )}
        </div>
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSave}
        category={editingCategory}
      />
    </>
  );
}