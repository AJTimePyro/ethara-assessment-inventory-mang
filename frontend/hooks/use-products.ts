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
      setProducts(data);
      return data;
    },
    retry: false,
  });

  return { products: query.data ?? EMPTY, ...query };
}
