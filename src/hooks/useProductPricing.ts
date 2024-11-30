import { useState, useEffect } from 'react';
import { Product, Material } from '../types/catalog';
import { getProducts, getMaterials } from '../services/catalogService';
import { getPricingRules } from '../services/presetService';
import { calculateDisplayedPrice } from '../services/priceCalculationService';
import { logDebug } from '../utils/logger';

interface ProductPricing {
  products: Product[];
  materials: Material[];
  selectedProduct: Product | null;
  displayedPrice: number;
  getAvailableMaterials: () => Material[];
  handleProductChange: (productId: string, dimensions: { width: number; height: number; depth: number }) => {
    price: number;
    material?: string;
  };
}

export function useProductPricing(initialProductId?: string, initialPrice = 0): ProductPricing {
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [displayedPrice, setDisplayedPrice] = useState<number>(initialPrice);

  useEffect(() => {
    const fetchData = async () => {
      try {
        logDebug('useProductPricing', 'Fetching product data');
        const [productsData, materialsData] = await Promise.all([
          getProducts(),
          getMaterials()
        ]);
        
        if (productsData) {
          setProducts(productsData);
          if (initialProductId) {
            const product = productsData.find(p => p.id === initialProductId);
            setSelectedProduct(product || null);
          }
        }
        
        if (materialsData) {
          setMaterials(materialsData);
        }

        logDebug('useProductPricing', 'Product data fetched', { 
          productsCount: productsData?.length,
          materialsCount: materialsData?.length 
        });
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };

    fetchData();
  }, [initialProductId]);

  const getAvailableMaterials = () => {
    if (!selectedProduct?.materials) return [];
    return selectedProduct.materials
      .map(m => m.material)
      .filter((m): m is Material => m !== null && m !== undefined);
  };

  const calculatePrice = (product: Product, dimensions: { width: number; height: number; depth: number }) => {
    if (!product?.unit_cost) return 0;
    
    const rules = getPricingRules();
    const price = calculateDisplayedPrice(
      product.unit_cost,
      dimensions.width,
      dimensions.height,
      dimensions.depth
    );

    logDebug('useProductPricing', 'Calculated price', { 
      productId: product.id,
      dimensions,
      price 
    });

    return price;
  };

  const handleProductChange = (productId: string, dimensions: { width: number; height: number; depth: number }) => {
    logDebug('useProductPricing', 'Handling product change', { productId, dimensions });

    const product = products.find(p => p.id === productId);
    if (!product) {
      logDebug('useProductPricing', 'Product not found', { productId });
      return { price: 0 };
    }

    setSelectedProduct(product);
    const newPrice = calculatePrice(product, dimensions);
    setDisplayedPrice(newPrice);

    const firstMaterial = product.materials?.[0]?.material?.id;
    
    logDebug('useProductPricing', 'Product change processed', { 
      productId,
      newPrice,
      firstMaterial 
    });

    return {
      price: newPrice,
      material: firstMaterial
    };
  };

  return {
    products,
    materials,
    selectedProduct,
    displayedPrice,
    getAvailableMaterials,
    handleProductChange
  };
}