
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { Product, Warehouse, Category } from "@/utils/types";
import { useToast } from "@/hooks/use-toast";
import { 
  productService, 
  warehouseService, 
  categoryService 
} from "@/services/dataService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = id !== "new";
  
  const [product, setProduct] = useState<Partial<Product>>({
    name: "",
    description: "",
    warehouseId: "",
    categoryId: "",
    lastPurchasePrice: 0,
    sellingPrice: 0,
    stock: 0
  });
  
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  useEffect(() => {
    // Load warehouses and categories
    setWarehouses(warehouseService.getAll());
    setCategories(categoryService.getAll());
    
    if (isEditing && id) {
      const foundProduct = productService.getById(id);
      if (foundProduct) {
        setProduct(foundProduct);
      }
    }
  }, [id, isEditing]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle number fields
    if (["lastPurchasePrice", "sellingPrice", "stock"].includes(name)) {
      const numValue = parseFloat(value) || 0;
      setProduct(prev => ({ ...prev, [name]: numValue }));
    } else {
      setProduct(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setProduct(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRecalculatePrice = () => {
    if (product.lastPurchasePrice) {
      const suggestedPrice = product.lastPurchasePrice * 1.4;
      setProduct(prev => ({ ...prev, sellingPrice: parseFloat(suggestedPrice.toFixed(2)) }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && product.id) {
        productService.update(product as Product);
      } else {
        productService.create(product);
      }
      
      toast({
        title: isEditing ? "Producto actualizado" : "Producto creado",
        description: isEditing
          ? "El producto ha sido actualizado correctamente."
          : "El producto ha sido creado correctamente."
      });
      
      navigate("/products");
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error al guardar el producto.",
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
            onClick={() => navigate("/products")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Productos
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Editar Producto" : "Nuevo Producto"}
          </h1>
          <p className="text-gray-500">
            {isEditing 
              ? "Modifique la información del producto existente" 
              : "Complete la información para crear un nuevo producto"}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="form-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="input-group">
              <label htmlFor="name" className="text-sm font-medium">
                Nombre del Producto *
              </label>
              <Input
                id="name"
                name="name"
                value={product.name}
                onChange={handleChange}
                required
                placeholder="Ej: Laptop HP ProBook"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="categoryId" className="text-sm font-medium">
                Categoría
              </label>
              <Select
                value={product.categoryId || ""}
                onValueChange={(value) => handleSelectChange("categoryId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin categoría</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="input-group md:col-span-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descripción
              </label>
              <Textarea
                id="description"
                name="description"
                value={product.description}
                onChange={handleChange}
                placeholder="Descripción detallada del producto"
                rows={3}
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="warehouseId" className="text-sm font-medium">
                Depósito
              </label>
              <Select
                value={product.warehouseId || ""}
                onValueChange={(value) => handleSelectChange("warehouseId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un depósito" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin depósito</SelectItem>
                  {warehouses.map(warehouse => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} ({warehouse.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="input-group">
              <label htmlFor="lastPurchasePrice" className="text-sm font-medium">
                Último Precio de Compra *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  id="lastPurchasePrice"
                  name="lastPurchasePrice"
                  type="number"
                  value={product.lastPurchasePrice}
                  onChange={handleChange}
                  required
                  className="pl-7"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="input-group">
              <label htmlFor="sellingPrice" className="text-sm font-medium flex justify-between">
                <span>Precio de Venta *</span>
                <Button 
                  type="button" 
                  variant="link" 
                  className="h-auto p-0 text-xs"
                  onClick={handleRecalculatePrice}
                >
                  Calcular (+40%)
                </Button>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  id="sellingPrice"
                  name="sellingPrice"
                  type="number"
                  value={product.sellingPrice}
                  onChange={handleChange}
                  required
                  className="pl-7"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            {isEditing && (
              <div className="input-group">
                <label htmlFor="stock" className="text-sm font-medium">
                  Stock Actual *
                </label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  value={product.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1"
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/products")}
            >
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Guardar Cambios" : "Crear Producto"}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default ProductForm;
