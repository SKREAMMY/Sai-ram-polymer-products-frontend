import api from "../../../api/axios";
import type { ApiResponse } from "../../../types";

export interface DailySummary {
  date: string;
  total_employees: string;
  present: string;
  absent: string;
  on_leave: string;
  not_marked: string;
  total_pay_for_day: string;
}

export interface EmployeeSummary {
  employee_id: string;
  month: string;
  days_present: string;
  days_absent: string;
  days_leave: string;
  total_hours: string;
  gross_pay: string;
}

export const dashboardApi = {
  getDailySummary: (date?: string) =>
    api.get<ApiResponse<DailySummary>>("/reports/daily", {
      params: date ? { date } : {},
    }),
};
