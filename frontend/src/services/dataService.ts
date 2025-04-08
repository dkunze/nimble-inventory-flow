import { Product, Warehouse, Category } from "@/utils/types";

const API_BASE = "http://localhost:3002/api";

const fetchData = async <T>(url: string): Promise<T> => {
  const res = await fetch(`${API_BASE}${url}`);
  if (!res.ok) throw new Error(`Error fetching ${url}`);
  return res.json();
};

const postData = async <T>(url: string, data: unknown): Promise<T> => {
  const res = await fetch(`${API_BASE}${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Error posting to ${url}`);
  return res.json();
};

const putData = async <T>(url: string, data: unknown): Promise<T> => {
  const res = await fetch(`${API_BASE}${url}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Error updating ${url}`);
  return res.json();
};

const deleteData = async (url: string): Promise<void> => {
  const res = await fetch(`${API_BASE}${url}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Error deleting ${url}`);
};

// PRODUCTOS
export const productService = {
  getAll: () => fetchData<Product[]>("/products"),
  getById: (id: string) => fetchData<Product>(`/products/${id}`),
  create: (data: Partial<Product>) => postData<Product>("/products", data),
  update: (id: string, data: Partial<Product>) => putData<Product>(`/products/${id}`, data),
  delete: (id: string) => deleteData(`/products/${id}`),
};

// DEPÓSITOS
export const warehouseService = {
  getAll: () => fetchData<Warehouse[]>("/warehouses"),
  getById: (id: string) => fetchData<Warehouse>(`/warehouses/${id}`),
  create: (data: Partial<Warehouse>) => postData<Warehouse>("/warehouses", data),
  update: (id: string, data: Partial<Warehouse>) => putData<Warehouse>(`/warehouses/${id}`, data),
  delete: (id: string) => deleteData(`/warehouses/${id}`),
};

// CATEGORÍAS
export const categoryService = {
  getAll: () => fetchData<Category[]>("/categories"),
  getById: (id: string) => fetchData<Category>(`/categories/${id}`),
  create: (data: Partial<Category>) => postData<Category>("/categories", data),
  update: (id: string, data: Partial<Category>) => putData<Category>(`/categories/${id}`, data),
  delete: (id: string) => deleteData(`/categories/${id}`),
};

// TEMPORAL para evitar errores hasta que los reimplementemos
export const supplierService = {};
export const customerService = {};
export const salesService = {};
export const purchaseService = {};
export const priceHistoryService = {};
