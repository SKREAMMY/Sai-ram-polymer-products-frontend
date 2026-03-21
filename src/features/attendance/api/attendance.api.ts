import api from "../../../api/axios";
import type {
  ApiResponse,
  AttendanceLog,
  PaginatedResponse,
} from "../../../types";

export interface CreateAttendancePayload {
  employee_id: string;
  log_date: string;
  clock_in?: string;
  clock_out?: string;
  status: "present" | "absent" | "leave";
  notes?: string;
}

export interface UpdateAttendancePayload {
  clock_in?: string;
  clock_out?: string;
  status?: "present" | "absent" | "leave";
  notes?: string;
}

export interface BulkAttendancePayload {
  log_date: string;
  entries: Array<{
    employee_id: string;
    status: "present" | "absent" | "leave";
    clock_in?: string;
    clock_out?: string;
  }>;
}

export const attendanceApi = {
  getDaily: (date: string) =>
    api.get<ApiResponse<AttendanceLog[]>>("/attendance/daily", {
      params: { date },
    }),

  getEmployeeAttendance: (id: string, from: string, to: string) =>
    api.get<ApiResponse<PaginatedResponse<AttendanceLog>>>(
      `/employees/${id}/attendance`,
      { params: { from, to, limit: 31 } }
    ),

  create: (payload: CreateAttendancePayload) =>
    api.post<ApiResponse<AttendanceLog>>("/attendance", payload),

  update: (id: string, payload: UpdateAttendancePayload) =>
    api.put<ApiResponse<AttendanceLog>>(`/attendance/${id}`, payload),

  delete: (id: string) => api.delete(`/attendance/${id}`),

  bulk: (payload: BulkAttendancePayload) =>
    api.post("/attendance/bulk", payload),
};
