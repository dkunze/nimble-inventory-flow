import express from 'express';
import db from '../db/index.js';

const router = express.Router();

// GET /api/warehouses
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM warehouses ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener depósitos:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
