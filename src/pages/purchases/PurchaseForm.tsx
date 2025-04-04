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
  Edit,
  Calculator,
  History
} from "lucide-react";
import { 
  PurchaseOrder, 
  PurchaseOrderItem,
  Supplier,
  Product,
  PriceHistory,
  generateMockId
} from "@/utils/types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  purchaseService, 
  supplierService, 
  productService,
  priceHistoryService 
} from "@/services/dataService";

const PurchaseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = id !== "new";
  
  const [purchase, setPurchase] = useState<Partial<PurchaseOrder>>({
    supplierId: "",
    supplierName: "",
    date: new Date(),
    status: "ORDERED",
    total: 0,
    shippingCost: 0,
    additionalFees: 0,
    discount: 0,
    items: []
  });
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedItemForUpdate, setSelectedItemForUpdate] = useState<PurchaseOrderItem | null>(null);
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemPrice, setItemPrice] = useState<number>(0);
  const [newProductName, setNewProductName] = useState<string>("");
  const [isNewProduct, setIsNewProduct] = useState<boolean>(false);
  const [productSearchTerm, setProductSearchTerm] = useState<string>("");
  const [showPriceHistory, setShowPriceHistory] = useState<boolean>(false);
  const [selectedProductForHistory, setSelectedProductForHistory] = useState<string>("");
  const [priceHistoryData, setPriceHistoryData] = useState<PriceHistory[]>([]);
  
  useEffect(() => {
    setSuppliers(supplierService.getAll());
    setProducts(productService.getAll());
    
    if (isEditing && id) {
      const foundPurchase = purchaseService.getById(id);
      if (foundPurchase) {
        setPurchase(foundPurchase);
      }
    }
  }, [id, isEditing]);
  
  const handleSupplierChange = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (supplier) {
      setPurchase(prev => ({
        ...prev,
        supplierId: supplier.id,
        supplierName: supplier.name
      }));
    }
  };

  const calculateProratedCosts = () => {
    if (!purchase.items || purchase.items.length === 0) {
      toast({
        title: "No hay artículos",
        description: "Debe agregar artículos antes de prorratear costos",
        variant: "destructive"
      });
      return;
    }

    const additionalCostsTotal = (purchase.shippingCost || 0) + 
                                (purchase.additionalFees || 0) -
                                (purchase.discount || 0);
    
    if (additionalCostsTotal === 0) {
      toast({
        title: "Sin costos adicionales",
        description: "No hay costos adicionales para prorratear",
      });
      return;
    }
    
    const subtotal = purchase.items.reduce((acc, item) => acc + item.total, 0);
    
    const updatedItems = purchase.items.map(item => {
      const itemPercentage = item.total / subtotal;
      const proratedAmount = additionalCostsTotal * itemPercentage;
      const proratedUnitCost = proratedAmount / item.quantity;
      const totalProratedCost = item.unitPrice + proratedUnitCost;
      const suggestedSellingPrice = Math.round(totalProratedCost * 1.4);
      
      return {
        ...item,
        proratedUnitCost: totalProratedCost,
        suggestedSellingPrice
      };
    });
    
    setPurchase(prev => ({
      ...prev,
      items: updatedItems
    }));
    
    toast({
      title: "Costos prorrateados",
      description: "Los costos adicionales han sido prorrateados entre los artículos"
    });
  };
  
  const handleStatusChange = (status: "ORDERED" | "DELIVERED") => {
    setPurchase(prev => ({ ...prev, status }));
    
    if (status === "DELIVERED" && purchase.items) {
      toast({
        title: "Stock actualizado",
        description: "Los artículos han sido agregados al inventario"
      });
      
      const priceHistoryEntries: PriceHistory[] = [];
      purchase.items.forEach(item => {
        const historyEntry: PriceHistory = {
          id: generateMockId(),
          productId: item.productId,
          price: item.proratedUnitCost || item.unitPrice,
          date: new Date(),
          type: 'purchase',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        priceHistoryEntries.push(historyEntry);
      });
      
      console.log("Price history entries created:", priceHistoryEntries);
    }
  };
  
  const loadPriceHistory = (productId: string) => {
    setSelectedProductForHistory(productId);
    
    const historyData = priceHistoryService.getByProductId(productId);
    setPriceHistoryData(historyData);
    setShowPriceHistory(true);
  };
  
  const handleAddItem = () => {
    if (selectedItemForUpdate) {
      setPurchase(prev => ({
        ...prev,
        items: prev.items?.map(item =>
          item.productId === selectedItemForUpdate.productId
            ? {
                ...item,
                quantity: itemQuantity,
                unitPrice: itemPrice,
                total: itemQuantity * itemPrice
              }
            : item
        ) || []
      }));
      
      setSelectedItemForUpdate(null);
    } else {
      if (isNewProduct) {
        const newProductId = generateMockId();
        
        const newItem: PurchaseOrderItem = {
          productId: newProductId,
          productName: newProductName,
          quantity: itemQuantity,
          unitPrice: itemPrice,
          total: itemQuantity * itemPrice,
          isNewProduct: true
        };
        
        setPurchase(prev => ({
          ...prev,
          items: [...(prev.items || []), newItem],
          total: (prev.total || 0) + newItem.total
        }));
        
        setNewProductName("");
      } else {
        const selectedProduct = products.find(p => p.id === productSearchTerm);
        
        if (selectedProduct) {
          const newItem: PurchaseOrderItem = {
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            quantity: itemQuantity,
            unitPrice: itemPrice || selectedProduct.lastPurchasePrice,
            total: itemQuantity * (itemPrice || selectedProduct.lastPurchasePrice)
          };
          
          const existingItemIndex = purchase.items?.findIndex(
            item => item.productId === selectedProduct.id
          );
          
          if (existingItemIndex !== -1 && existingItemIndex !== undefined) {
            setPurchase(prev => ({
              ...prev,
              items: prev.items?.map((item, i) =>
                i === existingItemIndex
                  ? {
                      ...item,
                      quantity: item.quantity + itemQuantity,
                      total: item.total + newItem.total
                    }
                  : item
              ) || [],
              total: (prev.total || 0) + newItem.total
            }));
          } else {
            setPurchase(prev => ({
              ...prev,
              items: [...(prev.items || []), newItem],
              total: (prev.total || 0) + newItem.total
            }));
          }
        }
      }
    }
    
    setProductSearchTerm("");
    setItemQuantity(1);
    setItemPrice(0);
    setIsNewProduct(false);
  };
  
  const handleEditItem = (item: PurchaseOrderItem) => {
    setSelectedItemForUpdate(item);
    setItemQuantity(item.quantity);
    setItemPrice(item.unitPrice);
    
    if (item.isNewProduct) {
      setIsNewProduct(true);
      setNewProductName(item.productName);
    } else {
      setProductSearchTerm(item.productId);
      setIsNewProduct(false);
    }
  };
  
  const handleRemoveItem = (productId: string) => {
    const itemToRemove = purchase.items?.find(item => item.productId === productId);
    
    if (itemToRemove) {
      setPurchase(prev => ({
        ...prev,
        items: prev.items?.filter(item => item.productId !== productId) || [],
        total: (prev.total || 0) - itemToRemove.total
      }));
    }
    
    if (selectedItemForUpdate?.productId === productId) {
      setSelectedItemForUpdate(null);
      setProductSearchTerm("");
      setItemQuantity(1);
      setItemPrice(0);
      setIsNewProduct(false);
    }
  };
  
  const updateTotals = () => {
    const itemsSubtotal = purchase.items?.reduce((sum, item) => sum + item.total, 0) || 0;
    
    const total = itemsSubtotal +
      (purchase.shippingCost || 0) +
      (purchase.additionalFees || 0) -
      (purchase.discount || 0);
    
    setPurchase(prev => ({
      ...prev,
      total
    }));
  };
  
  useEffect(() => {
    if (purchase.items && purchase.items.length > 0) {
      updateTotals();
    }
  }, [purchase.shippingCost, purchase.additionalFees, purchase.discount]);
  
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.warehouseCode.toLowerCase().includes(productSearchTerm.toLowerCase())
  );
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!purchase.supplierId || !purchase.items?.length) {
      toast({
        title: "Datos incompletos",
        description: "Por favor complete todos los campos requeridos e incluya al menos un producto.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (isEditing && purchase.id) {
        purchaseService.update(purchase as PurchaseOrder);
      } else {
        purchaseService.create(purchase);
      }
      
      toast({
        title: isEditing ? "Compra actualizada" : "Compra creada",
        description: isEditing
          ? "La orden de compra ha sido actualizada correctamente."
          : "La orden de compra ha sido creada correctamente."
      });
      
      navigate("/purchases");
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error al guardar la compra.",
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
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR').format(new Date(date));
  };
  
  return (
    <MainLayout>
      <div className="page-container">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/purchases")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Compras
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Editar Orden de Compra" : "Nueva Orden de Compra"}
          </h1>
          <p className="text-gray-500">
            {isEditing 
              ? "Modifique los detalles de la compra" 
              : "Complete la información para registrar una nueva compra"}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-4">Información General</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="input-group">
                  <label htmlFor="supplier" className="text-sm font-medium">
                    Proveedor *
                  </label>
                  <Select 
                    value={purchase.supplierId} 
                    onValueChange={handleSupplierChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="input-group">
                  <label htmlFor="status" className="text-sm font-medium">
                    Estado *
                  </label>
                  <Select 
                    value={purchase.status} 
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ORDERED">Pedido</SelectItem>
                      <SelectItem value="DELIVERED">Entregado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-4">Costos adicionales</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="input-group">
                  <label htmlFor="shippingCost" className="text-sm font-medium">
                    Costo de envío
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <Input
                      id="shippingCost"
                      type="number"
                      min="0"
                      step="0.01"
                      className="pl-7"
                      value={purchase.shippingCost || ""}
                      onChange={(e) => {
                        setPurchase(prev => ({
                          ...prev,
                          shippingCost: parseFloat(e.target.value) || 0
                        }));
                      }}
                    />
                  </div>
                </div>
                
                <div className="input-group">
                  <label htmlFor="additionalFees" className="text-sm font-medium">
                    Recargos
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <Input
                      id="additionalFees"
                      type="number"
                      min="0"
                      step="0.01"
                      className="pl-7"
                      value={purchase.additionalFees || ""}
                      onChange={(e) => {
                        setPurchase(prev => ({
                          ...prev,
                          additionalFees: parseFloat(e.target.value) || 0
                        }));
                      }}
                    />
                  </div>
                </div>
                
                <div className="input-group">
                  <label htmlFor="discount" className="text-sm font-medium">
                    Descuento
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      step="0.01"
                      className="pl-7"
                      value={purchase.discount || ""}
                      onChange={(e) => {
                        setPurchase(prev => ({
                          ...prev,
                          discount: parseFloat(e.target.value) || 0
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={calculateProratedCosts}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Prorratear costos
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-4">Productos</h2>
              
              <div className="border rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">
                    {selectedItemForUpdate ? "Editar Producto" : "Agregar Producto"}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="is-new-product">Producto nuevo</Label>
                    <Switch
                      id="is-new-product"
                      checked={isNewProduct}
                      onCheckedChange={setIsNewProduct}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {isNewProduct ? (
                    <div className="input-group md:col-span-2">
                      <label htmlFor="new-product-name" className="text-sm font-medium">
                        Nombre del nuevo producto *
                      </label>
                      <Input
                        id="new-product-name"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                        placeholder="Ej: Monitor Samsung 24"
                      />
                    </div>
                  ) : (
                    <div className="input-group md:col-span-2">
                      <label htmlFor="product" className="text-sm font-medium">
                        Producto *
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            {productSearchTerm ? (
                              products.find(p => p.id === productSearchTerm)?.name || "Seleccione un producto"
                            ) : (
                              <span className="text-muted-foreground">Seleccione un producto</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" align="start">
                          <div className="p-2">
                            <div className="relative mb-2">
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                              <Input 
                                placeholder="Buscar producto..." 
                                className="pl-8"
                                value={productSearchTerm}
                                onChange={(e) => setProductSearchTerm(e.target.value)}
                              />
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                              {filteredProducts.length > 0 ? (
                                filteredProducts.map(product => (
                                  <div
                                    key={product.id}
                                    className="flex items-center p-2 cursor-pointer hover:bg-gray-100 rounded-md transition-colors"
                                    onClick={() => {
                                      setProductSearchTerm(product.id);
                                      setItemPrice(product.lastPurchasePrice);
                                    }}
                                  >
                                    <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-primary mr-3">
                                      <Package className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">{product.name}</p>
                                      <p className="text-xs text-gray-500">Código: {product.warehouseCode}</p>
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
                  )}
                  
                  <div className="input-group">
                    <label htmlFor="quantity" className="text-sm font-medium">
                      Cantidad *
                    </label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="price" className="text-sm font-medium">
                      Precio unitario *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        className="pl-7"
                        value={itemPrice}
                        onChange={(e) => setItemPrice(parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="input-group md:col-span-2">
                    <label className="text-sm font-medium">
                      Subtotal
                    </label>
                    <Input
                      value={formatCurrency(itemQuantity * itemPrice)}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={handleAddItem}
                      disabled={
                        (isNewProduct && !newProductName) || 
                        (!isNewProduct && !productSearchTerm) || 
                        itemQuantity <= 0 ||
                        itemPrice <= 0
                      }
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {selectedItemForUpdate ? "Actualizar" : "Agregar"}
                    </Button>
                  </div>
                </div>
              </div>
              
              {purchase.items && purchase.items.length > 0 ? (
                <div className="table-container">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Precio Unit.</TableHead>
                        <TableHead>Costo Prorrat.</TableHead>
                        <TableHead>P. Venta Sug.</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchase.items.map((item) => (
                        <TableRow key={item.productId}>
                          <TableCell className="flex items-center gap-2">
                            {item.productName}
                            {item.isNewProduct && (
                              <Badge variant="outline">Nuevo</Badge>
                            )}
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell>
                            {item.proratedUnitCost 
                              ? formatCurrency(item.proratedUnitCost)
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {item.suggestedSellingPrice 
                              ? formatCurrency(item.suggestedSellingPrice)
                              : "-"}
                          </TableCell>
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
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-blue-500"
                                onClick={() => loadPriceHistory(item.productId)}
                              >
                                <History className="h-4 w-4" />
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
            </CardContent>
          </Card>
          
          <div className="border-t pt-4 mt-6">
            <div className="flex justify-end">
              <div className="w-full md:w-1/3 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Subtotal:</span>
                  <span>
                    {formatCurrency(
                      purchase.items?.reduce((sum, item) => sum + item.total, 0) || 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Envío:</span>
                  <span>{formatCurrency(purchase.shippingCost || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Recargos:</span>
                  <span>{formatCurrency(purchase.additionalFees || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Descuento:</span>
                  <span>-{formatCurrency(purchase.discount || 0)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(purchase.total || 0)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="sticky bottom-0 bg-white border-t p-4 shadow-lg flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/purchases")}
            >
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Guardar Cambios" : "Crear Compra"}
            </Button>
          </div>
        </form>
      </div>
      
      <Dialog open={showPriceHistory} onOpenChange={setShowPriceHistory}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Historial de Precios</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <h3 className="font-medium mb-4">
              {products.find(p => p.id === selectedProductForHistory)?.name}
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Precio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceHistoryData.length > 0 ? (
                  priceHistoryData.map(history => (
                    <TableRow key={history.id}>
                      <TableCell>{formatDate(history.date)}</TableCell>
                      <TableCell>{formatCurrency(history.price)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center">
                      No hay datos históricos
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default PurchaseForm;
