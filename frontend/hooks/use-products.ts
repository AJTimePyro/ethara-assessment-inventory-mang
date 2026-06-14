import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product_service";
import { useProductStore } from "@/store/product-store";
import type { Product } from "@/types/product";

const EMPTY: Product[] = [];

export function useProducts() {
  const { setProducts } = useProductStore();

  const query = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const data = await productService.getAllProducts();
      const sortedData = data.sort((a, b) => a.id - b.id);
      setProducts(sortedData);
      return sortedData;
    },
    retry: false,
  });

  return { products: query.data ?? EMPTY, ...query };
}
