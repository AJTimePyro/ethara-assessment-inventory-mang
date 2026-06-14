"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Package,
  Users,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ErrorState } from "@/components/error-state";
import { dashboardService } from "@/services/dashboard_service";

const statCards = [
  {
    key: "total_products" as const,
    label: "Total Products",
    icon: Package,
    iconClass: "stat-icon-indigo",
    valueClass: "text-indigo-600",
  },
  {
    key: "total_customers" as const,
    label: "Total Customers",
    icon: Users,
    iconClass: "stat-icon-emerald",
    valueClass: "text-emerald-600",
  },
  {
    key: "total_orders" as const,
    label: "Total Orders",
    icon: ShoppingCart,
    iconClass: "stat-icon-amber",
    valueClass: "text-amber-600",
  },
  {
    key: "low_stock_count" as const,
    label: "Low Stock",
    icon: AlertTriangle,
    iconClass: "stat-icon-red",
    valueClass: "text-red-600",
  },
] as const;

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
        <Skeleton className="mt-2 h-3 w-24" />
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardService.getSummary,
    retry: false,
  });

  if (isError) {
    return (
      <ErrorState
        className="p-6 pt-24 gap-3"
        iconClassName="h-10 w-10"
        title="Unable to reach the server"
        description="Make sure the backend is running and try again."
      />
    );
  }

  return (
    <div className="page-container">
      {/* Page header */}
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Overview of your inventory, customers, and orders.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : statCards.map(
              ({ key, label, icon: Icon, iconClass, valueClass }) => (
                <Card
                  key={key}
                  className="hover:shadow-md transition-shadow duration-200"
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {label}
                    </CardTitle>
                    <div className={iconClass}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-3xl font-bold ${valueClass}`}>
                      {data![key]}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      <span>All time</span>
                    </p>
                  </CardContent>
                </Card>
              ),
            )}
      </div>

      {/* Low stock products table */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-semibold">Low Stock Products</h2>
          {data && (
            <Badge variant="warning">
              threshold ≤ {data.low_stock_threshold}
            </Badge>
          )}
        </div>

        <div className="table-container">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data!.low_stock_products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-10 text-muted-foreground text-sm"
                  >
                    ✓ All products are well stocked.
                  </TableCell>
                </TableRow>
              ) : (
                data!.low_stock_products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs text-slate-500">
                      {p.sku_code}
                    </TableCell>
                    <TableCell className="font-medium">
                      {p.product_name}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={p.quantity === 0 ? "destructive" : "warning"}
                      >
                        {p.quantity === 0 ? "Out of stock" : p.quantity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-700">
                      ${p.price}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
