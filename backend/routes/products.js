import express from 'express';
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

export default router;
