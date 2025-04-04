
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2,
  Search,
  Package,
  User,
  Edit
} from "lucide-react";
import { 
  SalesOrder, 
  SalesOrderItem,
  Customer,
  Product,
} from "@/utils/types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table";
import { 
  salesService, 
  customerService, 
  productService 
} from "@/services/dataService";

const SaleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = id !== "new";
  
  const [sale, setSale] = useState<Partial<SalesOrder>>({
    customerId: "",
    customerName: "",
    date: new Date(),
    total: 0,
    items: []
  });
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedItemForUpdate, setSelectedItemForUpdate] = useState<SalesOrderItem | null>(null);
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customerSearch, setCustomerSearch] = useState<string>("");
  const [productSearch, setProductSearch] = useState<string>("");
  const [customPrice, setCustomPrice] = useState<number | null>(null);
  
  useEffect(() => {
    // Load customers and products
    setCustomers(customerService.getAll());
    setProducts(productService.getAll());
    
    if (isEditing && id) {
      const foundSale = salesService.getById(id);
      if (foundSale) {
        setSale(foundSale);
      }
    }
  }, [id, isEditing]);
  
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(customerSearch.toLowerCase())
  );
  
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) &&
    product.stock > 0
  );
  
  const handleSelectCustomer = (customer: Customer) => {
    setSale(prev => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.name
    }));
    setCustomerSearch("");
  };
  
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setItemQuantity(1);
    setCustomPrice(product.sellingPrice);
    setProductSearch("");
  };
  
  const handleAddItem = () => {
    if (!selectedProduct || !customPrice) return;
    
    if (selectedItemForUpdate) {
      setSale(prev => {
        const updatedItems = prev.items?.map(item =>
          item.productId === selectedItemForUpdate.productId
            ? {
                ...item,
                quantity: itemQuantity,
                unitPrice: customPrice,
                total: itemQuantity * customPrice
              }
            : item
        ) || [];
        
        // Calculate new total
        const newTotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
        
        return {
          ...prev,
          items: updatedItems,
          total: newTotal
        };
      });
      
      setSelectedItemForUpdate(null);
    } else {
      const existingItemIndex = sale.items?.findIndex(
        item => item.productId === selectedProduct.id
      );
      
      const newItem: SalesOrderItem = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: itemQuantity,
        unitPrice: customPrice,
        total: itemQuantity * customPrice
      };
      
      if (existingItemIndex !== -1 && existingItemIndex !== undefined) {
        setSale(prev => {
          const updatedItems = prev.items?.map((item, i) =>
            i === existingItemIndex
              ? {
                  ...item,
                  quantity: item.quantity + itemQuantity,
                  total: item.total + newItem.total
                }
              : item
          ) || [];
          
          // Calculate new total
          const newTotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
          
          return {
            ...prev,
            items: updatedItems,
            total: newTotal
          };
        });
      } else {
        setSale(prev => {
          const updatedItems = [...(prev.items || []), newItem];
          // Calculate new total
          const newTotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
          
          return {
            ...prev,
            items: updatedItems,
            total: newTotal
          };
        });
      }
    }
    
    setSelectedProduct(null);
    setItemQuantity(1);
    setCustomPrice(null);
  };
  
  const handleEditItem = (item: SalesOrderItem) => {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      setSelectedProduct(product);
      setSelectedItemForUpdate(item);
      setItemQuantity(item.quantity);
      setCustomPrice(item.unitPrice);
    }
  };
  
  const handleRemoveItem = (productId: string) => {
    const itemToRemove = sale.items?.find(item => item.productId === productId);
    
    if (itemToRemove) {
      setSale(prev => {
        const updatedItems = prev.items?.filter(item => item.productId !== productId) || [];
        // Calculate new total
        const newTotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
        
        return {
          ...prev,
          items: updatedItems,
          total: newTotal
        };
      });
    }
    
    if (selectedItemForUpdate?.productId === productId) {
      setSelectedItemForUpdate(null);
      setSelectedProduct(null);
      setItemQuantity(1);
      setCustomPrice(null);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sale.customerId || !sale.items?.length) {
      toast({
        title: "Datos incompletos",
        description: "Por favor complete todos los campos requeridos e incluya al menos un producto.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (isEditing && sale.id) {
        salesService.update(sale as SalesOrder);
        toast({
          title: "Venta actualizada",
          description: "La venta ha sido actualizada correctamente."
        });
      } else {
        salesService.create(sale);
        toast({
          title: "Venta registrada",
          description: "La venta ha sido registrada correctamente."
        });
      }
      
      navigate("/sales");
    } catch (error) {
      console.error("Error saving sale:", error);
      toast({
        title: "Error",
        description: "Ha ocurrido un error al guardar la venta.",
        variant: "destructive"
      });
    }
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
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/sales")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Ventas
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Editar Venta" : "Nueva Venta"}
          </h1>
          <p className="text-gray-500">
            {isEditing 
              ? "Modifique los detalles de la venta" 
              : "Complete la información para registrar una nueva venta"}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-4">Información del Cliente</h2>
              
              <div className="input-group max-w-md">
                <label htmlFor="customer" className="text-sm font-medium">
                  Cliente *
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {sale.customerName ? (
                        sale.customerName
                      ) : (
                        <span className="text-muted-foreground">Seleccione un cliente</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-96" align="start" sideOffset={5}>
                    <div className="p-2">
                      <div className="relative mb-2">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input 
                          placeholder="Buscar cliente..." 
                          className="pl-8"
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredCustomers.length > 0 ? (
                          filteredCustomers.map(customer => (
                            <div
                              key={customer.id}
                              className="flex items-center p-2 cursor-pointer hover:bg-gray-100 rounded-md transition-colors"
                              onClick={() => handleSelectCustomer(customer)}
                            >
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-primary mr-3">
                                <User className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{customer.name}</p>
                                <p className="text-xs text-gray-500">{customer.email}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-2 text-center text-gray-500">
                            No se encontraron clientes
                          </div>
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-4">Productos</h2>
              
              <div className="border rounded-lg p-4 mb-6">
                <h3 className="font-medium mb-4">
                  {selectedItemForUpdate ? "Editar Producto" : "Agregar Producto"}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="input-group md:col-span-2">
                    <label htmlFor="product" className="text-sm font-medium">
                      Producto *
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          {selectedProduct ? (
                            selectedProduct.name
                          ) : (
                            <span className="text-muted-foreground">Seleccione un producto</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0" align="start" sideOffset={5}>
                        <div className="p-2">
                          <div className="relative mb-2">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                            <Input 
                              placeholder="Buscar producto..." 
                              className="pl-8"
                              value={productSearch}
                              onChange={(e) => setProductSearch(e.target.value)}
                            />
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            {filteredProducts.length > 0 ? (
                              filteredProducts.map(product => (
                                <div
                                  key={product.id}
                                  className="flex items-center p-2 cursor-pointer hover:bg-gray-100 rounded-md transition-colors"
                                  onClick={() => handleSelectProduct(product)}
                                >
                                  <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-primary mr-3">
                                    <Package className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{product.name}</p>
                                    <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">{formatCurrency(product.sellingPrice)}</p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-2 text-center text-gray-500">
                                No se encontraron productos
                              </div>
                            )}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="quantity" className="text-sm font-medium">
                      Cantidad *
                    </label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max={selectedProduct?.stock || 1}
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(parseInt(e.target.value))}
                    />
                    {selectedProduct && (
                      <p className="text-xs text-gray-500 mt-1">
                        Disponible: {selectedProduct.stock}
                      </p>
                    )}
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="customPrice" className="text-sm font-medium">
                      Precio unitario *
                    </label>
                    <Input
                      id="customPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={customPrice || ""}
                      onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                      className="bg-white"
                    />
                    {selectedProduct && customPrice !== selectedProduct.sellingPrice && (
                      <p className="text-xs text-orange-500 mt-1">
                        Precio original: {formatCurrency(selectedProduct.sellingPrice)}
                      </p>
                    )}
                  </div>
                  
                  <div className="input-group">
                    <label className="text-sm font-medium">
                      Subtotal
                    </label>
                    <Input
                      value={customPrice && itemQuantity ? formatCurrency(itemQuantity * customPrice) : ""}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={handleAddItem}
                      disabled={!selectedProduct || !customPrice || itemQuantity <= 0}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {selectedItemForUpdate ? "Actualizar" : "Agregar"}
                    </Button>
                  </div>
                </div>
              </div>
              
              {sale.items && sale.items.length > 0 ? (
                <div className="table-container">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Precio Unit.</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="w-[100px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sale.items.map((item) => (
                        <TableRow key={item.productId}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell>{formatCurrency(item.total)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditItem(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500"
                                onClick={() => handleRemoveItem(item.productId)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed rounded-md bg-gray-50">
                  <p className="text-gray-500">No hay productos agregados</p>
                </div>
              )}
              
              <div className="mt-6 border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-full md:w-1/3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(sale.total || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/sales")}
            >
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Guardar Cambios" : "Finalizar Venta"}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default SaleForm;
