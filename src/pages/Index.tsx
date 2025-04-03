
import MainLayout from "@/components/layout/MainLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import { MOCK_DASHBOARD_STATS, MOCK_PRODUCTS, MOCK_PURCHASES, MOCK_SALES } from "@/utils/types";
import { 
  DollarSign, 
  ShoppingCart, 
  AlertCircle, 
  Clock,
  BarChart,
  Package,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Index = () => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { 
      style: 'currency', 
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <MainLayout>
      <div className="page-container">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-500 text-sm">Bienvenido de nuevo, Admin</p>
          </div>
          <div className="space-x-2">
            <Button variant="outline">Exportar Datos</Button>
            <Button>Nuevo Reporte</Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Ventas del Mes"
            value={formatCurrency(MOCK_DASHBOARD_STATS.totalSales)}
            icon={<DollarSign className="h-6 w-6" />}
            trend={{ value: 12, positive: true }}
          />
          <StatsCard 
            title="Compras del Mes"
            value={formatCurrency(MOCK_DASHBOARD_STATS.totalPurchases)}
            icon={<ShoppingCart className="h-6 w-6" />}
            trend={{ value: 5, positive: true }}
          />
          <StatsCard 
            title="Productos con Bajo Stock"
            value={MOCK_DASHBOARD_STATS.lowStockProducts}
            icon={<AlertCircle className="h-6 w-6" />}
            className="bg-yellow-50"
          />
          <StatsCard 
            title="Órdenes Pendientes"
            value={MOCK_DASHBOARD_STATS.pendingOrders}
            icon={<Clock className="h-6 w-6" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Ventas Recientes</CardTitle>
              <CardDescription>Últimas ventas realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="table-container">
                <table className="app-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Fecha</th>
                      <th>Artículos</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_SALES.slice(0, 5).map((sale) => (
                      <tr key={sale.id}>
                        <td>{sale.customerName}</td>
                        <td>{new Date(sale.date).toLocaleDateString()}</td>
                        <td>{sale.items.length}</td>
                        <td>{formatCurrency(sale.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compras Recientes</CardTitle>
              <CardDescription>Últimos pedidos a proveedores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="table-container">
                <table className="app-table">
                  <thead>
                    <tr>
                      <th>Proveedor</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_PURCHASES.slice(0, 5).map((purchase) => (
                      <tr key={purchase.id}>
                        <td>{purchase.supplierName}</td>
                        <td>{new Date(purchase.date).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${purchase.status === 'ORDERED' ? 'badge-yellow' : 'badge-green'}`}>
                            {purchase.status === 'ORDERED' ? 'Pedido' : 'Entregado'}
                          </span>
                        </td>
                        <td>{formatCurrency(purchase.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tendencias de Ventas</CardTitle>
                <CardDescription>Evolución de ventas en los últimos 6 meses</CardDescription>
              </div>
              <BarChart className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center">
              <p className="text-sm text-gray-500">Gráfico de tendencias (Datos de demostración)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Productos Populares</CardTitle>
              <CardDescription>Los más vendidos este mes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_PRODUCTS.slice(0, 5).map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-primary mr-3">
                        <Package className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.stock} en stock</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {index % 2 === 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${index % 2 === 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {index % 2 === 0 ? '+' : '-'}{Math.floor(Math.random() * 20) + 5}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
