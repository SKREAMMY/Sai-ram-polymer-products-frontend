import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  employeesApi,
  type EmployeeFilters,
  type CreateEmployeePayload,
  type UpdateEmployeePayload,
} from "../api/employees.api";
import toast from "react-hot-toast";

export function useEmployees(filters?: EmployeeFilters) {
  return useQuery({
    queryKey: ["employees", filters],
    queryFn: () => employeesApi.list(filters).then((r) => r.data.data),
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ["employees", id],
    queryFn: () => employeesApi.get(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useEmployeeSummary(id: string, month?: string) {
  return useQuery({
    queryKey: ["employee-summary", id, month],
    queryFn: () => employeesApi.getSummary(id, month).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEmployeePayload) =>
      employeesApi.create(payload).then((r) => r.data.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success(`${data.full_name} added successfully`);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || "Failed to create employee");
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateEmployeePayload;
    }) => employeesApi.update(id, payload).then((r) => r.data.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success(`${data.full_name} updated successfully`);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || "Failed to update employee");
    },
  });
}
