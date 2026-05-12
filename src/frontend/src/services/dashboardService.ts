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

export interface RevenueByDay {
  date: string;
  amount: number;
  count: number;
}

export interface RevenueByType {
  type: string;
  amount: number;
  percentage: number;
}

export interface RevenueByMethod {
  method: string;
  amount: number;
  percentage: number;
}

export interface RevenueReport {
  totalRevenue: number;
  previousPeriodRevenue: number;
  growthRate: number;
  revenueByDay: RevenueByDay[];
  revenueByType: RevenueByType[];
  revenueByMethod: RevenueByMethod[];
  totalAppointments: number;
  successfulAppointments: number;
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
  },

  /**
   * Lấy báo cáo doanh thu chi tiết (Requires: Admin role)
   */
  async getRevenueReport(startDate?: string, endDate?: string): Promise<RevenueReport> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return apiGet(`/dashboard/revenue-report?${params.toString()}`);
  }
};
