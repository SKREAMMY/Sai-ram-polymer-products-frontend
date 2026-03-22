import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollApi, type GeneratePayrollPayload } from "../api/payroll.api";
import toast from "react-hot-toast";

export function usePayrollByMonth(period: string) {
  return useQuery({
    queryKey: ["payroll", period],
    queryFn: () => payrollApi.getByMonth(period).then((r) => r.data.data),
    enabled: !!period,
  });
}

export function usePayrollByEmployee(period: string, employeeId: string) {
  return useQuery({
    queryKey: ["payroll", period, employeeId],
    queryFn: () =>
      payrollApi.getByEmployee(period, employeeId).then((r) => r.data.data),
    enabled: !!period && !!employeeId,
  });
}

export function useGeneratePayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GeneratePayrollPayload) =>
      payrollApi.generate(payload).then((r) => r.data.data),
    onSuccess: (_data, variables) => {
      const period = `${variables.period_year}-${String(
        variables.period_month
      ).padStart(2, "0")}`;
      queryClient.invalidateQueries({ queryKey: ["payroll", period] });
      toast.success("Payroll generated successfully");
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || "Failed to generate payroll");
    },
  });
}

export function useApprovePayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => payrollApi.approve(id).then((r) => r.data.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      toast.success(`${data.employee?.full_name ?? "Payroll"} approved`);
    },
    onError: () => toast.error("Failed to approve payroll"),
  });
}

export function useMarkPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      payrollApi.markPaid(id).then((r) => r.data.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      toast.success(`${data.employee?.full_name ?? "Payroll"} marked as paid`);
    },
    onError: () => toast.error("Failed to mark as paid"),
  });
}
