#!/bin/bash
# Feature Creation Template Script

FEATURE_NAME=$1
if [ -z "$FEATURE_NAME" ]; then
    echo "Usage: ./create-feature.sh <feature-name>"
    exit 1
fi

FEATURE_DIR="src/features/$FEATURE_NAME"

mkdir -p "$FEATURE_DIR"/{api,components,hooks,store,types,utils,constants}

# Create index file
cat > "$FEATURE_DIR/index.ts" << FEATURE_EOF
// $FEATURE_NAME Feature Export
export * from './components';
export * from './hooks';
export * from './store';
export * from './types';
export * from './api';
FEATURE_EOF

# Create API file
cat > "$FEATURE_DIR/api/index.ts" << FEATURE_EOF
// $FEATURE_NAME API Layer
import { apiClient } from '@/shared/lib/api';
import type { ${FEATURE_NAME^}Data } from '../types';

export const ${FEATURE_NAME}Api = {
  getAll: () => apiClient.get<${FEATURE_NAME^}Data[]>('/$FEATURE_NAME'),
  getById: (id: string) => apiClient.get<${FEATURE_NAME^}Data>(\`/$FEATURE_NAME/\${id}\`),
  create: (data: Partial<${FEATURE_NAME^}Data>) => apiClient.post<${FEATURE_NAME^}Data>('/$FEATURE_NAME', data),
  update: (id: string, data: Partial<${FEATURE_NAME^}Data>) => apiClient.put<${FEATURE_NAME^}Data>(\`/$FEATURE_NAME/\${id}\`, data),
  delete: (id: string) => apiClient.delete(\`/$FEATURE_NAME/\${id}\`),
};
FEATURE_EOF

# Create store file
cat > "$FEATURE_DIR/store/index.ts" << FEATURE_EOF
// $FEATURE_NAME Store
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ${FEATURE_NAME^}Data } from '../types';

interface ${FEATURE_NAME^}State {
  items: ${FEATURE_NAME^}Data[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchItems: () => Promise<void>;
  addItem: (item: ${FEATURE_NAME^}Data) => void;
  updateItem: (id: string, updates: Partial<${FEATURE_NAME^}Data>) => void;
  deleteItem: (id: string) => void;
  clearError: () => void;
}

export const use${FEATURE_NAME^}Store = create<${FEATURE_NAME^}State>()(
  devtools(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,
      
      fetchItems: async () => {
        set({ loading: true, error: null });
        try {
          // Implement API call
          const items = []; // Replace with actual API call
          set({ items, loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },
      
      addItem: (item) => {
        set((state) => ({ items: [...state.items, item] }));
      },
      
      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map(item => 
            item.id === id ? { ...item, ...updates } : item
          )
        }));
      },
      
      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== id)
        }));
      },
      
      clearError: () => {
        set({ error: null });
      },
    }),
    { name: '${FEATURE_NAME}-store' }
  )
);
FEATURE_EOF

echo "Feature '$FEATURE_NAME' created successfully!"
