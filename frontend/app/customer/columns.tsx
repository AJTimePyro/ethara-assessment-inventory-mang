import type { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import type { Customer } from "@/types/customer";
import { Button } from "@/components/ui/button";

export const columns = (
  onDelete: (id: number) => void,
): ColumnDef<Customer>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (row.original.id < 0 ? "" : row.original.id),
  },
  { accessorKey: "full_name", header: "Full Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "phone_no", header: "Phone" },
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
