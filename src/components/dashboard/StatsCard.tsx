
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

const StatsCard = ({
  title,
  value,
  icon,
  trend,
  className
}: StatsCardProps) => {
  return (
    <div className={cn("data-card flex justify-between", className)}>
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-semibold mt-1">{value}</p>
        
        {trend && (
          <div className="flex items-center mt-2">
            <span
              className={cn(
                "text-xs font-medium",
                trend.positive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.positive ? "+" : "-"}{trend.value}%
            </span>
            <span className="text-xs text-gray-500 ml-1">vs mes anterior</span>
          </div>
        )}
      </div>
      
      <div className="h-12 w-12 rounded-lg bg-primary bg-opacity-10 flex items-center justify-center text-primary">
        {icon}
      </div>
    </div>
  );
};

export default StatsCard;
