import { Input } from "@/components/ui/input";
import type { ProductCreate } from "@/types/product";

export function ProductFormFields({
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
