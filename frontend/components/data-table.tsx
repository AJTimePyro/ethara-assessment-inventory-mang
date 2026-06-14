"use client";

import { flexRender, type Table as TanstackTable } from "@tanstack/react-table";
import { ErrorState, type ErrorStateProps } from "@/components/error-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<T> {
  table: TanstackTable<T>;
  isLoading?: boolean;
  isError?: boolean;
  emptyMessage?: string;
  errorState?: ErrorStateProps;
}

export function DataTable<T>({
  table,
  isLoading,
  isError,
  emptyMessage = "No data found.",
  errorState,
}: DataTableProps<T>) {
  "use no memo";
  const colSpan = table.getAllColumns().length;

  return (
    <div className="rounded-md border w-full">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={colSpan}
                className="text-center py-8 text-muted-foreground"
              >
                Loading…
              </TableCell>
            </TableRow>
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={colSpan}>
                <ErrorState {...errorState} />
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={colSpan}
                className="text-center py-8 text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
