
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Products
import ProductsList from "./pages/products/ProductsList";
import ProductForm from "./pages/products/ProductForm";

// Customers
import CustomersList from "./pages/customers/CustomersList";
import CustomerForm from "./pages/customers/CustomerForm";

// Suppliers
import SuppliersList from "./pages/suppliers/SuppliersList";
import SupplierForm from "./pages/suppliers/SupplierForm";

// Purchases
import PurchasesList from "./pages/purchases/PurchasesList";
import PurchaseForm from "./pages/purchases/PurchaseForm";

// Sales
import SalesList from "./pages/sales/SalesList";
import SaleForm from "./pages/sales/SaleForm";

// Settings
import Settings from "./pages/settings/Settings";

// Price History
import PriceHistory from "./pages/price-history/PriceHistory";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Products Routes */}
          <Route path="/products" element={<ProductsList />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/edit/:id" element={<ProductForm />} />
          
          {/* Customers Routes */}
          <Route path="/customers" element={<CustomersList />} />
          <Route path="/customers/new" element={<CustomerForm />} />
          <Route path="/customers/edit/:id" element={<CustomerForm />} />
          
          {/* Suppliers Routes */}
          <Route path="/suppliers" element={<SuppliersList />} />
          <Route path="/suppliers/new" element={<SupplierForm />} />
          <Route path="/suppliers/edit/:id" element={<SupplierForm />} />
          
          {/* Purchases Routes */}
          <Route path="/purchases" element={<PurchasesList />} />
          <Route path="/purchases/new" element={<PurchaseForm />} />
          <Route path="/purchases/edit/:id" element={<PurchaseForm />} />
          
          {/* Sales Routes */}
          <Route path="/sales" element={<SalesList />} />
          <Route path="/sales/new" element={<SaleForm />} />
          <Route path="/sales/edit/:id" element={<SaleForm />} />
          
          {/* Settings Route */}
          <Route path="/settings" element={<Settings />} />
          
          {/* Price History Route */}
          <Route path="/price-history" element={<PriceHistory />} />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
