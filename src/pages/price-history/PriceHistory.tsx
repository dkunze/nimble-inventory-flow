
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { PriceHistory as PriceHistoryType, MOCK_PRODUCTS } from "@/utils/types";

const PriceHistory = () => {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  
  // Mock price history data - In a real application, you'd fetch this from an API
  const mockPriceHistory: PriceHistoryType[] = [
    {
      id: "price1",
      productId: MOCK_PRODUCTS[0].id,
      price: 500,
      date: new Date(2023, 11, 15),
      type: 'purchase',
      createdAt: new Date(2023, 11, 15),
      updatedAt: new Date(2023, 11, 15)
    },
    {
      id: "price2",
      productId: MOCK_PRODUCTS[0].id,
      price: 520,
      date: new Date(2024, 0, 20),
      type: 'purchase',
      createdAt: new Date(2024, 0, 20),
      updatedAt: new Date(2024, 0, 20)
    },
    {
      id: "price3",
      productId: MOCK_PRODUCTS[1].id,
      price: 120,
      date: new Date(2024, 1, 5),
      type: 'purchase',
      createdAt: new Date(2024, 1, 5),
      updatedAt: new Date(2024, 1, 5)
    }
  ];
  
  const filteredHistory = selectedProductId 
    ? mockPriceHistory.filter(item => item.productId === selectedProductId) 
    : mockPriceHistory;
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <MainLayout>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Histórico de Precios de Costo</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full sm:w-80">
              <Select 
                value={selectedProductId} 
                onValueChange={setSelectedProductId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar Producto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los productos</SelectItem>
                  {MOCK_PRODUCTS.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Historial de Precios</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item) => {
                    const product = MOCK_PRODUCTS.find(p => p.id === item.productId);
                    return (
                      <TableRow key={item.id}>
                        <TableCell>{product?.name || 'Producto no encontrado'}</TableCell>
                        <TableCell>{formatDate(item.date)}</TableCell>
                        <TableCell>
                          {item.type === 'purchase' ? 'Compra' : 'Venta'}
                        </TableCell>
                        <TableCell className="text-right">
                          ${item.price.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No hay datos de precios disponibles
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default PriceHistory;
