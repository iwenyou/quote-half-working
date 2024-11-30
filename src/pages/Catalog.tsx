import React, { useState, useEffect } from 'react';
import { CategoryList } from '../components/catalog/CategoryList';
import { TypeList } from '../components/catalog/TypeList';
import { MaterialList } from '../components/catalog/MaterialList';
import { CatalogTable } from '../components/catalog/CatalogTable';
import { Category, Product, ProductType, Material } from '../types/catalog';
import {
  getCategories,
  saveCategory,
  deleteCategory,
  getProducts,
  getProductTypes,
  saveProductType,
  deleteProductType,
  getMaterials,
  saveMaterial,
  deleteMaterial,
} from '../services/catalogService';
import { showError } from '../utils/notifications';

export function Catalog() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [types, setTypes] = useState<ProductType[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesData, productsData, typesData, materialsData] = await Promise.all([
        getCategories(),
        getProducts(),
        getProductTypes(),
        getMaterials()
      ]);

      setCategories(categoriesData);
      setProducts(productsData);
      setTypes(typesData);
      setMaterials(materialsData);
    } catch (error) {
      showError('Failed to load catalog data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async (category: Category) => {
    try {
      await saveCategory(category);
      fetchData();
    } catch (error) {
      showError(error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      if (selectedCategoryId === id) {
        setSelectedCategoryId(null);
      }
      fetchData();
    } catch (error) {
      showError(error);
    }
  };

  const handleSaveType = async (type: ProductType) => {
    try {
      await saveProductType(type);
      fetchData();
    } catch (error) {
      showError(error);
    }
  };

  const handleDeleteType = async (id: string) => {
    try {
      await deleteProductType(id);
      fetchData();
    } catch (error) {
      showError(error);
    }
  };

  const handleSaveMaterial = async (material: Material) => {
    try {
      await saveMaterial(material);
      fetchData();
    } catch (error) {
      showError(error);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    try {
      await deleteMaterial(id);
      fetchData();
    } catch (error) {
      showError(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
          <p className="mt-2 text-gray-600">
            Manage your cabinet products and categories
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <CatalogTable
          products={products}
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onProductsChange={fetchData}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CategoryList
            categories={categories}
            onSave={handleSaveCategory}
            onDelete={handleDeleteCategory}
            onSelect={setSelectedCategoryId}
            selectedCategoryId={selectedCategoryId}
          />
          <TypeList
            types={types}
            onSave={handleSaveType}
            onDelete={handleDeleteType}
          />
          <MaterialList
            materials={materials}
            onSave={handleSaveMaterial}
            onDelete={handleDeleteMaterial}
          />
        </div>
      </div>
    </div>
  );
}