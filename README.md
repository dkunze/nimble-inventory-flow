Para abrir pgAdmin: http://localhost:5050
Login: admin@admin.com / admin


🔌 Pestaña Connection
Estos son los datos que usaste en docker-compose.yml y .env:

Campo	Valor
Host name	db
Port	5432
Maintenance DB	nimble
Username	postgres
Password	postgres


Backend: npm run dev
Docker: docker compose up --build


# 📦 Nimble Inventory Flow - Backend

Este repositorio contiene el backend del proyecto **Nimble Inventory Flow**, una aplicación para la gestión de inventario. Incluye una base de datos PostgreSQL, una API REST construida con Node.js + Express y un entorno de desarrollo con Docker.

---

## 🚀 Tecnologías utilizadas
- Node.js
- Express.js
- PostgreSQL
- Docker & Docker Compose
- pgAdmin 4

---

## 📁 Estructura del proyecto
```
nimble-inventory-flow/
├── backend/               # Código fuente del backend
│   ├── db/                # (opcional) conexión a la base de datos
│   ├── routes/            # Endpoints de la API
│   ├── services/          # Lógica de negocio
│   ├── server.js          # Punto de entrada del backend
│   └── Dockerfile         # Imagen del backend
├── frontend/              # (opcional) frontend del proyecto
├── init/                  # Scripts de inicialización de la base de datos
│   └── scriptDB.sql       # Script SQL para crear tablas y datos
├── docker-compose.yml     # Orquestación de servicios
└── README.md              # Este archivo
```

---

## 🐳 Requisitos
- Docker
- Docker Compose

---

## 🛠 Configuración inicial

1. Crear un archivo `.env` en la raíz del proyecto:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=admin123
POSTGRES_DB=nimble
```

2. Parar y eliminar contenedores y volúmenes anteriores (si los hubiera):
```bash
docker-compose down -v
```

3. Levantar los servicios:
```bash
docker-compose up --build
```
Esto:
- Creará la base de datos PostgreSQL
- Ejecutará el script `scriptDB.sql` solo la **primera vez** que se cree el volumen
- Iniciará el backend en `http://localhost:3001`
- Iniciará pgAdmin en `http://localhost:5050`

---

## 🧪 Probar la API

Listar productos:
```bash
curl http://localhost:3001/api/products
```

Crear un producto (reemplazar los UUIDs reales de almacén y categoría):
```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Notebook Lenovo",
    "description": "Notebook 15.6 pulgadas",
    "warehouse_id": "<uuid-almacen>",
    "category_id": "<uuid-categoria>",
    "last_purchase_price": 150000,
    "selling_price": 190000,
    "stock": 5
  }'
```

---

## 🐘 Acceder a pgAdmin

1. Ir a [http://localhost:5050](http://localhost:5050)
2. Login:
   - **Email**: `admin@admin.com`
   - **Password**: `admin`
3. Click derecho en *Servers* → *Register* → *Server...*
4. En pestaña "General":
   - **Name**: `db`
5. En pestaña "Connection":
   - **Host**: `db`
   - **Port**: `5432`
   - **Maintenance**: `nimble`
   - **Username**: `postgres` (o el definido en .env)
   - **Password**: `postgres` (o el definido en .env)

---

## 🧼 Tips

- Si el script `scriptDB.sql` no se ejecutó, asegurate de eliminar el volumen con:
```bash
docker-compose down -v
```

- Para ejecutar el script manualmente:
```bash
docker exec -it nimble-inventory-flow-db-1 bash
psql -U postgres -d nimble -f /docker-entrypoint-initdb.d/scriptDB.sql
```

---

