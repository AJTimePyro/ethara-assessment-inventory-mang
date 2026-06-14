"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { toast } from "sonner";
import { productService } from "@/services/product_service";
import type { Product, ProductUpdate } from "@/types/product";
import { useProductStore } from "@/store/product-store";
import { useProducts } from "@/hooks/use-products";
import { DataTable } from "@/components/data-table";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { AddProductDialog } from "@/components/dialogs/add-product-dialog";
import { EditProductDialog } from "@/components/dialogs/edit-product-dialog";
import { columns } from "./columns";

export default function ProductPage() {
  "use no memo";
  const queryClient = useQueryClient();
  const { addProduct, updateProduct, removeProduct, setProducts } =
    useProductStore();
  const { products, isLoading, isError } = useProducts();
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const addMutation = useMutation({
    mutationFn: productService.createProduct,
    onMutate: async (newProduct) => {
      await queryClient.cancelQueries({ queryKey: ["products"] });
      const previous =
        queryClient.getQueryData<Product[]>(["products"]) ?? products;
      const optimistic = { ...newProduct, id: Math.random() * -1 } as Product;
      queryClient.setQueryData<Product[]>(["products"], (old) => [
        ...(old ?? []),
        optimistic,
      ]);
      addProduct(optimistic);
      return { previous };
    },
    onError: (err, newProduct, context) => {
      toast.error("Failed to add product.");
      if (context?.previous) {
        queryClient.setQueryData(["products"], context.previous);
        setProducts(context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onSuccess: () => {
      toast.success("Product added successfully.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductUpdate }) =>
      productService.updateProduct(id, data),
    onMutate: async ({ id, data }) => {
      queryClient.cancelQueries({ queryKey: ["products"] });
      const previous =
        queryClient.getQueryData<Product[]>(["products"]) ?? products;
      const optimistic = previous.map((p) =>
        p.id === id ? ({ ...p, ...data } as Product) : p,
      );
      queryClient.setQueryData<Product[]>(["products"], optimistic);
      updateProduct({
        ...(previous.find((p) => p.id === id) ?? ({} as Product)),
        ...data,
      } as Product);
      return { previous };
    },
    onError: (err, variables, context) => {
      toast.error("Failed to update product.");
      if (context?.previous) {
        queryClient.setQueryData(["products"], context.previous);
        setProducts(context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onSuccess: () => {
      toast.success("Product updated.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: productService.deleteProduct,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["products"] });
      const previous =
        queryClient.getQueryData<Product[]>(["products"]) ?? products;
      queryClient.setQueryData<Product[]>(["products"], (old) =>
        (old ?? []).filter((p) => p.id !== id),
      );
      removeProduct(id);
      setDeleteId(null);
      return { previous };
    },
    onError: (err, id, context) => {
      toast.error("Failed to delete product.");
      if (context?.previous) {
        queryClient.setQueryData(["products"], context.previous);
        setProducts(context.previous);
      }
      setDeleteId(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onSuccess: () => {
      toast.success("Product deleted.");
    },
  });

  const handleEdit = useCallback((product: Product) => {
    setEditTarget(product);
    setEditOpen(true);
  }, []);

  const handleDelete = useCallback((id: number) => setDeleteId(id), []);

  const tableColumns = useMemo(
    () => columns(handleEdit, handleDelete),
    [handleEdit, handleDelete],
  );

  const table = useReactTable({
    data: products,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <AddProductDialog onAdd={(data) => addMutation.mutate(data)} />
      </div>
      <DataTable
        table={table}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No products found."
      />
      <EditProductDialog
        key={`${editTarget?.id ?? "empty"}-${editOpen ? "open" : "closed"}`}
        product={editTarget}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdate={(id, data) => updateMutation.mutate({ id, data })}
      />
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Product"
        description="This will permanently delete the product. This action cannot be undone."
        onConfirm={() => deleteId !== null && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
