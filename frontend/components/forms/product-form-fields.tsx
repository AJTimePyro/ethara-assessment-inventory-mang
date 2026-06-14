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
      <div className="field-group">
        <label htmlFor="sku_code" className="field-label">
          SKU Code
        </label>
        <Input
          id="sku_code"
          placeholder="e.g. SKU-001"
          value={form.sku_code}
          onChange={(e) => onChange({ ...form, sku_code: e.target.value })}
          required
        />
      </div>
      <div className="field-group">
        <label htmlFor="product_name" className="field-label">
          Product Name
        </label>
        <Input
          id="product_name"
          placeholder="e.g. Wireless Mouse"
          value={form.product_name}
          onChange={(e) => onChange({ ...form, product_name: e.target.value })}
          required
        />
      </div>
      <div className="field-group">
        <label htmlFor="price" className="field-label">
          Price ($)
        </label>
        <Input
          id="price"
          placeholder="0.00"
          type="number"
          step="0.01"
          min="0"
          value={form.price}
          onChange={(e) => onChange({ ...form, price: e.target.value })}
          required
        />
      </div>
      <div className="field-group">
        <label htmlFor="quantity" className="field-label">
          Quantity
        </label>
        <Input
          id="quantity"
          placeholder="0"
          type="number"
          min="0"
          value={form.quantity || ""}
          onChange={(e) =>
            onChange({ ...form, quantity: Number(e.target.value) })
          }
          required
        />
      </div>
    </>
  );
}
