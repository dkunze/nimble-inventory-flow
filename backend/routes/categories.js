import express from 'express';
import { getAllCategories } from '../services/productService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error al obtener categoria:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// router.get('/:id/categories', async (req, res) => {
//   try {
//     const categories = await getAllCategories();
//     res.json(categories);
//   } catch (error) {
//     console.error('Error al obtener categoria:', error);
//     res.status(500).json({ error: 'Error interno del servidor' });
//   }
// });

export default router;
