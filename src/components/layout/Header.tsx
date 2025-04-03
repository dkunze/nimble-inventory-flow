
import { Bell, Moon, Search, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/theme/theme-provider";

const Header = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <header className="bg-white dark:bg-gray-800 h-16 border-b dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex-1">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Sistema de Gestión de Inventario</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="w-64 pl-8 rounded-md"
          />
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
            3
          </span>
        </Button>
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
            A
          </div>
          <span className="font-medium text-sm hidden md:block">Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
