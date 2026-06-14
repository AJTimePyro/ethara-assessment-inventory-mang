"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { customerService } from "@/services/customer_service";
import type { Customer, CustomerCreate } from "@/types/customer";
import { useCustomerStore } from "@/store/customer-store";
import { useCustomers } from "@/hooks/use-customers";
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

const columns = (onDelete: (id: number) => void): ColumnDef<Customer>[] => [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "full_name", header: "Full Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "phone_no", header: "Phone" },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(row.original.id)}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    ),
  },
];

function AddCustomerDialog({
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

  function handleSubmit(e: React.FormEvent) {
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

export default function CustomerPage() {
  const queryClient = useQueryClient();
  const { addCustomer, removeCustomer } = useCustomerStore();
  const { customers, isLoading, isError } = useCustomers();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const addMutation = useMutation({
    mutationFn: customerService.createCustomer,
    onSuccess: (newCustomer) => {
      addCustomer(newCustomer);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer added successfully.");
    },
    onError: () => toast.error("Failed to add customer."),
  });

  const deleteMutation = useMutation({
    mutationFn: customerService.deleteCustomer,
    onSuccess: (_, id) => {
      removeCustomer(id);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer deleted.");
      setDeleteId(null);
    },
    onError: () => {
      toast.error("Failed to delete customer.");
      setDeleteId(null);
    },
  });

  const table = useReactTable({
    data: customers,
    columns: columns((id) => setDeleteId(id)),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <AddCustomerDialog onAdd={(data) => addMutation.mutate(data)} />
      </div>
      <DataTable
        table={table}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No customers found."
      />
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Customer"
        description="This will permanently delete the customer. This action cannot be undone."
        onConfirm={() => deleteId !== null && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
