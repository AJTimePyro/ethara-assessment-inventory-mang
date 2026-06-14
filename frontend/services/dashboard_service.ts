import api from "./api";
import type { DashboardSummary } from "@/types/dashboard";

const getSummary = async (): Promise<DashboardSummary> => {
  const response = await api.get<DashboardSummary>("dashboard/");
  return response.data;
};

export const dashboardService = { getSummary };
