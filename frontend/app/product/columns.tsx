import type { ColumnDef } from "@tanstack/react-table";
import { Trash2, Pencil } from "lucide-react";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";

export const columns = (
  onEdit: (product: Product) => void,
  onDelete: (id: number) => void,
): ColumnDef<Product>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (row.original.id < 0 ? "" : row.original.id),
  },
  { accessorKey: "sku_code", header: "SKU" },
  { accessorKey: "product_name", header: "Product Name" },
  { accessorKey: "price", header: "Price" },
  { accessorKey: "quantity", header: "Qty" },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(row.original)}
          disabled={row.original.id < 0}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(row.original.id)}
          disabled={row.original.id < 0}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    ),
  },
];
