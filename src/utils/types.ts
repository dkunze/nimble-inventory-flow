// Base entity type for common fields
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Product related types
export interface Product extends BaseEntity {
  name: string;
  description: string;
  warehouseCode: string;
  lastPurchasePrice: number;
  sellingPrice: number;
  stock: number;
}

export interface PriceHistory extends BaseEntity {
  productId: string;
  price: number;
  date: Date;
  type: 'purchase' | 'sale';
}

// Customer related types
export interface Customer extends BaseEntity {
  name: string;
  address: string;
  phone: string;
  email: string;
}

// Supplier related types
export interface Supplier extends BaseEntity {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

// Purchase order related types
export type PurchaseStatus = 'ORDERED' | 'DELIVERED';

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  isNewProduct?: boolean;
  proratedUnitCost?: number;
  suggestedSellingPrice?: number;
}

export interface PurchaseOrder extends BaseEntity {
  supplierId: string;
  supplierName: string;
  date: Date;
  status: PurchaseStatus;
  total: number;
  shippingCost: number;
  additionalFees: number;
  discount: number;
  items: PurchaseOrderItem[];
}

// Sales order related types
export interface SalesOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SalesOrder extends BaseEntity {
  customerId: string;
  customerName: string;
  date: Date;
  total: number;
  items: SalesOrderItem[];
}

// Dashboard related types
export interface DashboardStats {
  totalSales: number;
  totalPurchases: number;
  lowStockProducts: number;
  pendingOrders: number;
}

// Mock data functions
export const generateMockId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// Sample data
export const MOCK_PRODUCTS: Product[] = [
  {
    id: generateMockId(),
    name: 'Laptop HP ProBook',
    description: 'Laptop profesional para trabajo de oficina',
    warehouseCode: 'LP001',
    lastPurchasePrice: 500,
    sellingPrice: 700,
    stock: 15,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: generateMockId(),
    name: 'Monitor 24" Samsung',
    description: 'Monitor LED de 24 pulgadas Full HD',
    warehouseCode: 'MN002',
    lastPurchasePrice: 120,
    sellingPrice: 168,
    stock: 25,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: generateMockId(),
    name: 'Teclado Logitech K380',
    description: 'Teclado inalámbrico compacto',
    warehouseCode: 'KB003',
    lastPurchasePrice: 30,
    sellingPrice: 42,
    stock: 40,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: generateMockId(),
    name: 'Mouse Óptico Dell',
    description: 'Mouse ergonómico con cable USB',
    warehouseCode: 'MS004',
    lastPurchasePrice: 15,
    sellingPrice: 21,
    stock: 50,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: generateMockId(),
    name: 'Empresa ABC S.A.',
    address: 'Calle Principal 123, Ciudad',
    phone: '+54 11 1234-5678',
    email: 'contacto@empresaabc.com',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: generateMockId(),
    name: 'Comercial XYZ',
    address: 'Av. Central 456, Ciudad',
    phone: '+54 11 8765-4321',
    email: 'ventas@comercialxyz.com',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: generateMockId(),
    name: 'Distribuidora Tech',
    address: 'Calle Industrial 789, Ciudad',
    phone: '+54 11 2468-1357',
    email: 'ventas@distribuidoratech.com',
    website: 'www.distribuidoratech.com',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: generateMockId(),
    name: 'Importadora Global',
    address: 'Av. Comercio 321, Ciudad',
    phone: '+54 11 1357-2468',
    email: 'info@importadoraglobal.com',
    website: 'www.importadoraglobal.com',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const MOCK_PURCHASES: PurchaseOrder[] = [
  {
    id: generateMockId(),
    supplierId: MOCK_SUPPLIERS[0].id,
    supplierName: MOCK_SUPPLIERS[0].name,
    date: new Date(),
    status: 'ORDERED',
    total: 2750,
    shippingCost: 50,
    additionalFees: 0,
    discount: 0,
    items: [
      {
        productId: MOCK_PRODUCTS[0].id,
        productName: MOCK_PRODUCTS[0].name,
        quantity: 5,
        unitPrice: 500,
        total: 2500
      },
      {
        productId: MOCK_PRODUCTS[2].id,
        productName: MOCK_PRODUCTS[2].name,
        quantity: 10,
        unitPrice: 20,
        total: 200
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const MOCK_SALES: SalesOrder[] = [
  {
    id: generateMockId(),
    customerId: MOCK_CUSTOMERS[0].id,
    customerName: MOCK_CUSTOMERS[0].name,
    date: new Date(),
    total: 1582,
    items: [
      {
        productId: MOCK_PRODUCTS[0].id,
        productName: MOCK_PRODUCTS[0].name,
        quantity: 2,
        unitPrice: 700,
        total: 1400
      },
      {
        productId: MOCK_PRODUCTS[3].id,
        productName: MOCK_PRODUCTS[3].name,
        quantity: 5,
        unitPrice: 21,
        total: 105
      },
      {
        productId: MOCK_PRODUCTS[2].id,
        productName: MOCK_PRODUCTS[2].name,
        quantity: 2,
        unitPrice: 42,
        total: 84
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalSales: 5250,
  totalPurchases: 3800,
  lowStockProducts: 2,
  pendingOrders: 3
};
