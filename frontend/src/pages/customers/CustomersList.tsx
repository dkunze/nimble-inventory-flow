
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
  Mail,
  Phone
} from "lucide-react";
import { Link } from "react-router-dom";
import { MOCK_CUSTOMERS } from "@/utils/types";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const CustomersList = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredCustomers = MOCK_CUSTOMERS.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDelete = (id: string) => {
    // Would delete the customer in a real app
    toast({
      title: "Cliente eliminado",
      description: "El cliente ha sido eliminado correctamente.",
    });
  };
  
  return (
    <MainLayout>
      <div className="page-container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Clientes</h1>
            <p className="text-gray-500">Gestione su cartera de clientes</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Link to="/customers/new" className="w-full md:w-auto">
              <Button className="w-full">
                <PlusCircle className="h-4 w-4 mr-2" />
                Nuevo Cliente
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
                  placeholder="Buscar por nombre o email..."
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map(customer => (
            <Card key={customer.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 border-b">
                  <h3 className="font-medium">{customer.name}</h3>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{customer.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{customer.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 flex justify-end items-center gap-2 bg-gray-50">
                  <Link to={`/customers/edit/${customer.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-500"
                    onClick={() => handleDelete(customer.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default CustomersList;
