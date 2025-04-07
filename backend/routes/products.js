import express from 'express';
import db from '../db/index.js';
import { getAllProducts } from '../services/productService.js';

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

export default router;
