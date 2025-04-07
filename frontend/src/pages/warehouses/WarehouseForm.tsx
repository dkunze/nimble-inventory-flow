
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save } from "lucide-react";
import { Warehouse } from "@/utils/types";
import { useToast } from "@/hooks/use-toast";
import { warehouseService } from "@/services/dataService";

const WarehouseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = id !== "new";
  
  const [warehouse, setWarehouse] = useState<Partial<Warehouse>>({
    name: "",
    code: ""
  });
  
  useEffect(() => {
    if (isEditing && id) {
      const foundWarehouse = warehouseService.getById(id);
      if (foundWarehouse) {
        setWarehouse(foundWarehouse);
      }
    }
  }, [id, isEditing]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWarehouse(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && warehouse.id) {
        warehouseService.update(warehouse as Warehouse);
      } else {
        warehouseService.create(warehouse);
      }
      
      toast({
        title: isEditing ? "Depósito actualizado" : "Depósito creado",
        description: isEditing
          ? "El depósito ha sido actualizado correctamente."
          : "El depósito ha sido creado correctamente."
      });
      
      navigate("/warehouses");
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error al guardar el depósito.",
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
            onClick={() => navigate("/warehouses")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Depósitos
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Editar Depósito" : "Nuevo Depósito"}
          </h1>
          <p className="text-gray-500">
            {isEditing 
              ? "Modifique la información del depósito existente" 
              : "Complete la información para crear un nuevo depósito"}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="form-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="input-group">
              <label htmlFor="name" className="text-sm font-medium">
                Nombre del Depósito *
              </label>
              <Input
                id="name"
                name="name"
                value={warehouse.name}
                onChange={handleChange}
                required
                placeholder="Ej: Depósito Principal"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="code" className="text-sm font-medium">
                Código *
              </label>
              <Input
                id="code"
                name="code"
                value={warehouse.code}
                onChange={handleChange}
                required
                placeholder="Ej: DP001"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/warehouses")}
            >
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Guardar Cambios" : "Crear Depósito"}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default WarehouseForm;
