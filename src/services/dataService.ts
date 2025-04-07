import { Pool, PoolClient, QueryResult } from 'pg';

import {
  Product,
  Customer,
  Supplier,
  SalesOrder,
  PurchaseOrder,
  PriceHistory,
  Warehouse,
  Category,
  PurchaseOrderItem,
  SalesOrderItem,
  PurchaseStatus
} from "@/utils/types";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Función genérica para ejecutar consultas
const query = async <T>(sql: string, params?: any[]): Promise<QueryResult<T>> => {
  let client: PoolClient;
  try {
    client = await pool.connect();
    const result = await client.query<T>(sql, params);
    return result;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  } finally {
    if (client) client.release();
  }
};

// Mapeo de resultados a objetos
const mapProduct = (row: any): Product => ({
  id: row.id,
  name: row.name,
  description: row.description,
  warehouseId: row.warehouse_id,
  categoryId: row.category_id,
  lastPurchasePrice: parseFloat(row.last_purchase_price),
  sellingPrice: parseFloat(row.selling_price),
  stock: parseInt(row.stock),
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at)
});

const mapCustomer = (row: any): Customer => ({
  id: row.id,
  name: row.name,
  address: row.address,
  phone: row.phone,
  email: row.email,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at)
});

const mapSupplier = (row: any): Supplier => ({
  id: row.id,
  name: row.name,
  address: row.address,
  phone: row.phone,
  email: row.email,
  website: row.website,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at)
});

const mapWarehouse = (row: any): Warehouse => ({
  id: row.id,
  name: row.name,
  code: row.code,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at)
});

const mapCategory = (row: any): Category => ({
  id: row.id,
  name: row.name,
  description: row.description,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at)
});

const mapPriceHistory = (row: any): PriceHistory => ({
  id: row.id,
  productId: row.product_id,
  price: parseFloat(row.price),
  date: new Date(row.date),
  type: row.type,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at)
});

const mapPurchaseOrder = (row: any): PurchaseOrder => ({
  id: row.id,
  supplierId: row.supplier_id,
  supplierName: row.supplier_name,
  date: new Date(row.date),
  status: row.status as PurchaseStatus,
  total: parseFloat(row.total),
  shippingCost: parseFloat(row.shipping_cost),
  additionalFees: parseFloat(row.additional_fees),
  discount: parseFloat(row.discount),
  items: [], // Se llenará después
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at)
});

const mapSalesOrder = (row: any): SalesOrder => ({
  id: row.id,
  customerId: row.customer_id,
  customerName: row.customer_name,
  date: new Date(row.date),
  total: parseFloat(row.total),
  items: [], // Se llenará después
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at)
});

// Servicios específicos para cada entidad
export const productService = {
  getAll: async (): Promise<Product[]> => {
    const result = await query<Product>('SELECT * FROM products');
    return result.rows.map(mapProduct);
  },

  getById: async (id: string): Promise<Product | undefined> => {
    const result = await query<Product>('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows.length ? mapProduct(result.rows[0]) : undefined;
  },

  create: async (product: Partial<Product>): Promise<Product> => {
    const { rows } = await query<Product>(`
      INSERT INTO products (
        name, description, warehouse_id, category_id, 
        last_purchase_price, selling_price, stock
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      product.name,
      product.description,
      product.warehouseId,
      product.categoryId,
      product.lastPurchasePrice,
      product.sellingPrice,
      product.stock || 0
    ]);

    const newProduct = mapProduct(rows[0]);

    // Registrar historial de precio si existe
    if (product.lastPurchasePrice) {
      await priceHistoryService.create({
        productId: newProduct.id,
        price: newProduct.lastPurchasePrice,
        date: new Date(),
        type: 'purchase'
      });
    }

    return newProduct;
  },

  update: async (product: Product): Promise<Product> => {
    const existingProduct = await productService.getById(product.id);
    
    const { rows } = await query<Product>(`
      UPDATE products SET
        name = $1,
        description = $2,
        warehouse_id = $3,
        category_id = $4,
        last_purchase_price = $5,
        selling_price = $6,
        stock = $7,
        updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `, [
      product.name,
      product.description,
      product.warehouseId,
      product.categoryId,
      product.lastPurchasePrice,
      product.sellingPrice,
      product.stock,
      product.id
    ]);

    const updatedProduct = mapProduct(rows[0]);

    // Registrar cambio de precio si hubo
    if (existingProduct && existingProduct.lastPurchasePrice !== product.lastPurchasePrice) {
      await priceHistoryService.create({
        productId: updatedProduct.id,
        price: updatedProduct.lastPurchasePrice,
        date: new Date(),
        type: 'purchase'
      });
    }

    return updatedProduct;
  },

  delete: async (id: string): Promise<boolean> => {
    const result = await query('DELETE FROM products WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
};

export const warehouseService = {
  getAll: async (): Promise<Warehouse[]> => {
    const result = await query<Warehouse>('SELECT * FROM warehouses');
    return result.rows.map(mapWarehouse);
  },

  getById: async (id: string): Promise<Warehouse | undefined> => {
    const result = await query<Warehouse>('SELECT * FROM warehouses WHERE id = $1', [id]);
    return result.rows.length ? mapWarehouse(result.rows[0]) : undefined;
  },

  create: async (warehouse: Partial<Warehouse>): Promise<Warehouse> => {
    const { rows } = await query<Warehouse>(`
      INSERT INTO warehouses (name, code) 
      VALUES ($1, $2) 
      RETURNING *
    `, [warehouse.name, warehouse.code]);
    return mapWarehouse(rows[0]);
  },

  update: async (warehouse: Warehouse): Promise<Warehouse> => {
    const { rows } = await query<Warehouse>(`
      UPDATE warehouses SET
        name = $1,
        code = $2,
        updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [warehouse.name, warehouse.code, warehouse.id]);
    return mapWarehouse(rows[0]);
  },

  delete: async (id: string): Promise<boolean> => {
    const result = await query('DELETE FROM warehouses WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
};

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const result = await query<Category>('SELECT * FROM categories');
    return result.rows.map(mapCategory);
  },

  getById: async (id: string): Promise<Category | undefined> => {
    const result = await query<Category>('SELECT * FROM categories WHERE id = $1', [id]);
    return result.rows.length ? mapCategory(result.rows[0]) : undefined;
  },

  create: async (category: Partial<Category>): Promise<Category> => {
    const { rows } = await query<Category>(`
      INSERT INTO categories (name, description) 
      VALUES ($1, $2) 
      RETURNING *
    `, [category.name, category.description]);
    return mapCategory(rows[0]);
  },

  update: async (category: Category): Promise<Category> => {
    const { rows } = await query<Category>(`
      UPDATE categories SET
        name = $1,
        description = $2,
        updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [category.name, category.description, category.id]);
    return mapCategory(rows[0]);
  },

  delete: async (id: string): Promise<boolean> => {
    const result = await query('DELETE FROM categories WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
};

export const customerService = {
  getAll: async (): Promise<Customer[]> => {
    const result = await query<Customer>('SELECT * FROM customers');
    return result.rows.map(mapCustomer);
  },

  getById: async (id: string): Promise<Customer | undefined> => {
    const result = await query<Customer>('SELECT * FROM customers WHERE id = $1', [id]);
    return result.rows.length ? mapCustomer(result.rows[0]) : undefined;
  },

  create: async (customer: Partial<Customer>): Promise<Customer> => {
    const { rows } = await query<Customer>(`
      INSERT INTO customers (name, address, phone, email) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `, [customer.name, customer.address, customer.phone, customer.email]);
    return mapCustomer(rows[0]);
  },

  update: async (customer: Customer): Promise<Customer> => {
    const { rows } = await query<Customer>(`
      UPDATE customers SET
        name = $1,
        address = $2,
        phone = $3,
        email = $4,
        updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `, [
      customer.name,
      customer.address,
      customer.phone,
      customer.email,
      customer.id
    ]);
    return mapCustomer(rows[0]);
  },

  delete: async (id: string): Promise<boolean> => {
    const result = await query('DELETE FROM customers WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
};

export const supplierService = {
  getAll: async (): Promise<Supplier[]> => {
    const result = await query<Supplier>('SELECT * FROM suppliers');
    return result.rows.map(mapSupplier);
  },

  getById: async (id: string): Promise<Supplier | undefined> => {
    const result = await query<Supplier>('SELECT * FROM suppliers WHERE id = $1', [id]);
    return result.rows.length ? mapSupplier(result.rows[0]) : undefined;
  },

  create: async (supplier: Partial<Supplier>): Promise<Supplier> => {
    const { rows } = await query<Supplier>(`
      INSERT INTO suppliers (name, address, phone, email, website) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `, [
      supplier.name,
      supplier.address,
      supplier.phone,
      supplier.email,
      supplier.website
    ]);
    return mapSupplier(rows[0]);
  },

  update: async (supplier: Supplier): Promise<Supplier> => {
    const { rows } = await query<Supplier>(`
      UPDATE suppliers SET
        name = $1,
        address = $2,
        phone = $3,
        email = $4,
        website = $5,
        updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `, [
      supplier.name,
      supplier.address,
      supplier.phone,
      supplier.email,
      supplier.website,
      supplier.id
    ]);
    return mapSupplier(rows[0]);
  },

  delete: async (id: string): Promise<boolean> => {
    const result = await query('DELETE FROM suppliers WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
};

export const priceHistoryService = {
  getAll: async (): Promise<PriceHistory[]> => {
    const result = await query<PriceHistory>('SELECT * FROM price_history');
    return result.rows.map(mapPriceHistory);
  },

  getByProductId: async (productId: string): Promise<PriceHistory[]> => {
    const result = await query<PriceHistory>(
      'SELECT * FROM price_history WHERE product_id = $1 ORDER BY date DESC',
      [productId]
    );
    return result.rows.map(mapPriceHistory);
  },

  create: async (historyEntry: Omit<PriceHistory, 'id' | 'createdAt' | 'updatedAt'>): Promise<PriceHistory> => {
    const { rows } = await query<PriceHistory>(`
      INSERT INTO price_history (product_id, price, date, type)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [
      historyEntry.productId,
      historyEntry.price,
      historyEntry.date,
      historyEntry.type
    ]);
    return mapPriceHistory(rows[0]);
  },

  delete: async (id: string): Promise<boolean> => {
    const result = await query('DELETE FROM price_history WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
};

export const purchaseService = {
  getAll: async (): Promise<PurchaseOrder[]> => {
    const result = await query<PurchaseOrder>('SELECT * FROM purchase_orders');
    const orders = result.rows.map(mapPurchaseOrder);
    
    // Obtener los items para cada orden
    for (const order of orders) {
      const itemsResult = await query<PurchaseOrderItem>(`
        SELECT 
          poi.*,
          p.name as product_name
        FROM purchase_order_items poi
        LEFT JOIN products p ON poi.product_id = p.id
        WHERE purchase_order_id = $1
      `, [order.id]);
      
      order.items = itemsResult.rows.map(row => ({
        productId: row.productId,
        productName: row.productName,
        quantity: row.quantity,
        unitPrice: row.unitPrice,
        total: row.total,
        isNewProduct: row.isNewProduct,
        proratedUnitCost: row.proratedUnitCost ? row.proratedUnitCost : undefined,
        suggestedSellingPrice: row.suggestedSellingPrice ? row.suggestedSellingPrice : undefined
      }));
    }
    
    return orders;
  },

  getById: async (id: string): Promise<PurchaseOrder | undefined> => {
    const orderResult = await query<PurchaseOrder>(
      'SELECT * FROM purchase_orders WHERE id = $1',
      [id]
    );
    
    if (!orderResult.rows.length) return undefined;
    
    const order = mapPurchaseOrder(orderResult.rows[0]);
    
    // Obtener los items de la orden
    const itemsResult = await query<PurchaseOrderItem>(`
      SELECT 
        poi.*,
        p.name as product_name
      FROM purchase_order_items poi
      LEFT JOIN products p ON poi.product_id = p.id
      WHERE purchase_order_id = $1
    `, [id]);
    
    order.items = itemsResult.rows.map(row => ({
      productId: row.productId,
      productName: row.productName,
      quantity: row.quantity,
      unitPrice: row.unitPrice,
      total: row.total,
      isNewProduct: row.isNewProduct,
      proratedUnitCost: row.proratedUnitCost ? row.proratedUnitCost : undefined,
      suggestedSellingPrice: row.suggestedSellingPrice ? row.suggestedSellingPrice : undefined
    }));
    
    return order;
  },

  create: async (purchase: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt' | 'items'> & { items: Omit<PurchaseOrderItem, 'productName'>[] }): Promise<PurchaseOrder> => {
    let client: PoolClient;
    try {
      client = await pool.connect();
      await client.query('BEGIN');

      // 1. Crear la orden de compra
      const { rows: orderRows } = await client.query<PurchaseOrder>(`
        INSERT INTO purchase_orders (
          supplier_id, supplier_name, date, status, 
          total, shipping_cost, additional_fees, discount
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        purchase.supplierId,
        purchase.supplierName,
        purchase.date,
        purchase.status,
        purchase.total,
        purchase.shippingCost,
        purchase.additionalFees,
        purchase.discount
      ]);

      const newOrder = mapPurchaseOrder(orderRows[0]);

      // 2. Agregar los items de la orden
      for (const item of purchase.items) {
        // Obtener el nombre del producto si no es nuevo
        let productName = '';
        if (!item.isNewProduct && item.productId) {
          const productResult = await client.query<Product>(
            'SELECT name FROM products WHERE id = $1',
            [item.productId]
          );
          productName = productResult.rows[0]?.name || '';
        } else {
          productName = item.productId || '';
        }

        await client.query(`
          INSERT INTO purchase_order_items (
            purchase_order_id, product_id, product_name, quantity, 
            unit_price, total, is_new_product, prorated_unit_cost, suggested_selling_price
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          newOrder.id,
          item.productId,
          productName,
          item.quantity,
          item.unitPrice,
          item.total,
          item.isNewProduct || false,
          item.proratedUnitCost,
          item.suggestedSellingPrice
        ]);

        // 3. Si la orden está entregada, actualizar inventario
        if (newOrder.status === 'DELIVERED') {
          if (item.isNewProduct) {
            // Crear nuevo producto
            await client.query(`
              INSERT INTO products (
                name, stock, last_purchase_price, selling_price, description
              ) VALUES ($1, $2, $3, $4, $5)
            `, [
              productName,
              item.quantity,
              item.unitPrice,
              item.suggestedSellingPrice || Math.round(item.unitPrice * 1.4),
              'Nuevo producto creado desde orden de compra'
            ]);
          } else if (item.productId) {
            // Actualizar producto existente
            await client.query(`
              UPDATE products SET
                stock = stock + $1,
                last_purchase_price = $2,
                selling_price = COALESCE($3, selling_price),
                updated_at = NOW()
              WHERE id = $4
            `, [
              item.quantity,
              item.unitPrice,
              item.suggestedSellingPrice,
              item.productId
            ]);

            // Registrar en el historial de precios
            await client.query(`
              INSERT INTO price_history (product_id, price, date, type)
              VALUES ($1, $2, $3, 'purchase')
            `, [
              item.productId,
              item.unitPrice,
              new Date()
            ]);
          }
        }
      }

      await client.query('COMMIT');
      return await purchaseService.getById(newOrder.id) as PurchaseOrder;
    } catch (error) {
      if (client) await client.query('ROLLBACK');
      console.error('Error creating purchase order:', error);
      throw error;
    } finally {
      if (client) client.release();
    }
  },

  update: async (purchase: PurchaseOrder): Promise<PurchaseOrder> => {
    let client: PoolClient;
    try {
      client = await pool.connect();
      await client.query('BEGIN');

      // 1. Actualizar la orden principal
      const { rows: orderRows } = await client.query<PurchaseOrder>(`
        UPDATE purchase_orders SET
          supplier_id = $1,
          supplier_name = $2,
          date = $3,
          status = $4,
          total = $5,
          shipping_cost = $6,
          additional_fees = $7,
          discount = $8,
          updated_at = NOW()
        WHERE id = $9
        RETURNING *
      `, [
        purchase.supplierId,
        purchase.supplierName,
        purchase.date,
        purchase.status,
        purchase.total,
        purchase.shippingCost,
        purchase.additionalFees,
        purchase.discount,
        purchase.id
      ]);

      const updatedOrder = mapPurchaseOrder(orderRows[0]);

      // 2. Eliminar items antiguos y agregar los nuevos
      await client.query('DELETE FROM purchase_order_items WHERE purchase_order_id = $1', [purchase.id]);

      for (const item of purchase.items) {
        await client.query(`
          INSERT INTO purchase_order_items (
            purchase_order_id, product_id, product_name, quantity, 
            unit_price, total, is_new_product, prorated_unit_cost, suggested_selling_price
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          purchase.id,
          item.productId,
          item.productName,
          item.quantity,
          item.unitPrice,
          item.total,
          item.isNewProduct || false,
          item.proratedUnitCost,
          item.suggestedSellingPrice
        ]);

        // 3. Si el estado cambió a DELIVERED, actualizar inventario
        if (purchase.status === 'DELIVERED') {
          if (item.isNewProduct) {
            // Crear nuevo producto
            await client.query(`
              INSERT INTO products (
                name, stock, last_purchase_price, selling_price, description
              ) VALUES ($1, $2, $3, $4, $5)
            `, [
              item.productName,
              item.quantity,
              item.unitPrice,
              item.suggestedSellingPrice || Math.round(item.unitPrice * 1.4),
              'Nuevo producto creado desde orden de compra'
            ]);
          } else if (item.productId) {
            // Actualizar producto existente
            await client.query(`
              UPDATE products SET
                stock = stock + $1,
                last_purchase_price = $2,
                selling_price = COALESCE($3, selling_price),
                updated_at = NOW()
              WHERE id = $4
            `, [
              item.quantity,
              item.unitPrice,
              item.suggestedSellingPrice,
              item.productId
            ]);

            // Registrar en el historial de precios
            await client.query(`
              INSERT INTO price_history (product_id, price, date, type)
              VALUES ($1, $2, $3, 'purchase')
            `, [
              item.productId,
              item.unitPrice,
              new Date()
            ]);
          }
        }
      }

      await client.query('COMMIT');
      return await purchaseService.getById(updatedOrder.id) as PurchaseOrder;
    } catch (error) {
      if (client) await client.query('ROLLBACK');
      console.error('Error updating purchase order:', error);
      throw error;
    } finally {
      if (client) client.release();
    }
  },

  delete: async (id: string): Promise<boolean> => {
    let client: PoolClient;
    try {
      client = await pool.connect();
      await client.query('BEGIN');

      // Eliminar items primero
      await client.query('DELETE FROM purchase_order_items WHERE purchase_order_id = $1', [id]);
      
      // Luego eliminar la orden
      const result = await client.query('DELETE FROM purchase_orders WHERE id = $1', [id]);

      await client.query('COMMIT');
      return result.rowCount > 0;
    } catch (error) {
      if (client) await client.query('ROLLBACK');
      console.error('Error deleting purchase order:', error);
      throw error;
    } finally {
      if (client) client.release();
    }
  }
};

export const salesService = {
  getAll: async (): Promise<SalesOrder[]> => {
    const result = await query<SalesOrder>('SELECT * FROM sales_orders');
    const orders = result.rows.map(mapSalesOrder);
    
    // Obtener los items para cada orden
    for (const order of orders) {
      const itemsResult = await query<SalesOrderItem>(`
        SELECT 
          soi.*,
          p.name as product_name
        FROM sales_order_items soi
        LEFT JOIN products p ON soi.product_id = p.id
        WHERE sales_order_id = $1
      `, [order.id]);
      
      order.items = itemsResult.rows.map(row => ({
        productId: row.productId,
        productName: row.productName,
        quantity: row.quantity,
        unitPrice: row.unitPrice,
        total: row.total
      }));
    }
    
    return orders;
  },

  getById: async (id: string): Promise<SalesOrder | undefined> => {
    const orderResult = await query<SalesOrder>(
      'SELECT * FROM sales_orders WHERE id = $1',
      [id]
    );
    
    if (!orderResult.rows.length) return undefined;
    
    const order = mapSalesOrder(orderResult.rows[0]);
    
    // Obtener los items de la orden
    const itemsResult = await query<SalesOrderItem>(`
      SELECT 
        soi.*,
        p.name as product_name
      FROM sales_order_items soi
      LEFT JOIN products p ON soi.product_id = p.id
      WHERE sales_order_id = $1
    `, [id]);
    
    order.items = itemsResult.rows.map(row => ({
      productId: row.productId,
      productName: row.productName,
      quantity: row.quantity,
      unitPrice: row.unitPrice,
      total: row.total
    }));
    
    return order;
  },

  create: async (sale: Omit<SalesOrder, 'id' | 'createdAt' | 'updatedAt' | 'items'> & { items: Omit<SalesOrderItem, 'productName'>[] }): Promise<SalesOrder> => {
    let client: PoolClient;
    try {
      client = await pool.connect();
      await client.query('BEGIN');

      // 1. Crear la orden de venta
      const { rows: orderRows } = await client.query<SalesOrder>(`
        INSERT INTO sales_orders (
          customer_id, customer_name, date, total
        ) VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [
        sale.customerId,
        sale.customerName,
        sale.date,
        sale.total
      ]);

      const newOrder = mapSalesOrder(orderRows[0]);

      // 2. Agregar los items de la orden
      for (const item of sale.items) {
        // Obtener el nombre del producto
        const productResult = await client.query<Product>(
          'SELECT name FROM products WHERE id = $1',
          [item.productId]
        );
        const productName = productResult.rows[0]?.name || '';

        await client.query(`
          INSERT INTO sales_order_items (
            sales_order_id, product_id, product_name, quantity, 
            unit_price, total
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          newOrder.id,
          item.productId,
          productName,
          item.quantity,
          item.unitPrice,
          item.total
        ]);

        // 3. Actualizar el stock del producto
        await client.query(`
          UPDATE products SET
            stock = stock - $1,
            updated_at = NOW()
          WHERE id = $2
        `, [
          item.quantity,
          item.productId
        ]);

        // 4. Registrar en el historial de precios
        await client.query(`
          INSERT INTO price_history (product_id, price, date, type)
          VALUES ($1, $2, $3, 'sale')
        `, [
          item.productId,
          item.unitPrice,
          new Date()
        ]);
      }

      await client.query('COMMIT');
      return await salesService.getById(newOrder.id) as SalesOrder;
    } catch (error) {
      if (client) await client.query('ROLLBACK');
      console.error('Error creating sales order:', error);
      throw error;
    } finally {
      if (client) client.release();
    }
  },

  update: async (sale: SalesOrder): Promise<SalesOrder> => {
    let client: PoolClient;
    try {
      client = await pool.connect();
      await client.query('BEGIN');

      // 1. Actualizar la orden principal
      const { rows: orderRows } = await client.query<SalesOrder>(`
        UPDATE sales_orders SET
          customer_id = $1,
          customer_name = $2,
          date = $3,
          total = $4,
          updated_at = NOW()
        WHERE id = $5
        RETURNING *
      `, [
        sale.customerId,
        sale.customerName,
        sale.date,
        sale.total,
        sale.id
      ]);

      const updatedOrder = mapSalesOrder(orderRows[0]);

      // 2. Eliminar items antiguos y agregar los nuevos
      await client.query('DELETE FROM sales_order_items WHERE sales_order_id = $1', [sale.id]);

      for (const item of sale.items) {
        await client.query(`
          INSERT INTO sales_order_items (
            sales_order_id, product_id, product_name, quantity, 
            unit_price, total
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          sale.id,
          item.productId,
          item.productName,
          item.quantity,
          item.unitPrice,
          item.total
        ]);
      }

      await client.query('COMMIT');
      return await salesService.getById(updatedOrder.id) as SalesOrder;
    } catch (error) {
      if (client) await client.query('ROLLBACK');
      console.error('Error updating sales order:', error);
      throw error;
    } finally {
      if (client) client.release();
    }
  },

  delete: async (id: string): Promise<boolean> => {
    let client: PoolClient;
    try {
      client = await pool.connect();
      await client.query('BEGIN');

      // Eliminar items primero
      await client.query('DELETE FROM sales_order_items WHERE sales_order_id = $1', [id]);
      
      // Luego eliminar la orden
      const result = await client.query('DELETE FROM sales_orders WHERE id = $1', [id]);

      await client.query('COMMIT');
      return result.rowCount > 0;
    } catch (error) {
      if (client) await client.query('ROLLBACK');
      console.error('Error deleting sales order:', error);
      throw error;
    } finally {
      if (client) client.release();
    }
  }
};

// Cerrar la conexión al pool cuando la aplicación termine
process.on('beforeExit', async () => {
  await pool.end();
});