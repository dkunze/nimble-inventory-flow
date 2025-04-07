
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { Category } from "@/utils/types";
import { useToast } from "@/hooks/use-toast";
import { categoryService } from "@/services/dataService";

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = id !== "new";
  
  const [category, setCategory] = useState<Partial<Category>>({
    name: "",
    description: ""
  });
  
  useEffect(() => {
    if (isEditing && id) {
      const foundCategory = categoryService.getById(id);
      if (foundCategory) {
        setCategory(foundCategory);
      }
    }
  }, [id, isEditing]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCategory(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && category.id) {
        categoryService.update(category as Category);
      } else {
        categoryService.create(category);
      }
      
      toast({
        title: isEditing ? "Categoría actualizada" : "Categoría creada",
        description: isEditing
          ? "La categoría ha sido actualizada correctamente."
          : "La categoría ha sido creada correctamente."
      });
      
      navigate("/categories");
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error al guardar la categoría.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <MainLayout>
      <div className="page-container">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/categories")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Categorías
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Editar Categoría" : "Nueva Categoría"}
          </h1>
          <p className="text-gray-500">
            {isEditing 
              ? "Modifique la información de la categoría existente" 
              : "Complete la información para crear una nueva categoría"}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="form-container">
          <div className="grid grid-cols-1 gap-6 mb-6">
            <div className="input-group">
              <label htmlFor="name" className="text-sm font-medium">
                Nombre de la Categoría *
              </label>
              <Input
                id="name"
                name="name"
                value={category.name}
                onChange={handleChange}
                required
                placeholder="Ej: Electrónicos"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="description" className="text-sm font-medium">
                Descripción
              </label>
              <Textarea
                id="description"
                name="description"
                value={category.description}
                onChange={handleChange}
                placeholder="Descripción detallada de la categoría"
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/categories")}
            >
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Guardar Cambios" : "Crear Categoría"}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default CategoryForm;
