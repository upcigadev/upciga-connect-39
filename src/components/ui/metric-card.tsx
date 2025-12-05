import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  details?: { label: string; value: number }[];
  className?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  details,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-card p-6 shadow-card transition-all duration-200 hover:shadow-elevated animate-fade-in",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold text-card-foreground">{value}</p>
          {trend && (
            <p
              className={cn(
                "mt-1 text-sm font-medium",
                trend.positive ? "text-success" : "text-destructive"
              )}
            >
              {trend.positive ? "+" : "-"}{trend.value}% vs mês anterior
            </p>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
      {details && details.length > 0 && (
        <div className="mt-4 border-t border-border pt-4">
          <div className="space-y-2">
            {details.map((detail) => (
              <div key={detail.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{detail.label}</span>
                <span className="font-medium text-card-foreground">{detail.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
