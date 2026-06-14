"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type ColumnDef,
  type ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { Trash2, Plus, ChevronRight, X } from "lucide-react";

import { orderService } from "@/services/order_service";
import type {
  OrderResponse,
  OrderCreate,
  OrderItemCreate,
} from "@/types/order";
import { useOrderStore } from "@/store/order-store";
import { useCustomers } from "@/hooks/use-customers";
import { useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ErrorState } from "@/components/error-state";

const buildColumns = (
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
  { accessorKey: "id", header: "Order ID" },
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
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    ),
  },
];

function AddOrderDialog({ onAdd }: { onAdd: (data: OrderCreate) => void }) {
  const { customers } = useCustomers();
  const { products } = useProducts();

  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState<string>("");
  const [items, setItems] = useState<OrderItemCreate[]>([]);

  function addItem() {
    setItems([...items, { product_id: 0, quantity: 1 }]);
  }

  function updateItem(index: number, patch: Partial<OrderItemCreate>) {
    setItems(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId || items.length === 0) return;
    onAdd({ customer_id: Number(customerId), items });
    setOpen(false);
    setCustomerId("");
    setItems([]);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer select */}
          <Select value={customerId} onValueChange={setCustomerId} required>
            <SelectTrigger>
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Items */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Items</p>
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Select
                  value={item.product_id ? String(item.product_id) : ""}
                  onValueChange={(v) =>
                    updateItem(idx, { product_id: Number(v) })
                  }
                  required
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.product_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(idx, { quantity: Number(e.target.value) })
                  }
                  className="w-20"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(idx)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="mr-1 h-3 w-3" /> Add Item
            </Button>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!customerId || items.length === 0}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function OrderPage() {
  const queryClient = useQueryClient();
  const { orders, setOrders, addOrder, removeOrder } = useOrderStore();
  const { customers } = useCustomers();
  const { products } = useProducts();
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const { isLoading, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const data = await orderService.getAllOrders();
      setOrders(data);
      return data;
    },
    retry: false,
  });

  const addMutation = useMutation({
    mutationFn: orderService.createOrder,
    onSuccess: (newOrder) => {
      addOrder(newOrder);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order created.");
    },
    onError: () => toast.error("Failed to create order."),
  });

  const deleteMutation = useMutation({
    mutationFn: orderService.deleteOrder,
    onSuccess: (_, id) => {
      removeOrder(id);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order deleted.");
    },
    onError: () => toast.error("Failed to delete order."),
  });

  const customerMap = new Map(customers.map((c) => [c.id, c.full_name]));
  const productMap = new Map(products.map((p) => [p.id, p.product_name]));

  const cols = buildColumns(customerMap, (id) => deleteMutation.mutate(id));

  const table = useReactTable({
    data: orders,
    columns: cols,
    state: { expanded },
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  const colSpan = cols.length;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <AddOrderDialog onAdd={(data) => addMutation.mutate(data)} />
      </div>

      <div className="rounded-md border w-full">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={colSpan}
                  className="text-center py-8 text-muted-foreground"
                >
                  Loading…
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={colSpan}>
                  <ErrorState
                    title="Unable to reach the server"
                    description="Make sure the backend is running and try again."
                  />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={colSpan}
                  className="text-center py-8 text-muted-foreground"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <>
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow key={`${row.id}-detail`}>
                      <TableCell colSpan={colSpan} className="bg-muted/30 p-4">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-muted-foreground">
                              <th className="text-left font-medium pb-1">
                                Product
                              </th>
                              <th className="text-left font-medium pb-1">
                                Qty
                              </th>
                              <th className="text-left font-medium pb-1">
                                Price
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {row.original.items.map((item) => (
                              <tr key={item.id}>
                                <td>
                                  {productMap.get(item.product_id) ??
                                    `#${item.product_id}`}
                                </td>
                                <td>{item.quantity}</td>
                                <td>{item.purchased_price}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
