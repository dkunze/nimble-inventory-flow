
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save } from "lucide-react";
import { MOCK_CUSTOMERS, Customer } from "@/utils/types";
import { useToast } from "@/hooks/use-toast";

const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = id !== "new";
  
  const [customer, setCustomer] = useState<Partial<Customer>>({
    name: "",
    address: "",
    phone: "",
    email: ""
  });
  
  useEffect(() => {
    if (isEditing) {
      const foundCustomer = MOCK_CUSTOMERS.find(c => c.id === id);
      if (foundCustomer) {
        setCustomer(foundCustomer);
      }
    }
  }, [id, isEditing]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here we would save to API/database
    // For demo we just simulate success
    
    toast({
      title: isEditing ? "Cliente actualizado" : "Cliente creado",
      description: isEditing
        ? "El cliente ha sido actualizado correctamente."
        : "El cliente ha sido creado correctamente."
    });
    
    navigate("/customers");
  };
  
  return (
    <MainLayout>
      <div className="page-container">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/customers")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Clientes
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Editar Cliente" : "Nuevo Cliente"}
          </h1>
          <p className="text-gray-500">
            {isEditing 
              ? "Modifique la información del cliente existente" 
              : "Complete la información para crear un nuevo cliente"}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="form-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="input-group">
              <label htmlFor="name" className="text-sm font-medium">
                Nombre completo o Razón social *
              </label>
              <Input
                id="name"
                name="name"
                value={customer.name}
                onChange={handleChange}
                required
                placeholder="Ej: Empresa ABC S.A."
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
                value={customer.email}
                onChange={handleChange}
                required
                placeholder="cliente@empresa.com"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="phone" className="text-sm font-medium">
                Teléfono *
              </label>
              <Input
                id="phone"
                name="phone"
                value={customer.phone}
                onChange={handleChange}
                required
                placeholder="Ej: +54 11 1234-5678"
              />
            </div>
            
            <div className="input-group md:col-span-2">
              <label htmlFor="address" className="text-sm font-medium">
                Dirección *
              </label>
              <Input
                id="address"
                name="address"
                value={customer.address}
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
              onClick={() => navigate("/customers")}
            >
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Guardar Cambios" : "Crear Cliente"}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default CustomerForm;
