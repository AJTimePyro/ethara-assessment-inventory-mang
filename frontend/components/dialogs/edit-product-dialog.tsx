import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ProductFormFields } from "@/components/forms/product-form-fields";
import type { Product, ProductCreate, ProductUpdate } from "@/types/product";

const emptyForm: ProductCreate = {
  sku_code: "",
  product_name: "",
  price: "",
  quantity: 0,
};

export function EditProductDialog({
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
  const [form, setForm] = useState<ProductCreate>(() =>
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

  function handleSubmit(e: React.SubmitEvent) {
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
