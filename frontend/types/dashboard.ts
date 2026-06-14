import { Product } from "./product";

export interface DashboardSummary {
  total_products: number;
  total_customers: number;
  total_orders: number;
  low_stock_count: number;
  low_stock_threshold: number;
  low_stock_products: Product[];
}
