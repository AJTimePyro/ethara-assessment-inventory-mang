"use client";

import { Fragment, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { orderService } from "@/services/order_service";
import type { OrderResponse } from "@/types/order";
import type { Product } from "@/types/product";
import { useOrderStore } from "@/store/order-store";
import { useProductStore } from "@/store/product-store";
import { useCustomers } from "@/hooks/use-customers";
import { useProducts } from "@/hooks/use-products";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ErrorState } from "@/components/error-state";
import { AddOrderDialog } from "@/components/dialogs/add-order-dialog";
import { buildColumns } from "./columns";

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
