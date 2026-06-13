import api from "./api"
import type {
  OrderCreate,
  OrderDeleteResponse,
  OrderListResponse,
  OrderResponse,
} from "@/types/order"

const ORDER_API_PATH = "order"

const getAllOrders = async (): Promise<OrderListResponse> => {
  const response = await api.get<OrderListResponse>(`${ORDER_API_PATH}/`)
  return response.data
}

const getOrderById = async (orderId: number): Promise<OrderResponse> => {
  const response = await api.get<OrderResponse>(`${ORDER_API_PATH}/${orderId}`)
  return response.data
}

const createOrder = async (orderData: OrderCreate): Promise<OrderResponse> => {
  const response = await api.post<OrderResponse>(
    `${ORDER_API_PATH}/create`,
    orderData,
  )
  return response.data
}

const deleteOrder = async (orderId: number): Promise<OrderDeleteResponse> => {
  const response = await api.delete<OrderDeleteResponse>(
    `${ORDER_API_PATH}/${orderId}`,
  )
  return response.data
}

export const orderService = {
  getAllOrders,
  getOrderById,
  createOrder,
  deleteOrder,
}
