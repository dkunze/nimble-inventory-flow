
import { 
  Product,
  Customer,
  Supplier,
  SalesOrder,
  PurchaseOrder,
  PriceHistory,
  generateMockId,
  MOCK_PRODUCTS,
  MOCK_CUSTOMERS,
  MOCK_SUPPLIERS,
  MOCK_SALES,
  MOCK_PURCHASES
} from "@/utils/types";

// Initialize localStorage with mock data if it doesn't exist
const initializeLocalStorage = () => {
  // Check if data is already initialized
  if (!localStorage.getItem('dataInitialized')) {
    // Store mock data in localStorage
    localStorage.setItem('products', JSON.stringify(MOCK_PRODUCTS));
    localStorage.setItem('customers', JSON.stringify(MOCK_CUSTOMERS));
    localStorage.setItem('suppliers', JSON.stringify(MOCK_SUPPLIERS));
    localStorage.setItem('sales', JSON.stringify(MOCK_SALES));
    localStorage.setItem('purchases', JSON.stringify(MOCK_PURCHASES));
    localStorage.setItem('priceHistory', JSON.stringify([]));
    
    // Mark as initialized
    localStorage.setItem('dataInitialized', 'true');
  }
};

// Initialize on service import
initializeLocalStorage();

// Generic CRUD functions
const getAll = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const getById = <T extends { id: string }>(key: string, id: string): T | undefined => {
  const items = getAll<T>(key);
  return items.find(item => item.id === id);
};

const create = <T extends { id?: string }>(key: string, item: T): T => {
  const items = getAll<T>(key);
  const newItem = { ...item, id: item.id || generateMockId() };
  
  // Add createdAt and updatedAt if they don't exist
  if (!('createdAt' in newItem)) {
    (newItem as any).createdAt = new Date();
  }
  if (!('updatedAt' in newItem)) {
    (newItem as any).updatedAt = new Date();
  }
  
  items.push(newItem as any);
  localStorage.setItem(key, JSON.stringify(items));
  return newItem as T;
};

const update = <T extends { id: string }>(key: string, item: T): T => {
  const items = getAll<T>(key);
  const index = items.findIndex(i => i.id === item.id);
  
  if (index !== -1) {
    // Update the updatedAt if it exists
    if ('updatedAt' in item) {
      (item as any).updatedAt = new Date();
    }
    
    items[index] = item;
    localStorage.setItem(key, JSON.stringify(items));
  }
  
  return item;
};

const remove = <T extends { id: string }>(key: string, id: string): boolean => {
  const items = getAll<T>(key);
  const filteredItems = items.filter(item => item.id !== id);
  
  if (filteredItems.length !== items.length) {
    localStorage.setItem(key, JSON.stringify(filteredItems));
    return true;
  }
  
  return false;
};

// Specific data access functions
export const productService = {
  getAll: () => getAll<Product>('products'),
  getById: (id: string) => getById<Product>('products', id),
  create: (product: Partial<Product>) => {
    // Generate warehouseCode if not provided
    if (!product.warehouseCode) {
      const prefix = product.name?.substring(0, 2).toUpperCase() || 'PR';
      const productsCount = getAll<Product>('products').length;
      product.warehouseCode = `${prefix}${(productsCount + 1).toString().padStart(3, '0')}`;
    }
    
    const newProduct = create<Product>('products', product as Product);
    
    // Record price history for new product
    if (newProduct.lastPurchasePrice) {
      const historyEntry: PriceHistory = {
        id: generateMockId(),
        productId: newProduct.id,
        price: newProduct.lastPurchasePrice,
        date: new Date(),
        type: 'purchase',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      priceHistoryService.create(historyEntry);
    }
    
    return newProduct;
  },
  update: (product: Product) => {
    const existingProduct = getById<Product>('products', product.id);
    
    // Record price history if price changed
    if (existingProduct && existingProduct.lastPurchasePrice !== product.lastPurchasePrice) {
      const historyEntry: PriceHistory = {
        id: generateMockId(),
        productId: product.id,
        price: product.lastPurchasePrice,
        date: new Date(),
        type: 'purchase',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      priceHistoryService.create(historyEntry);
    }
    
    return update<Product>('products', product);
  },
  delete: (id: string) => remove<Product>('products', id)
};

export const customerService = {
  getAll: () => getAll<Customer>('customers'),
  getById: (id: string) => getById<Customer>('customers', id),
  create: (customer: Partial<Customer>) => create<Customer>('customers', customer as Customer),
  update: (customer: Customer) => update<Customer>('customers', customer),
  delete: (id: string) => remove<Customer>('customers', id)
};

export const supplierService = {
  getAll: () => getAll<Supplier>('suppliers'),
  getById: (id: string) => getById<Supplier>('suppliers', id),
  create: (supplier: Partial<Supplier>) => create<Supplier>('suppliers', supplier as Supplier),
  update: (supplier: Supplier) => update<Supplier>('suppliers', supplier),
  delete: (id: string) => remove<Supplier>('suppliers', id)
};

export const salesService = {
  getAll: () => getAll<SalesOrder>('sales'),
  getById: (id: string) => getById<SalesOrder>('sales', id),
  create: (sale: Partial<SalesOrder>) => {
    const newSale = create<SalesOrder>('sales', {
      ...sale,
      id: generateMockId(),
      date: sale.date || new Date(),
      status: 'COMPLETED'
    } as SalesOrder);
    
    // Update product stock
    if (newSale.items) {
      newSale.items.forEach(item => {
        const product = productService.getById(item.productId);
        if (product) {
          product.stock = Math.max(0, product.stock - item.quantity);
          productService.update(product);
          
          // Add price history for selling price
          const historyEntry: PriceHistory = {
            id: generateMockId(),
            productId: item.productId,
            price: item.unitPrice,
            date: new Date(),
            type: 'sale',
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          priceHistoryService.create(historyEntry);
        }
      });
    }
    
    return newSale;
  },
  update: (sale: SalesOrder) => update<SalesOrder>('sales', sale),
  delete: (id: string) => remove<SalesOrder>('sales', id)
};

export const purchaseService = {
  getAll: () => getAll<PurchaseOrder>('purchases'),
  getById: (id: string) => getById<PurchaseOrder>('purchases', id),
  create: (purchase: Partial<PurchaseOrder>) => {
    const newPurchase = create<PurchaseOrder>('purchases', {
      ...purchase,
      id: generateMockId(),
      date: purchase.date || new Date()
    } as PurchaseOrder);
    
    // Update product stock if status is DELIVERED
    if (newPurchase.status === 'DELIVERED' && newPurchase.items) {
      newPurchase.items.forEach(item => {
        // Check if it's a new product
        if (item.isNewProduct) {
          // Create the new product
          const newProduct: Partial<Product> = {
            name: item.productName,
            stock: item.quantity,
            lastPurchasePrice: item.unitPrice,
            sellingPrice: item.suggestedSellingPrice || Math.round(item.unitPrice * 1.4),
            description: ''
          };
          
          productService.create(newProduct);
        } else {
          // Update existing product
          const product = productService.getById(item.productId);
          if (product) {
            product.stock += item.quantity;
            product.lastPurchasePrice = item.unitPrice;
            
            if (item.suggestedSellingPrice) {
              product.sellingPrice = item.suggestedSellingPrice;
            }
            
            productService.update(product);
            
            // Add price history for purchase price
            const historyEntry: PriceHistory = {
              id: generateMockId(),
              productId: item.productId,
              price: item.unitPrice,
              date: new Date(),
              type: 'purchase',
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            priceHistoryService.create(historyEntry);
          }
        }
      });
    }
    
    return newPurchase;
  },
  update: (purchase: PurchaseOrder) => {
    const existingPurchase = getById<PurchaseOrder>('purchases', purchase.id);
    
    // Handle status change from ORDERED to DELIVERED
    if (existingPurchase?.status === 'ORDERED' && purchase.status === 'DELIVERED' && purchase.items) {
      purchase.items.forEach(item => {
        // Check if it's a new product
        if (item.isNewProduct) {
          // Create the new product
          const newProduct: Partial<Product> = {
            name: item.productName,
            stock: item.quantity,
            lastPurchasePrice: item.unitPrice,
            sellingPrice: item.suggestedSellingPrice || Math.round(item.unitPrice * 1.4),
            description: ''
          };
          
          productService.create(newProduct);
        } else {
          // Update existing product
          const product = productService.getById(item.productId);
          if (product) {
            product.stock += item.quantity;
            product.lastPurchasePrice = item.unitPrice;
            
            if (item.suggestedSellingPrice) {
              product.sellingPrice = item.suggestedSellingPrice;
            }
            
            productService.update(product);
            
            // Add price history for purchase price
            const historyEntry: PriceHistory = {
              id: generateMockId(),
              productId: item.productId,
              price: item.unitPrice,
              date: new Date(),
              type: 'purchase',
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            priceHistoryService.create(historyEntry);
          }
        }
      });
    }
    
    return update<PurchaseOrder>('purchases', purchase);
  },
  delete: (id: string) => remove<PurchaseOrder>('purchases', id)
};

export const priceHistoryService = {
  getAll: () => getAll<PriceHistory>('priceHistory'),
  getByProductId: (productId: string) => {
    const allHistory = getAll<PriceHistory>('priceHistory');
    return allHistory.filter(h => h.productId === productId);
  },
  create: (historyEntry: PriceHistory) => create<PriceHistory>('priceHistory', historyEntry),
  delete: (id: string) => remove<PriceHistory>('priceHistory', id)
};
