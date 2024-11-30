import { useState, useEffect } from 'react';
import { Quote, Space, CabinetItem } from '../types/quote';
import { validateQuote } from '../utils/validation';
import { logDebug } from '../utils/logger';

const FORM_STORAGE_KEY = 'generateQuoteForm';

const defaultFormData: Quote = {
  client_name: '',
  email: '',
  phone: '',
  project_name: '',
  installation_address: '',
  spaces: [
    {
      id: crypto.randomUUID(),
      name: 'Space #1',
      items: [],
    },
  ],
  status: 'draft',
  total: 0,
};

export function useQuoteForm(initialData?: Partial<Quote>) {
  const [formData, setFormData] = useState<Quote>(() => {
    const saved = localStorage.getItem(FORM_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Error parsing saved form data:', error);
      }
    }
    return { ...defaultFormData, ...initialData };
  });

  useEffect(() => {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const updateField = (field: keyof Quote, value: any) => {
    logDebug('updateField', `Updating field: ${field}`, { value });
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSpace = () => {
    const newSpace: Space = {
      id: crypto.randomUUID(),
      name: `Space #${formData.spaces.length + 1}`,
      items: [],
    };
    setFormData(prev => ({
      ...prev,
      spaces: [...prev.spaces, newSpace],
    }));
  };

  const updateSpace = (id: string, updates: Partial<Space>) => {
    setFormData(prev => ({
      ...prev,
      spaces: prev.spaces.map(space => 
        space.id === id ? { ...space, ...updates } : space
      ),
    }));
  };

  const deleteSpace = (id: string) => {
    setFormData(prev => ({
      ...prev,
      spaces: prev.spaces.filter(space => space.id !== id),
    }));
  };

  const addItem = (spaceId: string, item?: Partial<CabinetItem>) => {
    const newItem: CabinetItem = {
      id: crypto.randomUUID(),
      width: 30,
      height: 30,
      depth: 24,
      price: 0,
      ...item,
    };

    setFormData(prev => ({
      ...prev,
      spaces: prev.spaces.map(space =>
        space.id === spaceId
          ? { ...space, items: [...space.items, newItem] }
          : space
      ),
    }));
  };

  const updateItem = (spaceId: string, itemId: string, updates: Partial<CabinetItem>) => {
    setFormData(prev => ({
      ...prev,
      spaces: prev.spaces.map(space =>
        space.id === spaceId
          ? {
              ...space,
              items: space.items.map(item =>
                item.id === itemId ? { ...item, ...updates } : item
              ),
            }
          : space
      ),
    }));
  };

  const deleteItem = (spaceId: string, itemId: string) => {
    setFormData(prev => ({
      ...prev,
      spaces: prev.spaces.map(space =>
        space.id === spaceId
          ? { ...space, items: space.items.filter(item => item.id !== itemId) }
          : space
      ),
    }));
  };

  const validateForm = (): Quote | null => {
    return validateQuote(formData);
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    localStorage.removeItem(FORM_STORAGE_KEY);
  };

  return {
    formData,
    updateField,
    addSpace,
    updateSpace,
    deleteSpace,
    addItem,
    updateItem,
    deleteItem,
    validateForm,
    resetForm,
  };
}