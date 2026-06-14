import { useQuery } from "@tanstack/react-query";
import { customerService } from "@/services/customer_service";
import { useCustomerStore } from "@/store/customer-store";

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

  // query.data is reactive to both query fetches AND queryClient.setQueryData() calls,
  // so optimistic writes are immediately visible without a stale getQueryData() read.
  return { customers: query.data ?? [], ...query };
}
