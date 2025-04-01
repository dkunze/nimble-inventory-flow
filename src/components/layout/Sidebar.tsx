
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Truck, 
  ShoppingCart, 
  BarChart3,
  Settings
} from "lucide-react";

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
    { name: "Ventas", path: "/sales", icon: <BarChart3 className="w-5 h-5" /> }
  ];

  return (
    <aside className="bg-white w-64 min-h-screen p-4 border-r hidden md:block">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Package className="h-6 w-6" />
          <span>StockFlow</span>
        </h2>
      </div>
      
      <nav className="space-y-1">
        {navigationItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn("sidebar-link", isActive(item.path) && "active")}
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      
      <div className="absolute bottom-4 left-4 right-4">
        <Link to="/settings" className="sidebar-link">
          <Settings className="w-5 h-5" />
          <span>Configuración</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
