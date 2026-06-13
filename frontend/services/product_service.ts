import api from "./api"
import type {
  ProductCreate,
  ProductDeleteResponse,
  ProductListResponse,
  ProductResponse,
  ProductUpdate,
} from "@/types/product"

const PRODUCT_API_PATH = "product"

const getAllProducts = async (): Promise<ProductListResponse> => {
  const response = await api.get<ProductListResponse>(`${PRODUCT_API_PATH}/`)
  return response.data
}

const getProductById = async (productId: number): Promise<ProductResponse> => {
  const response = await api.get<ProductResponse>(`${PRODUCT_API_PATH}/${productId}`)
  return response.data
}

const createProduct = async (productData: ProductCreate): Promise<ProductResponse> => {
  const response = await api.post<ProductResponse>(
    `${PRODUCT_API_PATH}/create`,
    productData,
  )
  return response.data
}

const updateProduct = async (
  productId: number,
  productData: ProductUpdate,
): Promise<ProductResponse> => {
  const response = await api.put<ProductResponse>(
    `${PRODUCT_API_PATH}/${productId}`,
    productData,
  )
  return response.data
}

const deleteProduct = async (productId: number): Promise<ProductDeleteResponse> => {
  const response = await api.delete<ProductDeleteResponse>(
    `${PRODUCT_API_PATH}/${productId}`,
  )
  return response.data
}

export const productService = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
}
