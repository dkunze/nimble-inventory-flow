import express from 'express';
import cors from 'cors';
import productRoutes from './routes/products.js';
import warehouseRoutes from './routes/warehouses.js';

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/warehouses', warehouseRoutes);

app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`);
});
