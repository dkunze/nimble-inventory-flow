import db from '../db/index.js';

export async function getAllProducts() {
  const result = await db.query('SELECT * FROM products ORDER BY name');
  return result.rows;
}
