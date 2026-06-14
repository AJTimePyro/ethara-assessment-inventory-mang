import { useState } from "react";
import { Plus } from "lucide-react";
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
import type { CustomerCreate } from "@/types/customer";

export function AddCustomerDialog({
  onAdd,
}: {
  onAdd: (data: CustomerCreate) => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CustomerCreate>({
    full_name: "",
    email: "",
    phone_no: 0,
  });

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    onAdd(form);
    setOpen(false);
    setForm({ full_name: "", email: "", phone_no: 0 });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="field-group">
            <label htmlFor="full_name" className="field-label">
              Full Name
            </label>
            <Input
              id="full_name"
              placeholder="e.g. Abhijeet"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
            />
          </div>
          <div className="field-group">
            <label htmlFor="email" className="field-label">
              Email Address
            </label>
            <Input
              id="email"
              placeholder="e.g. abhijeet@example.com"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="field-group">
            <label htmlFor="phone_no" className="field-label">
              Phone Number
            </label>
            <Input
              id="phone_no"
              placeholder="e.g. 9876543210"
              type="number"
              value={form.phone_no || ""}
              onChange={(e) =>
                setForm({ ...form, phone_no: Number(e.target.value) })
              }
              required
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Customer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
