"use client";

import { useQuery } from "@tanstack/react-query";
import { Package, Users, ShoppingCart, AlertTriangle } from "lucide-react";
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
  },
  {
    key: "total_customers" as const,
    label: "Total Customers",
    icon: Users,
  },
  {
    key: "total_orders" as const,
    label: "Total Orders",
    icon: ShoppingCart,
  },
  {
    key: "low_stock_count" as const,
    label: "Low Stock",
    icon: AlertTriangle,
  },
] as const;

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
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
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : statCards.map(({ key, label, icon: Icon }) => (
              <Card key={key}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {label}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{data![key]}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Low stock products table */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Low Stock Products</h2>
          {data && (
            <Badge variant="secondary">
              threshold ≤ {data.low_stock_threshold}
            </Badge>
          )}
        </div>

        <div className="rounded-md border w-full">
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
                    className="text-center py-8 text-muted-foreground"
                  >
                    All products are well stocked.
                  </TableCell>
                </TableRow>
              ) : (
                data!.low_stock_products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-sm">
                      {p.sku_code}
                    </TableCell>
                    <TableCell>{p.product_name}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={p.quantity === 0 ? "destructive" : "secondary"}
                      >
                        {p.quantity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">${p.price}</TableCell>
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
