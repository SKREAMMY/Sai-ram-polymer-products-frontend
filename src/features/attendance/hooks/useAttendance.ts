import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  attendanceApi,
  type CreateAttendancePayload,
  type UpdateAttendancePayload,
  type BulkAttendancePayload,
} from "../api/attendance.api";
import toast from "react-hot-toast";

export function useDailyAttendance(date: string) {
  return useQuery({
    queryKey: ["attendance-daily", date],
    queryFn: () => attendanceApi.getDaily(date).then((r) => r.data.data),
  });
}

export function useEmployeeAttendance(id: string, from: string, to: string) {
  return useQuery({
    queryKey: ["attendance-employee", id, from, to],
    queryFn: () =>
      attendanceApi
        .getEmployeeAttendance(id, from, to)
        .then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useCreateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAttendancePayload) =>
      attendanceApi.create(payload).then((r) => r.data.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["attendance-daily", variables.log_date],
      });
      queryClient.invalidateQueries({ queryKey: ["daily-summary"] });
      toast.success("Attendance marked");
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || "Failed to mark attendance");
    },
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
      
    }: {
      id: string;
      payload: UpdateAttendancePayload;
      date: string;
    }) => attendanceApi.update(id, payload).then((r) => r.data.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["attendance-daily", variables.date],
      });
      queryClient.invalidateQueries({ queryKey: ["daily-summary"] });
      toast.success("Attendance updated");
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(
        err?.response?.data?.message || "Failed to update attendance"
      );
    },
  });
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) =>
      attendanceApi.delete(id).then(() => ({ date })),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["attendance-daily", variables.date],
      });
      queryClient.invalidateQueries({ queryKey: ["daily-summary"] });
      toast.success("Attendance removed");
    },
    onError: () => toast.error("Failed to remove attendance"),
  });
}

export function useBulkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkAttendancePayload) =>
      attendanceApi.bulk(payload).then((r) => r.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["attendance-daily", variables.log_date],
      });
      queryClient.invalidateQueries({ queryKey: ["daily-summary"] });
      toast.success("Bulk attendance marked");
    },
    onError: () => toast.error("Failed to mark bulk attendance"),
  });
}
