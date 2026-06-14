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
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            placeholder="Full Name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
          />
          <Input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            placeholder="Phone Number"
            type="number"
            value={form.phone_no || ""}
            onChange={(e) =>
              setForm({ ...form, phone_no: Number(e.target.value) })
            }
            required
          />
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
