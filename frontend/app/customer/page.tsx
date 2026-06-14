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
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (row.original.id < 0 ? "" : row.original.id),
  },
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
        disabled={row.original.id < 0}
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
  const { addCustomer, removeCustomer, setCustomers } = useCustomerStore();
  const { customers, isLoading, isError } = useCustomers();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const addMutation = useMutation({
    mutationFn: customerService.createCustomer,
    onMutate: async (newCustomer) => {
      await queryClient.cancelQueries({ queryKey: ["customers"] });
      const previous =
        queryClient.getQueryData<Customer[]>(["customers"]) ?? customers;
      const optimistic = { ...newCustomer, id: Math.random() * -1 } as Customer;
      queryClient.setQueryData<Customer[]>(["customers"], (old) => [
        ...(old ?? []),
        optimistic,
      ]);
      addCustomer(optimistic);
      return { previous };
    },
    onError: (err, newCustomer, context) => {
      toast.error("Failed to add customer.");
      if (context?.previous) {
        queryClient.setQueryData(["customers"], context.previous);
        setCustomers(context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onSuccess: () => {
      toast.success("Customer added successfully.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: customerService.deleteCustomer,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["customers"] });
      const previous =
        queryClient.getQueryData<Customer[]>(["customers"]) ?? customers;
      queryClient.setQueryData<Customer[]>(["customers"], (old) =>
        (old ?? []).filter((c) => c.id !== id),
      );
      removeCustomer(id);
      setDeleteId(null);
      return { previous };
    },
    onError: (err, id, context) => {
      toast.error("Failed to delete customer.");
      if (context?.previous) {
        queryClient.setQueryData(["customers"], context.previous);
        setCustomers(context.previous);
      }
      setDeleteId(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onSuccess: () => {
      toast.success("Customer deleted.");
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
