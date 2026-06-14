"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { Trash2, Plus, Pencil } from "lucide-react";
import { productService } from "@/services/product_service";
import type { Product, ProductCreate, ProductUpdate } from "@/types/product";
import { useProductStore } from "@/store/product-store";
import { useProducts } from "@/hooks/use-products";
import { DataTable } from "@/components/data-table";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

const emptyForm: ProductCreate = {
  sku_code: "",
  product_name: "",
  price: "",
  quantity: 0,
};

const columns = (
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

function ProductFormFields({
  form,
  onChange,
}: {
  form: ProductCreate;
  onChange: (f: ProductCreate) => void;
}) {
  return (
    <>
      <Input
        placeholder="SKU Code"
        value={form.sku_code}
        onChange={(e) => onChange({ ...form, sku_code: e.target.value })}
        required
      />
      <Input
        placeholder="Product Name"
        value={form.product_name}
        onChange={(e) => onChange({ ...form, product_name: e.target.value })}
        required
      />
      <Input
        placeholder="Price"
        type="number"
        step="0.01"
        min="0"
        value={form.price}
        onChange={(e) => onChange({ ...form, price: e.target.value })}
        required
      />
      <Input
        placeholder="Quantity"
        type="number"
        min="0"
        value={form.quantity || ""}
        onChange={(e) =>
          onChange({ ...form, quantity: Number(e.target.value) })
        }
        required
      />
    </>
  );
}

function AddProductDialog({ onAdd }: { onAdd: (data: ProductCreate) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProductCreate>(emptyForm);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onAdd(form);
    setOpen(false);
    setForm(emptyForm);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <ProductFormFields form={form} onChange={(f) => setForm(f)} />
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditProductDialog({
  product,
  open,
  onOpenChange,
  onUpdate,
}: {
  product: Product | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUpdate: (id: number, data: ProductUpdate) => void;
}) {
  const [form, setForm] = useState<ProductCreate>(
    product
      ? {
          sku_code: product.sku_code,
          product_name: product.product_name,
          price: product.price,
          quantity: product.quantity,
        }
      : emptyForm,
  );

  function handleOpenChange(v: boolean) {
    if (!v) {
      setForm(emptyForm);
    }
    onOpenChange(v);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    const payload: ProductUpdate = { ...form };
    onUpdate(product.id, payload);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <ProductFormFields form={form} onChange={(f) => setForm(f)} />
          <DialogFooter>
            <Button type="submit">Update</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
