import type { ColumnDef } from "@tanstack/react-table";
import { Trash2, ChevronRight } from "lucide-react";
import type { OrderResponse } from "@/types/order";
import { Button } from "@/components/ui/button";

export const buildColumns = (
  customerMap: Map<number, string>,
  onDelete: (id: number) => void,
): ColumnDef<OrderResponse>[] => [
  {
    id: "expand",
    header: "",
    cell: ({ row }) => (
      <Button variant="ghost" size="icon" onClick={() => row.toggleExpanded()}>
        <ChevronRight
          className={`h-4 w-4 transition-transform ${
            row.getIsExpanded() ? "rotate-90" : ""
          }`}
        />
      </Button>
    ),
  },
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => (row.original.id < 0 ? "" : row.original.id),
  },
  {
    accessorKey: "customer_id",
    header: "Customer",
    cell: ({ row }) =>
      customerMap.get(row.original.customer_id) ??
      `#${row.original.customer_id}`,
  },
  {
    id: "items_count",
    header: "Items",
    cell: ({ row }) => row.original.items.length,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(row.original.id)}
        disabled={row.original.id < 0}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    ),
  },
];
