import { supabase } from '../lib/supabase';
import { logError, logDebug } from '../utils/logger';
import { Category, Product, ProductType, Material } from '../types/catalog';

// Categories
export async function getCategories(): Promise<Category[]> {
  const context = 'getCategories';
  try {
    logDebug(context, 'Fetching categories');
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    console.log('Categories response:', { data, error });

    if (error) throw error;
    return data || [];
  } catch (error) {
    logError(context, error);
    throw new Error('Failed to fetch categories');
  }
}

export async function saveCategory(category: Category): Promise<Category> {
  const context = 'saveCategory';
  try {
    const { data, error } = category.id 
      ? await supabase
          .from('categories')
          .update({ 
            name: category.name,
            description: category.description 
          })
          .eq('id', category.id)
          .select()
          .single()
      : await supabase
          .from('categories')
          .insert([{ 
            name: category.name,
            description: category.description 
          }])
          .select()
          .single();

    console.log('Save category response:', { data, error });

    if (error) throw error;
    return data;
  } catch (error) {
    logError(context, error);
    throw new Error('Failed to save category');
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const context = 'deleteCategory';
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    console.log('Delete category response:', { error });

    if (error) throw error;
  } catch (error) {
    logError(context, error);
    throw new Error('Failed to delete category');
  }
}

// Products
export async function getProducts(): Promise<Product[]> {
  const context = 'getProducts';
  try {
    logDebug(context, 'Fetching products');
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name),
        types:product_types(
          type:types(*)
        ),
        materials:product_materials(
          material:materials(*)
        )
      `)
      .order('name');

    console.log('Products response:', { data, error });

    if (error) throw error;
    return data || [];
  } catch (error) {
    logError(context, error);
    throw new Error('Failed to fetch products');
  }
}

export async function saveProduct(product: Product): Promise<Product> {
  const context = 'saveProduct';
  try {
    // Start a transaction
    const { data: productData, error: productError } = product.id
      ? await supabase
          .from('products')
          .update({
            category_id: product.categoryId,
            name: product.name,
            unit_cost: product.unitCost,
            description: product.description
          })
          .eq('id', product.id)
          .select()
          .single()
      : await supabase
          .from('products')
          .insert([{
            category_id: product.categoryId,
            name: product.name,
            unit_cost: product.unitCost,
            description: product.description
          }])
          .select()
          .single();

    console.log('Save product response:', { productData, productError });

    if (productError) throw productError;

    // Update product type
    if (product.type) {
      const { error: typeError } = await supabase
        .from('product_types')
        .upsert([{
          product_id: productData.id,
          type_id: product.type
        }]);

      if (typeError) throw typeError;
    }

    // Update product materials
    if (product.materials?.length) {
      // First delete existing materials
      const { error: deleteError } = await supabase
        .from('product_materials')
        .delete()
        .eq('product_id', productData.id);

      if (deleteError) throw deleteError;

      // Then insert new materials
      const materialMappings = product.materials.map(materialId => ({
        product_id: productData.id,
        material_id: materialId
      }));

      const { error: materialsError } = await supabase
        .from('product_materials')
        .insert(materialMappings);

      if (materialsError) throw materialsError;
    }

    return productData;
  } catch (error) {
    logError(context, error);
    throw new Error('Failed to save product');
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const context = 'deleteProduct';
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    console.log('Delete product response:', { error });

    if (error) throw error;
  } catch (error) {
    logError(context, error);
    throw new Error('Failed to delete product');
  }
}

// Product Types
export async function getProductTypes(): Promise<ProductType[]> {
  const context = 'getProductTypes';
  try {
    logDebug(context, 'Fetching product types');
    
    const { data, error } = await supabase
      .from('types')
      .select('*')
      .order('name');

    console.log('Product types response:', { data, error });

    if (error) throw error;
    return data || [];
  } catch (error) {
    logError(context, error);
    throw new Error('Failed to fetch product types');
  }
}

export function getDefaultProductTypes(): ProductType[] {
  return [
    { id: 'base', name: 'Base Cabinet', description: 'Standard base cabinet' },
    { id: 'wall', name: 'Wall Cabinet', description: 'Standard wall cabinet' },
    { id: 'tall', name: 'Tall Cabinet', description: 'Full height cabinet' },
    { id: 'corner', name: 'Corner Cabinet', description: 'Corner solution cabinet' },
    { id: 'custom', name: 'Custom Cabinet', description: 'Custom designed cabinet' }
  ];
}

export async function saveProductType(type: ProductType): Promise<ProductType> {
  const context = 'saveProductType';
  try {
    const { data, error } = type.id
      ? await supabase
          .from('types')
          .update({
            name: type.name,
            description: type.description
          })
          .eq('id', type.id)
          .select()
          .single()
      : await supabase
          .from('types')
          .insert([{
            name: type.name,
            description: type.description
          }])
          .select()
          .single();

    console.log('Save product type response:', { data, error });

    if (error) throw error;
    return data;
  } catch (error) {
    logError(context, error);
    throw new Error('Failed to save product type');
  }
}

export async function deleteProductType(id: string): Promise<void> {
  const context = 'deleteProductType';
  try {
    const { error } = await supabase
      .from('types')
      .delete()
      .eq('id', id);

    console.log('Delete product type response:', { error });

    if (error) throw error;
  } catch (error) {
    logError(context, error);
    throw new Error('Failed to delete product type');
  }
}

// Materials
export async function getMaterials(): Promise<Material[]> {
  const context = 'getMaterials';
  try {
    logDebug(context, 'Fetching materials');
    
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('name');

    console.log('Materials response:', { data, error });

    if (error) throw error;
    return data || [];
  } catch (error) {
    logError(context, error);
    throw new Error('Failed to fetch materials');
  }
}

export function getDefaultMaterials(): Material[] {
  return [
    { id: 'solid-wood', name: 'Solid Wood', description: 'Premium solid wood construction' },
    { id: 'mdf', name: 'MDF', description: 'Medium-density fiberboard' },
    { id: 'plywood', name: 'Plywood', description: 'Multi-layer wood construction' },
    { id: 'laminate', name: 'Laminate', description: 'Durable laminate finish' }
  ];
}

export async function saveMaterial(material: Material): Promise<Material> {
  const context = 'saveMaterial';
  try {
    const { data, error } = material.id
      ? await supabase
          .from('materials')
          .update({
            name: material.name,
            description: material.description
          })
          .eq('id', material.id)
          .select()
          .single()
      : await supabase
          .from('materials')
          .insert([{
            name: material.name,
            description: material.description
          }])
          .select()
          .single();

    console.log('Save material response:', { data, error });

    if (error) throw error;
    return data;
  } catch (error) {
    logError(context, error);
    throw new Error('Failed to save material');
  }
}

export async function deleteMaterial(id: string): Promise<void> {
  const context = 'deleteMaterial';
  try {
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id);

    console.log('Delete material response:', { error });

    if (error) throw error;
  } catch (error) {
    logError(context, error);
    throw new Error('Failed to delete material');
  }
}