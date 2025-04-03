
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
  ChevronDown,
  Check,
  Truck
} from "lucide-react";
import { Link } from "react-router-dom";
import { MOCK_PURCHASES, PurchaseOrder } from "@/utils/types";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PurchasesList = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredPurchases = MOCK_PURCHASES.filter(purchase => 
    purchase.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDelete = (id: string) => {
    // Would delete the purchase in a real app
    toast({
      title: "Compra eliminada",
      description: "La orden de compra ha sido eliminada correctamente.",
    });
  };

  const handleUpdateStatus = (purchase: PurchaseOrder, newStatus: "ORDERED" | "DELIVERED") => {
    // Would update status in a real app
    toast({
      title: "Estado actualizado",
      description: `La orden de compra ha sido actualizada a "${newStatus === "ORDERED" ? "Pedido" : "Entregado"}"`,
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
            <h1 className="text-2xl font-bold">Compras</h1>
            <p className="text-gray-500">Gestione sus órdenes de compra</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Link to="/purchases/new" className="w-full md:w-auto">
              <Button className="w-full">
                <PlusCircle className="h-4 w-4 mr-2" />
                Nueva Compra
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
                  placeholder="Buscar por proveedor..."
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
            {filteredPurchases.map(purchase => (
              <Card key={purchase.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 border-b">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{purchase.supplierName}</h3>
                      <span className={`badge ${purchase.status === 'ORDERED' ? 'badge-yellow' : 'badge-green'}`}>
                        {purchase.status === 'ORDERED' ? 'Pedido' : 'Entregado'}
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">Fecha: {formatDate(purchase.date)}</p>
                      <p className="text-sm font-medium mt-1">Items: {purchase.items.length}</p>
                      <p className="font-medium mt-2">{formatCurrency(purchase.total)}</p>
                    </div>
                  </div>
                  <div className="px-4 py-3 flex justify-between items-center bg-gray-50">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Truck className="h-4 w-4 mr-1" />
                          Estado
                          <ChevronDown className="h-3 w-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem 
                          onClick={() => handleUpdateStatus(purchase, "ORDERED")}
                          className="flex items-center"
                        >
                          {purchase.status === "ORDERED" && <Check className="h-4 w-4 mr-1" />}
                          Pedido
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleUpdateStatus(purchase, "DELIVERED")}
                          className="flex items-center"
                        >
                          {purchase.status === "DELIVERED" && <Check className="h-4 w-4 mr-1" />}
                          Entregado
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="flex gap-2">
                      <Link to={`/purchases/edit/${purchase.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-500"
                        onClick={() => handleDelete(purchase.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
                  <th>Proveedor</th>
                  <th>Fecha</th>
                  <th>Items</th>
                  <th>Estado</th>
                  <th>Envío</th>
                  <th>Total</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map(purchase => (
                  <tr key={purchase.id}>
                    <td>{purchase.supplierName}</td>
                    <td>{formatDate(purchase.date)}</td>
                    <td>{purchase.items.length}</td>
                    <td>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className={`w-32 justify-start ${purchase.status === 'ORDERED' ? 'text-yellow-600' : 'text-green-600'}`}
                          >
                            <span className={`w-2 h-2 rounded-full mr-2 ${purchase.status === 'ORDERED' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                            {purchase.status === 'ORDERED' ? 'Pedido' : 'Entregado'}
                            <ChevronDown className="h-4 w-4 ml-auto" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(purchase, "ORDERED")}
                            className="flex items-center"
                          >
                            {purchase.status === "ORDERED" && <Check className="h-4 w-4 mr-1" />}
                            Pedido
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(purchase, "DELIVERED")}
                            className="flex items-center"
                          >
                            {purchase.status === "DELIVERED" && <Check className="h-4 w-4 mr-1" />}
                            Entregado
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                    <td>{formatCurrency(purchase.shippingCost)}</td>
                    <td className="font-medium">{formatCurrency(purchase.total)}</td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <Link to={`/purchases/edit/${purchase.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Editar
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500"
                          onClick={() => handleDelete(purchase.id)}
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

export default PurchasesList;
