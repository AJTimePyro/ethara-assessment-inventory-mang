import { useQuery } from "@tanstack/react-query";
import { customerService } from "@/services/customer_service";
import { useCustomerStore } from "@/store/customer-store";
import type { Customer } from "@/types/customer";

const EMPTY: Customer[] = [];

export function useCustomers() {
  const { setCustomers } = useCustomerStore();

  const query = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const data = await customerService.getAllCustomers();
      setCustomers(data);
      return data;
    },
    retry: false,
  });

  return { customers: query.data ?? EMPTY, ...query };
}
