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
          type="text"
          inputMode="decimal"
          value={form.price}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
              onChange({ ...form, price: val });
            }
          }}
          onBlur={() => {
            const parsed = parseFloat(form.price);
            if (isNaN(parsed)) {
              onChange({ ...form, price: "" });
            } else {
              onChange({ ...form, price: parsed.toFixed(2) });
            }
          }}
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
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={form.quantity || ""}
          onChange={(e) => {
            const clean = e.target.value.replace(/\D/g, "");
            onChange({ ...form, quantity: clean ? parseInt(clean, 10) : 0 });
          }}
          required
        />
      </div>
    </>
  );
}
