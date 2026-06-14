import { useState } from "react";
import { Plus, X } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomers } from "@/hooks/use-customers";
import { useProducts } from "@/hooks/use-products";
import type { OrderCreate, OrderItemCreate } from "@/types/order";

interface LocalOrderItem extends OrderItemCreate {
  localId: string;
}

export function AddOrderDialog({
  onAdd,
}: {
  onAdd: (data: OrderCreate) => void;
}) {
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

  function handleSubmit(e: React.SubmitEvent) {
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
          <div className="field-group">
            <label htmlFor="customer_select" className="field-label">
              Customer
            </label>
            <Select value={customerId} onValueChange={setCustomerId} required>
              <SelectTrigger id="customer_select">
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
          </div>

          {/* Items */}
          <div className="space-y-2">
            <p className="field-label">Order Items</p>
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
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
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
