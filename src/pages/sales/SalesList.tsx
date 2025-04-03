
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Trash2, 
  Filter,
  Download,
  Calendar,
  User
} from "lucide-react";
import { Link } from "react-router-dom";
import { MOCK_SALES } from "@/utils/types";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const SalesList = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredSales = MOCK_SALES.filter(sale => 
    sale.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDelete = (id: string) => {
    // Would delete the sale in a real app
    toast({
      title: "Venta eliminada",
      description: "La venta ha sido eliminada correctamente.",
    });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { 
      style: 'currency', 
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  return (
    <MainLayout>
      <div className="page-container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Ventas</h1>
            <p className="text-gray-500">Gestione sus ventas</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Link to="/sales/new" className="w-full md:w-auto">
              <Button className="w-full">
                <PlusCircle className="h-4 w-4 mr-2" />
                Nueva Venta
              </Button>
            </Link>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar por cliente..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" className="md:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline" className="md:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {isMobile ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredSales.map(sale => (
              <Card key={sale.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1.5 text-gray-500" />
                          <h3 className="font-medium">{sale.customerName}</h3>
                        </div>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1.5 text-gray-500" />
                          <p className="text-sm text-gray-500">{formatDate(sale.date)}</p>
                        </div>
                      </div>
                      <p className="font-semibold">{formatCurrency(sale.total)}</p>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-gray-600">Productos: {sale.items.length}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {sale.items.slice(0, 2).map((item, i) => (
                          <span key={i} className="badge badge-blue">
                            {item.productName} x{item.quantity}
                          </span>
                        ))}
                        {sale.items.length > 2 && (
                          <span className="badge badge-blue">
                            +{sale.items.length - 2} más
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 flex justify-end items-center gap-2 bg-gray-50">
                    <Link to={`/sales/edit/${sale.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-500"
                      onClick={() => handleDelete(sale.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Productos</th>
                  <th>Total</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map(sale => (
                  <tr key={sale.id}>
                    <td>{sale.customerName}</td>
                    <td>{formatDate(sale.date)}</td>
                    <td>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {sale.items.slice(0, 3).map((item, i) => (
                          <span key={i} className="badge badge-blue">
                            {item.productName} x{item.quantity}
                          </span>
                        ))}
                        {sale.items.length > 3 && (
                          <span className="badge badge-blue">
                            +{sale.items.length - 3} más
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="font-medium">{formatCurrency(sale.total)}</td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <Link to={`/sales/edit/${sale.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Editar
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500"
                          onClick={() => handleDelete(sale.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SalesList;
