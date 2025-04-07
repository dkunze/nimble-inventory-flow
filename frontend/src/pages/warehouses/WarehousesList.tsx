
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Trash2
} from "lucide-react";
import { Link } from "react-router-dom";
import { Warehouse } from "@/utils/types";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { warehouseService } from "@/services/dataService";

const WarehousesList = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  
  useEffect(() => {
    // Load warehouses when component mounts
    setWarehouses(warehouseService.getAll());
  }, []);
  
  const filteredWarehouses = warehouses.filter(warehouse => 
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.code.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDelete = (id: string) => {
    try {
      warehouseService.delete(id);
      setWarehouses(warehouses.filter(warehouse => warehouse.id !== id));
      
      toast({
        title: "Depósito eliminado",
        description: "El depósito ha sido eliminado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error al eliminar el depósito.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <MainLayout>
      <div className="page-container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Depósitos</h1>
            <p className="text-gray-500">Gestione sus depósitos de productos</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Link to="/warehouses/new" className="w-full md:w-auto">
              <Button className="w-full">
                <PlusCircle className="h-4 w-4 mr-2" />
                Nuevo Depósito
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
                  placeholder="Buscar por nombre o código..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {isMobile ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredWarehouses.map(warehouse => (
              <Card key={warehouse.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 flex justify-between items-start border-b">
                    <div>
                      <h3 className="font-medium">{warehouse.name}</h3>
                      <p className="text-sm text-gray-500">Código: {warehouse.code}</p>
                    </div>
                  </div>
                  <div className="px-4 py-3 flex justify-between items-center bg-gray-50">
                    <div className="flex gap-2">
                      <Link to={`/warehouses/edit/${warehouse.id}`}>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="text-red-500" 
                        onClick={() => handleDelete(warehouse.id)}
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
                  <th className="w-8">#</th>
                  <th>Nombre</th>
                  <th>Código</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredWarehouses.map((warehouse, index) => (
                  <tr key={warehouse.id}>
                    <td>{index + 1}</td>
                    <td>{warehouse.name}</td>
                    <td>{warehouse.code}</td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <Link to={`/warehouses/edit/${warehouse.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Editar
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500"
                          onClick={() => handleDelete(warehouse.id)}
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

export default WarehousesList;
