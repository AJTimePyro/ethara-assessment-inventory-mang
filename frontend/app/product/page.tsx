"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { DataTable } from "@/components/data-table";
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
  { accessorKey: "id", header: "ID" },
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
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(row.original.id)}
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
  const [form, setForm] = useState<ProductCreate>(emptyForm);

  function handleOpenChange(v: boolean) {
    if (v && product) {
      setForm({
        sku_code: product.sku_code,
        product_name: product.product_name,
        price: product.price,
        quantity: product.quantity,
      });
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
  const queryClient = useQueryClient();
  const { products, setProducts, addProduct, updateProduct, removeProduct } =
    useProductStore();
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const { isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const data = await productService.getAllProducts();
      setProducts(data);
      return data;
    },
    retry: false,
  });

  const addMutation = useMutation({
    mutationFn: productService.createProduct,
    onSuccess: (newProduct) => {
      addProduct(newProduct);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product added successfully.");
    },
    onError: () => toast.error("Failed to add product."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductUpdate }) =>
      productService.updateProduct(id, data),
    onSuccess: (updatedProduct) => {
      updateProduct(updatedProduct);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated.");
    },
    onError: () => toast.error("Failed to update product."),
  });

  const deleteMutation = useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: (_, id) => {
      removeProduct(id);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted.");
    },
    onError: () => toast.error("Failed to delete product."),
  });

  function handleEdit(product: Product) {
    setEditTarget(product);
    setEditOpen(true);
  }

  const table = useReactTable({
    data: products,
    columns: columns(handleEdit, (id) => deleteMutation.mutate(id)),
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
        product={editTarget}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdate={(id, data) => updateMutation.mutate({ id, data })}
      />
    </div>
  );
}
