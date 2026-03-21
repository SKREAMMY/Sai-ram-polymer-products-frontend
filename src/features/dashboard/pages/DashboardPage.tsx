import { useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Banknote,
  CalendarDays,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useDailySummary } from "../hooks/useDashboard";
import { useAuthStore } from "../../../store/auth.store";
import {
  formatDate,
  formatDisplayDate,
  formatCurrency,
} from "../../../shared/utils/format";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtext?: string;
}

function StatCard({ label, value, icon, color, subtext }: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [selectedDate, setDate] = useState(formatDate(new Date()));
  const { data, isLoading, refetch, isFetching } =
    useDailySummary(selectedDate);

  const goToPrevDay = () => {
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() - 1);
    setDate(formatDate(d));
  };

  const goToNextDay = () => {
    const d = new Date(selectedDate + "T00:00:00");
    const today = new Date();
    d.setDate(d.getDate() + 1);
    if (d <= today) setDate(formatDate(d));
  };

  const isToday = selectedDate === formatDate(new Date());

  const total = Number(data?.total_employees ?? 0);
  const present = Number(data?.present ?? 0);
  const absent = Number(data?.absent ?? 0);
  const onLeave = Number(data?.on_leave ?? 0);
  const notMarked = Number(data?.not_marked ?? 0);
  const totalPay = Number(data?.total_pay_for_day ?? 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good {getGreeting()}, {user?.full_name?.split(" ")[0]}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Here's what's happening today
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900
                     bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={goToPrevDay}
          className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={16} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg">
          <CalendarDays size={15} className="text-primary-600" />
          <span className="text-sm font-medium text-gray-700">
            {formatDisplayDate(selectedDate)}
          </span>
          {isToday && (
            <span className="ml-1 px-1.5 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full font-medium">
              Today
            </span>
          )}
        </div>
        <button
          onClick={goToNextDay}
          disabled={isToday}
          className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50
                     transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} className="text-gray-600" />
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label="Total employees"
            value={total}
            icon={<Users size={20} className="text-purple-600" />}
            color="bg-purple-50"
          />
          <StatCard
            label="Present"
            value={present}
            icon={<UserCheck size={20} className="text-green-600" />}
            color="bg-green-50"
            subtext={
              total > 0
                ? `${Math.round((present / total) * 100)}% attendance`
                : undefined
            }
          />
          <StatCard
            label="Absent"
            value={absent}
            icon={<UserX size={20} className="text-red-600" />}
            color="bg-red-50"
          />
          <StatCard
            label="On leave"
            value={onLeave}
            icon={<CalendarDays size={20} className="text-blue-600" />}
            color="bg-blue-50"
          />
          <StatCard
            label="Not marked yet"
            value={notMarked}
            icon={<Clock size={20} className="text-amber-600" />}
            color="bg-amber-50"
            subtext={notMarked > 0 ? "Needs attention" : "All marked"}
          />
          <StatCard
            label="Total pay today"
            value={formatCurrency(totalPay)}
            icon={<Banknote size={20} className="text-teal-600" />}
            color="bg-teal-50"
            subtext="Based on hours logged"
          />
        </div>
      )}

      {!isLoading && notMarked > 0 && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
          <Clock size={18} className="text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">
              {notMarked} employee{notMarked > 1 ? "s" : ""}
            </span>{" "}
            haven't been marked for today yet.{" "}
            <a
              href="/attendance/daily"
              className="underline font-medium hover:text-amber-900"
            >
              Mark attendance
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
