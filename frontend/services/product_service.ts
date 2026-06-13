import api from "./api";
import type {
  ProductCreate,
  ProductDeleteResponse,
  ProductListResponse,
  Product,
  ProductUpdate,
} from "@/types/product";

const PRODUCT_API_PATH = "product";

const getAllProducts = async (): Promise<ProductListResponse> => {
  const response = await api.get<ProductListResponse>(`${PRODUCT_API_PATH}/`);
  return response.data;
};

const getProductById = async (productId: number): Promise<Product> => {
  const response = await api.get<Product>(`${PRODUCT_API_PATH}/${productId}`);
  return response.data;
};

const createProduct = async (productData: ProductCreate): Promise<Product> => {
  const response = await api.post<Product>(
    `${PRODUCT_API_PATH}/create`,
    productData,
  );
  return response.data;
};

const updateProduct = async (
  productId: number,
  productData: ProductUpdate,
): Promise<Product> => {
  const response = await api.put<Product>(
    `${PRODUCT_API_PATH}/${productId}`,
    productData,
  );
  return response.data;
};

const deleteProduct = async (
  productId: number,
): Promise<ProductDeleteResponse> => {
  const response = await api.delete<ProductDeleteResponse>(
    `${PRODUCT_API_PATH}/${productId}`,
  );
  return response.data;
};

export const productService = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
