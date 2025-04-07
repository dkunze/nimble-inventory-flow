
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save } from "lucide-react";
import { Supplier } from "@/utils/types";
import { useToast } from "@/hooks/use-toast";
import { supplierService } from "@/services/dataService";

const SupplierForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = id !== "new";
  
  const [supplier, setSupplier] = useState<Partial<Supplier>>({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: ""
  });
  
  useEffect(() => {
    if (isEditing && id) {
      const foundSupplier = supplierService.getById(id);
      if (foundSupplier) {
        setSupplier(foundSupplier);
      }
    }
  }, [id, isEditing]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSupplier(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && supplier.id) {
        supplierService.update(supplier as Supplier);
      } else {
        supplierService.create(supplier);
      }
      
      toast({
        title: isEditing ? "Proveedor actualizado" : "Proveedor creado",
        description: isEditing
          ? "El proveedor ha sido actualizado correctamente."
          : "El proveedor ha sido creado correctamente."
      });
      
      navigate("/suppliers");
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error al guardar el proveedor.",
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
            onClick={() => navigate("/suppliers")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Proveedores
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Editar Proveedor" : "Nuevo Proveedor"}
          </h1>
          <p className="text-gray-500">
            {isEditing 
              ? "Modifique la información del proveedor existente" 
              : "Complete la información para crear un nuevo proveedor"}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="form-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="input-group">
              <label htmlFor="name" className="text-sm font-medium">
                Nombre o Razón social *
              </label>
              <Input
                id="name"
                name="name"
                value={supplier.name}
                onChange={handleChange}
                required
                placeholder="Ej: Distribuidora Tech"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="email" className="text-sm font-medium">
                Email *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={supplier.email}
                onChange={handleChange}
                required
                placeholder="contacto@proveedor.com"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="phone" className="text-sm font-medium">
                Teléfono *
              </label>
              <Input
                id="phone"
                name="phone"
                value={supplier.phone}
                onChange={handleChange}
                required
                placeholder="Ej: +54 11 1234-5678"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="website" className="text-sm font-medium">
                Sitio Web
              </label>
              <Input
                id="website"
                name="website"
                value={supplier.website}
                onChange={handleChange}
                placeholder="Ej: www.proveedor.com"
              />
            </div>
            
            <div className="input-group md:col-span-2">
              <label htmlFor="address" className="text-sm font-medium">
                Dirección *
              </label>
              <Input
                id="address"
                name="address"
                value={supplier.address}
                onChange={handleChange}
                required
                placeholder="Calle, número, ciudad, provincia"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/suppliers")}
            >
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Guardar Cambios" : "Crear Proveedor"}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default SupplierForm;
