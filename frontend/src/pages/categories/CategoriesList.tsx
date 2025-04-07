
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
import { Category } from "@/utils/types";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { categoryService } from "@/services/dataService";

const CategoriesList = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  
  useEffect(() => {
    // Load categories when component mounts
    setCategories(categoryService.getAll());
  }, []);
  
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDelete = (id: string) => {
    try {
      categoryService.delete(id);
      setCategories(categories.filter(category => category.id !== id));
      
      toast({
        title: "Categoría eliminada",
        description: "La categoría ha sido eliminada correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error al eliminar la categoría.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <MainLayout>
      <div className="page-container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Categorías</h1>
            <p className="text-gray-500">Gestione sus categorías de productos</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Link to="/categories/new" className="w-full md:w-auto">
              <Button className="w-full">
                <PlusCircle className="h-4 w-4 mr-2" />
                Nueva Categoría
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
                  placeholder="Buscar por nombre..."
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
            {filteredCategories.map(category => (
              <Card key={category.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 flex justify-between items-start border-b">
                    <div>
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.description}</p>
                    </div>
                  </div>
                  <div className="px-4 py-3 flex justify-between items-center bg-gray-50">
                    <div className="flex gap-2">
                      <Link to={`/categories/edit/${category.id}`}>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="text-red-500" 
                        onClick={() => handleDelete(category.id)}
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
                  <th>Descripción</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category, index) => (
                  <tr key={category.id}>
                    <td>{index + 1}</td>
                    <td>{category.name}</td>
                    <td>{category.description}</td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <Link to={`/categories/edit/${category.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Editar
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500"
                          onClick={() => handleDelete(category.id)}
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

export default CategoriesList;
