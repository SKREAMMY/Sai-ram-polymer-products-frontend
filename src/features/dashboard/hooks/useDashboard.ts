import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard.api";

export function useDailySummary(date?: string) {
  return useQuery({
    queryKey: ["daily-summary", date],
    queryFn: () => dashboardApi.getDailySummary(date).then((r) => r.data.data),
  });
}
