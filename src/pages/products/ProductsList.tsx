
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Trash2, 
  Filter, 
  ArrowUpDown,
  Download
} from "lucide-react";
import { Link } from "react-router-dom";
import { MOCK_PRODUCTS } from "@/utils/types";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const ProductsList = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredProducts = MOCK_PRODUCTS.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.warehouseCode.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDelete = (id: string) => {
    // Would delete the product in a real app
    toast({
      title: "Producto eliminado",
      description: "El producto ha sido eliminado correctamente.",
    });
  };
  
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Productos</h1>
            <p className="text-gray-500">Gestione su inventario de productos</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Link to="/products/new" className="w-full md:w-auto">
              <Button className="w-full">
                <PlusCircle className="h-4 w-4 mr-2" />
                Nuevo Producto
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
            {filteredProducts.map(product => (
              <Card key={product.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 flex justify-between items-start border-b">
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-gray-500">Código: {product.warehouseCode}</p>
                    </div>
                    <div>
                      <span className={`badge ${product.stock > 10 ? 'badge-green' : product.stock > 5 ? 'badge-yellow' : 'badge-red'}`}>
                        {product.stock} en stock
                      </span>
                    </div>
                  </div>
                  <div className="px-4 py-3 flex justify-between items-center bg-gray-50">
                    <div>
                      <p className="text-sm text-gray-500">Precio de venta</p>
                      <p className="font-semibold">{formatCurrency(product.sellingPrice)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/products/edit/${product.id}`}>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="text-red-500" 
                        onClick={() => handleDelete(product.id)}
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
                  <th className="flex items-center gap-1 cursor-pointer">
                    Nombre
                    <ArrowUpDown className="h-3 w-3" />
                  </th>
                  <th>Código</th>
                  <th>Stock</th>
                  <th>Precio de Compra</th>
                  <th>Precio de Venta</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, index) => (
                  <tr key={product.id}>
                    <td>{index + 1}</td>
                    <td>{product.name}</td>
                    <td>{product.warehouseCode}</td>
                    <td>
                      <span className={`badge ${product.stock > 10 ? 'badge-green' : product.stock > 5 ? 'badge-yellow' : 'badge-red'}`}>
                        {product.stock} unidades
                      </span>
                    </td>
                    <td>{formatCurrency(product.lastPurchasePrice)}</td>
                    <td>{formatCurrency(product.sellingPrice)}</td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <Link to={`/products/edit/${product.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Editar
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500"
                          onClick={() => handleDelete(product.id)}
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

export default ProductsList;
