import db from '../db/index.js';

export const getAllProducts = async () => {
  const result = await db.query('SELECT * FROM products');
  return result.rows;
};

export async function getAllCategories() {
  const result = await db.query('SELECT * FROM categories ORDER BY name');
  return result.rows;
}

export const getProductById = async (id) => {
  const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);
  return result.rows[0];
};
