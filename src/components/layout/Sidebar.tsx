
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Truck, 
  ShoppingCart, 
  BarChart3,
  Settings,
  History
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navigationItems = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Productos", path: "/products", icon: <Package className="w-5 h-5" /> },
    { name: "Clientes", path: "/customers", icon: <Users className="w-5 h-5" /> },
    { name: "Proveedores", path: "/suppliers", icon: <Truck className="w-5 h-5" /> },
    { name: "Compras", path: "/purchases", icon: <ShoppingCart className="w-5 h-5" /> },
    { name: "Ventas", path: "/sales", icon: <BarChart3 className="w-5 h-5" /> },
    { name: "Histórico de Precios", path: "/price-history", icon: <History className="w-5 h-5" /> }
  ];

  return (
    <aside className="bg-white dark:bg-gray-800 w-64 min-h-screen p-4 border-r dark:border-gray-700 hidden md:block fixed left-0 z-20">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Package className="h-6 w-6" />
          <span>StockFlow</span>
        </h2>
      </div>
      
      <ScrollArea className="h-[calc(100vh-160px)]">
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium w-full",
                "hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150",
                isActive(item.path) 
                  ? "bg-primary text-primary-foreground" 
                  : "text-gray-700 dark:text-gray-200"
              )}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
        </nav>
      </ScrollArea>
      
      <div className="absolute bottom-4 left-4 right-4 max-w-[224px]">
        <Link 
          to="/settings" 
          className={cn(
            "flex items-center px-3 py-2 rounded-md text-sm font-medium w-full",
            "hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150",
            isActive("/settings") 
              ? "bg-primary text-primary-foreground" 
              : "text-gray-700 dark:text-gray-200"
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="ml-3">Configuración</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
