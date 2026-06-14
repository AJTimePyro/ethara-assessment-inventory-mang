"use client";

import { Fragment, useState } from "react";
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
import { ConfirmDialog } from "@/components/confirm-dialog";
import { orderService } from "@/services/order_service";
import type {
  OrderResponse,
  OrderCreate,
  OrderItemCreate,
} from "@/types/order";
import { useOrderStore } from "@/store/order-store";
import { useProductStore } from "@/store/product-store";
import type { Product } from "@/types/product";
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

interface LocalOrderItem extends OrderItemCreate {
  localId: string;
}

function AddOrderDialog({ onAdd }: { onAdd: (data: OrderCreate) => void }) {
  const { customers } = useCustomers();
  const { products } = useProducts();

  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState<string>("");
  const [items, setItems] = useState<LocalOrderItem[]>([]);

  const selectedProductIds = items
    .map((item) => item.product_id)
    .filter((id) => id > 0);

  function addItem() {
    setItems([
      ...items,
      { localId: Math.random().toString(), product_id: 0, quantity: 1 },
    ]);
  }

  function updateItem(localId: string, patch: Partial<OrderItemCreate>) {
    setItems(
      items.map((it) => (it.localId === localId ? { ...it, ...patch } : it)),
    );
  }

  function removeItem(localId: string) {
    setItems(items.filter((it) => it.localId !== localId));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId || items.length === 0) return;
    const submissionItems = items.map((item) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { localId, ...rest } = item;
      return rest;
    });
    onAdd({ customer_id: Number(customerId), items: submissionItems });
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
            {items.map((item) => {
              const product = products.find((p) => p.id === item.product_id);
              const isOverStock = product
                ? item.quantity > product.quantity
                : false;

              return (
                <div key={item.localId} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Select
                      value={item.product_id ? String(item.product_id) : ""}
                      onValueChange={(v) =>
                        updateItem(item.localId, { product_id: Number(v) })
                      }
                      required
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products
                          .filter(
                            (p) =>
                              p.id === item.product_id ||
                              !selectedProductIds.includes(p.id),
                          )
                          .map((p) => (
                            <SelectItem
                              key={p.id}
                              value={String(p.id)}
                              disabled={p.quantity <= 0}
                            >
                              {p.product_name}{" "}
                              {p.quantity <= 0
                                ? "(Out of Stock)"
                                : `(Stock: ${p.quantity})`}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="1"
                      max={product?.quantity}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.localId, {
                          quantity: Number(e.target.value),
                        })
                      }
                      className={`w-20 ${
                        isOverStock
                          ? "border-destructive text-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.localId)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {isOverStock && product && (
                    <p className="text-xs text-destructive font-medium">
                      Max available stock: {product.quantity}
                    </p>
                  )}
                </div>
              );
            })}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              disabled={
                items.some((item) => !item.product_id) ||
                items.length >= products.length
              }
            >
              <Plus className="mr-1 h-3 w-3" /> Add Item
            </Button>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={
                !customerId ||
                items.length === 0 ||
                items.some((item) => {
                  const product = products.find(
                    (p) => p.id === item.product_id,
                  );
                  return product ? item.quantity > product.quantity : false;
                })
              }
            >
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
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const {
    data: queryOrders,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const data = await orderService.getAllOrders();
      const sortedData = data.sort((a, b) => a.id - b.id);
      setOrders(sortedData);
      return sortedData;
    },
    retry: false,
  });

  const displayOrders = queryOrders ?? orders;

  const addMutation = useMutation({
    mutationFn: orderService.createOrder,
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: ["orders"] });
      await queryClient.cancelQueries({ queryKey: ["products"] });

      const previousOrders =
        queryClient.getQueryData<OrderResponse[]>(["orders"]) ?? orders;
      const previousProducts =
        queryClient.getQueryData<Product[]>(["products"]) ??
        useProductStore.getState().products;

      const mockOrder: OrderResponse = {
        id: Math.random() * -1,
        customer_id: newOrder.customer_id,
        items: newOrder.items.map((item) => {
          const product = previousProducts.find(
            (p) => p.id === item.product_id,
          );
          return {
            id: Math.random() * -1,
            product_id: item.product_id,
            quantity: item.quantity,
            purchased_price: product ? String(product.price) : "0",
          };
        }),
      };

      queryClient.setQueryData<OrderResponse[]>(["orders"], (old) => [
        ...(old ?? []),
        mockOrder,
      ]);
      addOrder(mockOrder);

      const updatedProducts = previousProducts.map((p) => {
        const orderItem = newOrder.items.find(
          (item) => item.product_id === p.id,
        );
        if (orderItem) {
          return {
            ...p,
            quantity: Math.max(0, p.quantity - orderItem.quantity),
          };
        }
        return p;
      });
      queryClient.setQueryData<Product[]>(["products"], updatedProducts);
      useProductStore.getState().setProducts(updatedProducts);

      return { previousOrders, previousProducts };
    },
    onError: (err, newOrder, context) => {
      toast.error("Failed to create order.");
      if (context?.previousOrders) {
        queryClient.setQueryData(["orders"], context.previousOrders);
        setOrders(context.previousOrders);
      }
      if (context?.previousProducts) {
        queryClient.setQueryData(["products"], context.previousProducts);
        useProductStore.getState().setProducts(context.previousProducts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onSuccess: () => {
      toast.success("Order created.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: orderService.deleteOrder,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["orders"] });
      await queryClient.cancelQueries({ queryKey: ["products"] });

      const previousOrders =
        queryClient.getQueryData<OrderResponse[]>(["orders"]) ?? orders;
      const previousProducts =
        queryClient.getQueryData<Product[]>(["products"]) ??
        useProductStore.getState().products;

      const orderToDelete = previousOrders.find((o) => o.id === id);

      queryClient.setQueryData<OrderResponse[]>(["orders"], (old) =>
        (old ?? []).filter((o) => o.id !== id),
      );
      removeOrder(id);
      setDeleteId(null);

      let updatedProducts = previousProducts;
      if (orderToDelete) {
        updatedProducts = previousProducts.map((p) => {
          const orderItem = orderToDelete.items.find(
            (item) => item.product_id === p.id,
          );
          if (orderItem) {
            return { ...p, quantity: p.quantity + orderItem.quantity };
          }
          return p;
        });
        queryClient.setQueryData<Product[]>(["products"], updatedProducts);
        useProductStore.getState().setProducts(updatedProducts);
      }

      return { previousOrders, previousProducts };
    },
    onError: (err, id, context) => {
      toast.error("Failed to delete order.");
      if (context?.previousOrders) {
        queryClient.setQueryData(["orders"], context.previousOrders);
        setOrders(context.previousOrders);
      }
      if (context?.previousProducts) {
        queryClient.setQueryData(["products"], context.previousProducts);
        useProductStore.getState().setProducts(context.previousProducts);
      }
      setDeleteId(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onSuccess: () => {
      toast.success("Order deleted.");
    },
  });

  const customerMap = new Map(customers.map((c) => [c.id, c.full_name]));
  const productMap = new Map(products.map((p) => [p.id, p.product_name]));

  const cols = buildColumns(customerMap, (id) => setDeleteId(id));

  const table = useReactTable({
    data: displayOrders,
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
                <Fragment key={row.id}>
                  <TableRow>
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
                    <TableRow>
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
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Order"
        description="This will permanently delete the order and restore product stock. This action cannot be undone."
        onConfirm={() => deleteId !== null && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
