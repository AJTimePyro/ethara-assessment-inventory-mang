import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductFormFields } from "@/components/forms/product-form-fields";
import type { ProductCreate } from "@/types/product";

const emptyForm: ProductCreate = {
  sku_code: "",
  product_name: "",
  price: "",
  quantity: 0,
};

export function AddProductDialog({
  onAdd,
}: {
  onAdd: (data: ProductCreate) => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProductCreate>(emptyForm);

  function handleSubmit(e: React.SubmitEvent) {
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <ProductFormFields form={form} onChange={(f) => setForm(f)} />
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Product</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
