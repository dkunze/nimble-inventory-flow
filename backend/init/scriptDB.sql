-- Crear la extensión UUID si no existe (para generar IDs únicos)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla Base (campos comunes para todas las entidades)
CREATE TABLE IF NOT EXISTS base_entity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla de Almacenes (Warehouse)
CREATE TABLE IF NOT EXISTS warehouses (
  PRIMARY KEY (id),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE
) INHERITS (base_entity);

-- Tabla de Categorías (Category)
CREATE TABLE IF NOT EXISTS categories (
  PRIMARY KEY (id),
  name VARCHAR(255) NOT NULL,
  description TEXT
) INHERITS (base_entity);

-- Tabla de Productos (Product)
CREATE TABLE IF NOT EXISTS products (
  PRIMARY KEY (id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE
  SET
    NULL,
    category_id UUID REFERENCES categories(id) ON DELETE
  SET
    NULL,
    last_purchase_price DECIMAL(12, 2) NOT NULL,
    selling_price DECIMAL(12, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0
) INHERITS (base_entity);

-- Tabla de Historial de Precios (PriceHistory)
CREATE TABLE IF NOT EXISTS price_history (
  PRIMARY KEY (id),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  price DECIMAL(12, 2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  type VARCHAR(10) NOT NULL CHECK (type IN ('purchase', 'sale'))
) INHERITS (base_entity);

-- Tabla de Clientes (Customer)
CREATE TABLE IF NOT EXISTS customers (
  PRIMARY KEY (id),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL
) INHERITS (base_entity);

-- Tabla de Proveedores (Supplier)
CREATE TABLE IF NOT EXISTS suppliers (
  PRIMARY KEY (id),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  website VARCHAR(255)
) INHERITS (base_entity);

-- Tabla de Órdenes de Compra (PurchaseOrder)
CREATE TABLE IF NOT EXISTS purchase_orders (
  PRIMARY KEY (id),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
  supplier_name VARCHAR(255) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  status VARCHAR(10) NOT NULL CHECK (status IN ('ORDERED', 'DELIVERED')),
  total DECIMAL(12, 2) NOT NULL,
  shipping_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
  additional_fees DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(12, 2) NOT NULL DEFAULT 0
) INHERITS (base_entity);

-- Tabla de Ítems de Órdenes de Compra (PurchaseOrderItem)
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  total DECIMAL(12, 2) NOT NULL,
  is_new_product BOOLEAN DEFAULT FALSE,
  prorated_unit_cost DECIMAL(12, 2),
  suggested_selling_price DECIMAL(12, 2)
);

-- Tabla de Órdenes de Venta (SalesOrder)
CREATE TABLE IF NOT EXISTS sales_orders (
  PRIMARY KEY (id),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  customer_name VARCHAR(255) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  total DECIMAL(12, 2) NOT NULL
) INHERITS (base_entity);

-- Tabla de Ítems de Órdenes de Venta (SalesOrderItem)
CREATE TABLE IF NOT EXISTS sales_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sales_order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  total DECIMAL(12, 2) NOT NULL
);

-- Función para actualizar automáticamente el campo updated_at
CREATE
OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $ $ BEGIN NEW.updated_at = NOW();

RETURN NEW;

END;

$ $ LANGUAGE plpgsql;

-- Crear triggers para todas las tablas que heredan de base_entity
DO $ $ DECLARE tbl RECORD;

BEGIN FOR tbl IN
SELECT
  table_name
FROM
  information_schema.tables
WHERE
  table_schema = 'public'
  AND table_name IN (
    'warehouses',
    'categories',
    'products',
    'price_history',
    'customers',
    'suppliers',
    'purchase_orders',
    'sales_orders'
  ) LOOP EXECUTE format(
    'DROP TRIGGER IF EXISTS update_%s_updated_at ON %I',
    tbl.table_name,
    tbl.table_name
  );

EXECUTE format(
  'CREATE TRIGGER update_%s_updated_at
                      BEFORE UPDATE ON %I
                      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
  tbl.table_name,
  tbl.table_name
);

END LOOP;

END;

$ $;

-- Insertar almacenes (warehouses)
INSERT INTO
  warehouses (id, name, code)
VALUES
  (
    uuid_generate_v4(),
    'Depósito Central',
    'DEP-001'
  ),
  (uuid_generate_v4(), 'Sucursal Norte', 'DEP-002');

-- Insertar categorías (categories)
INSERT INTO
  categories (id, name, description)
VALUES
  (
    uuid_generate_v4(),
    'Electrónica',
    'Dispositivos electrónicos'
  ),
  (
    uuid_generate_v4(),
    'Ferretería',
    'Herramientas y materiales'
  );

-- Insertar productos (products)
-- Nota: usamos subqueries para obtener los IDs reales de almacenes y categorías
INSERT INTO
  products (id, name, description, warehouse_id, category_id)
VALUES
  (
    uuid_generate_v4(),
    'Taladro Eléctrico',
    'Taladro percutor 800W',
    (
      SELECT
        id
      FROM
        warehouses
      WHERE
        code = 'DEP-001'
      LIMIT
        1
    ), (
      SELECT
        id
      FROM
        categories
      WHERE
        name = 'Ferretería'
      LIMIT
        1
    )
  ), (
    uuid_generate_v4(), 'Auriculares Bluetooth', 'Auriculares inalámbricos con micrófono', (
      SELECT
        id
      FROM
        warehouses
      WHERE
        code = 'DEP-002'
      LIMIT
        1
    ), (
      SELECT
        id
      FROM
        categories
      WHERE
        name = 'Electrónica'
      LIMIT
        1
    )
  );