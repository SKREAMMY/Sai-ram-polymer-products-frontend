import api from "../../../api/axios";
import type { ApiResponse, SalaryRecord } from "../../../types";

export interface GeneratePayrollPayload {
  period_year: number;
  period_month: number;
}

export const payrollApi = {
  generate: (payload: GeneratePayrollPayload) =>
    api.post<ApiResponse<SalaryRecord[]>>("/payroll/generate", payload),

  getByMonth: (period: string) =>
    api.get<ApiResponse<SalaryRecord[]>>(`/payroll/${period}`),

  getByEmployee: (period: string, employeeId: string) =>
    api.get<ApiResponse<SalaryRecord>>(
      `/payroll/${period}/employee/${employeeId}`
    ),

  approve: (id: string) =>
    api.patch<ApiResponse<SalaryRecord>>(`/payroll/${id}/approve`),

  markPaid: (id: string) =>
    api.patch<ApiResponse<SalaryRecord>>(`/payroll/${id}/paid`),
};
