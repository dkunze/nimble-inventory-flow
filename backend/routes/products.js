import express from 'express';
import db from '../db/index.js';

import { getAllProducts, getProductById } from '../services/productService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, warehouse_id, category_id, last_purchase_price, selling_price, stock } = req.body;

    if (!name || !warehouse_id || !category_id) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const result = await db.query(
      `INSERT INTO products (id, name, description, warehouse_id, category_id, last_purchase_price, selling_price, stock)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, description, warehouse_id, category_id, last_purchase_price, selling_price, stock]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const product = await getProductById(id);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
})

export default router;
