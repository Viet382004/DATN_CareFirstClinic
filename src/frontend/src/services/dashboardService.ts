import { apiGet } from './apiClient';

export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  monthlyRevenue: number;
  completionRate: number;
  statsToday: { status: string; count: number }[];
}

export interface ChartData {
  name: string;
  appointments: number;
  revenue: number;
}

export const dashboardService = {
  /**
   * Lấy số liệu thống kê tổng quan (Requires: Admin role)
   */
  async getStats(): Promise<DashboardStats> {
    return apiGet('/dashboard/stats');
  },

  /**
   * Lấy dữ liệu biểu đồ 7 ngày gần nhất (Requires: Admin role)
   */
  async getCharts(): Promise<ChartData[]> {
    return apiGet('/dashboard/charts');
  }
};
