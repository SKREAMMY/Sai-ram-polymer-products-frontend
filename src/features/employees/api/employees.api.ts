import api from "../../../api/axios";
import type { ApiResponse, Employee, PaginatedResponse } from "../../../types";

export interface CreateEmployeePayload {
  full_name: string;
  phone?: string;
  position?: string;
  department?: string;
  monthly_salary: number;
  joined_at?: string;
}

export interface UpdateEmployeePayload {
  full_name?: string;
  phone?: string;
  position?: string;
  department?: string;
  monthly_salary?: number;
  is_active?: boolean;
}

export interface EmployeeFilters {
  search?: string;
  department?: string;
  page?: number;
  limit?: number;
}

export const employeesApi = {
  list: (filters?: EmployeeFilters) =>
    api.get<ApiResponse<PaginatedResponse<Employee>>>("/employees", {
      params: filters,
    }),

  get: (id: string) => api.get<ApiResponse<Employee>>(`/employees/${id}`),

  create: (payload: CreateEmployeePayload) =>
    api.post<ApiResponse<Employee>>("/employees", payload),

  update: (id: string, payload: UpdateEmployeePayload) =>
    api.put<ApiResponse<Employee>>(`/employees/${id}`, payload),

  getSummary: (id: string, month?: string) =>
    api.get<
      ApiResponse<{
        employee_id: string;
        month: string;
        days_present: string;
        days_absent: string;
        days_leave: string;
        total_hours: string;
        gross_pay: string;
      }>
    >(`/employees/${id}/summary`, { params: month ? { month } : {} }),
};
