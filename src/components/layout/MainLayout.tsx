
import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {isMobile ? (
        <div className="sticky top-0 z-10">
          <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-4 h-16 border-b dark:border-gray-700">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <Sidebar />
              </SheetContent>
            </Sheet>
            
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">StockFlow</h1>
            
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
              A
            </div>
          </div>
        </div>
      ) : (
        <Header />
      )}

      <div className="flex flex-1">
        {!isMobile && <div className="w-64 flex-shrink-0">
          {/* This is just a placeholder for the fixed sidebar's width */}
        </div>}
        
        <main className={`flex-1 bg-gray-50 dark:bg-gray-900 ${!isMobile ? "ml-64 pt-16" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
