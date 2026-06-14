import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product_service";
import { useProductStore } from "@/store/product-store";

export function useProducts() {
  const { setProducts } = useProductStore();

  const query = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const data = await productService.getAllProducts();
      setProducts(data);
      return data;
    },
    retry: false,
  });

  // query.data is reactive to both query fetches AND queryClient.setQueryData() calls,
  // so optimistic writes are immediately visible without a stale getQueryData() read.
  return { products: query.data ?? [], ...query };
}
