"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { toast } from "sonner";
import { customerService } from "@/services/customer_service";
import type { Customer } from "@/types/customer";
import { useCustomerStore } from "@/store/customer-store";
import { useCustomers } from "@/hooks/use-customers";
import { DataTable } from "@/components/data-table";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { AddCustomerDialog } from "@/components/dialogs/add-customer-dialog";
import { columns } from "./columns";

export default function CustomerPage() {
  "use no memo";
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
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
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
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onSuccess: () => {
      toast.success("Customer deleted.");
    },
  });

  const handleDelete = useCallback((id: number) => setDeleteId(id), []);

  const tableColumns = useMemo(() => columns(handleDelete), [handleDelete]);

  const table = useReactTable({
    data: customers,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">
            View and manage your customer directory.
          </p>
        </div>
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
