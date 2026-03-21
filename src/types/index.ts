export type AttendanceStatus = "present" | "absent" | "leave";
export type SalaryStatus = "draft" | "approved" | "paid";
export type UserRole = "admin" | "manager";

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  phone: string | null;
  position: string | null;
  department: string | null;
  monthly_salary: number;
  daily_rate: number;
  hourly_rate: number;
  is_active: boolean;
  joined_at: string;
  created_at: string;
}

export interface AttendanceLog {
  id: string;
  employee_id: string;
  log_date: string;
  clock_in: string | null;
  clock_out: string | null;
  hours_worked: number;
  working_days_in_month: number;
  monthly_salary: number;
  daily_rate: number;
  hourly_rate: number;
  day_pay: number;
  status: AttendanceStatus;
  notes: string | null;
  created_at: string;
  employee?: {
    id: string;
    full_name: string;
    employee_code: string;
    department: string | null;
  };
}

export interface SalaryRecord {
  id: string;
  employee_id: string;
  period_year: number;
  period_month: number;
  period_label: string;
  working_days_in_month: number;
  days_present: number;
  days_absent: number;
  days_leave: number;
  total_hours: number;
  monthly_salary: number;
  daily_rate: number;
  hourly_rate: number;
  gross_pay: number;
  status: SalaryStatus;
  employee?: {
    id: string;
    full_name: string;
    employee_code: string;
    department: string | null;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  success: boolean;
  message: string;
}
