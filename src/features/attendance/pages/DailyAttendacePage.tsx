import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  RefreshCw,
  UserCheck,
  UserX,
  Calendar,
} from "lucide-react";
import {
  useDailyAttendance,
  useCreateAttendance,
  useUpdateAttendance,
  useDeleteAttendance,
  useBulkAttendance,
} from "../hooks/useAttendance";
import { useEmployees } from "../../employees/hooks/useEmployees";
import AttendanceForm from "../components/AttendanceForm";
import Modal from "../../../shared/components/ui/Modal";
import StatusBadge from "../../../shared/components/ui/StatusBadge";
import Button from "../../../shared/components/ui/Button";
import { formatCurrency } from "../../../shared/utils/format";
import type { Employee, AttendanceLog, AttendanceStatus } from "../../../types";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface MarkTarget {
  employee: Employee;
  existing?: AttendanceLog;
}

export default function DailyAttendancePage() {
  const [date, setDate] = useState(todayStr());
  const [markTarget, setMarkTarget] = useState<MarkTarget | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const {
    data: logs = [],
    isLoading: logsLoading,
    refetch,
    isFetching,
  } = useDailyAttendance(date);
  const { data: employeesData, isLoading: empsLoading } = useEmployees({
    limit: 100,
  });
  const employees = employeesData?.data ?? [];

  const createAttendance = useCreateAttendance();
  const updateAttendance = useUpdateAttendance();
  const deleteAttendance = useDeleteAttendance();
  const bulkAttendance = useBulkAttendance();

  const logMap = new Map(logs.map((l) => [l.employee_id, l]));

  const isToday = date === todayStr();
  const isLoading = logsLoading || empsLoading;

  const goDay = (dir: number) => {
    const d = new Date(date + "T00:00:00");
    d.setDate(d.getDate() + dir);
    if (dir > 0 && d > new Date()) return;
    setDate(d.toISOString().slice(0, 10));
  };

  const handleSubmit = async (data: {
    status: AttendanceStatus;
    clock_in?: string;
    clock_out?: string;
    notes?: string;
  }) => {
    if (!markTarget) return;
    const existing = markTarget.existing;
    if (existing) {
      await updateAttendance.mutateAsync({
        id: existing.id,
        payload: data,
        date,
      });
    } else {
      await createAttendance.mutateAsync({
        employee_id: markTarget.employee.id,
        log_date: date,
        ...data,
      });
    }
    setMarkTarget(null);
  };

  const handleDelete = async (logId: string) => {
    await deleteAttendance.mutateAsync({ id: logId, date });
    setConfirming(null);
  };

  const handleBulkPresent = async () => {
    const unmarked = employees.filter((e) => !logMap.has(e.id));
    if (unmarked.length === 0) return;
    await bulkAttendance.mutateAsync({
      log_date: date,
      entries: unmarked.map((e) => ({
        employee_id: e.id,
        status: "present" as const,
        clock_in: "09:00",
        clock_out: "18:00",
      })),
    });
  };

  const handleBulkAbsent = async () => {
    const unmarked = employees.filter((e) => !logMap.has(e.id));
    if (unmarked.length === 0) return;
    await bulkAttendance.mutateAsync({
      log_date: date,
      entries: unmarked.map((e) => ({
        employee_id: e.id,
        status: "absent" as const,
      })),
    });
  };

  const markedCount = logs.length;
  const unmarkedCount = employees.length - markedCount;
  const totalPay = logs.reduce((sum, l) => sum + Number(l.day_pay), 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-sm text-gray-500 mt-1">
            {markedCount} marked · {unmarkedCount} pending
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600
                     bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => goDay(-1)}
            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
          >
            <ChevronLeft size={16} className="text-gray-600" />
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg">
            <CalendarDays size={15} className="text-primary-600" />
            <span className="text-sm font-medium text-gray-700">
              {fmtDate(date)}
            </span>
            {isToday && (
              <span className="ml-1 px-1.5 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full font-medium">
                Today
              </span>
            )}
          </div>
          <button
            onClick={() => goDay(1)}
            disabled={isToday}
            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronRight size={16} className="text-gray-600" />
          </button>
        </div>

        {unmarkedCount > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleBulkAbsent}
              loading={bulkAttendance.isPending}
            >
              <UserX size={14} />
              Mark all absent
            </Button>
            <Button
              size="sm"
              onClick={handleBulkPresent}
              loading={bulkAttendance.isPending}
            >
              <UserCheck size={14} />
              Mark all present
            </Button>
          </div>
        )}
      </div>

      {!isLoading && (
        <div className="flex gap-3 mb-5">
          {[
            {
              label: "Present",
              count: logs.filter((l) => l.status === "present").length,
              color: "text-green-700 bg-green-50",
            },
            {
              label: "Absent",
              count: logs.filter((l) => l.status === "absent").length,
              color: "text-red-700   bg-red-50",
            },
            {
              label: "Leave",
              count: logs.filter((l) => l.status === "leave").length,
              color: "text-blue-700  bg-blue-50",
            },
            {
              label: "Pending",
              count: unmarkedCount,
              color: "text-amber-700 bg-amber-50",
            },
          ].map(({ label, count, color }) => (
            <div
              key={label}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${color}`}
            >
              {count} {label}
            </div>
          ))}
          <div className="ml-auto px-3 py-1.5 rounded-lg text-xs font-medium text-teal-700 bg-teal-50">
            Total pay: {formatCurrency(totalPay)}
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-gray-100">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-4 animate-pulse"
              >
                <div className="w-9 h-9 bg-gray-200 rounded-full" />
                <div className="flex-1 h-4 bg-gray-200 rounded w-40" />
                <div className="h-6 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>
        ) : employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-gray-500">
              No employees found. Add employees first.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {employees.map((emp) => {
              const log = logMap.get(emp.id);
              return (
                <div
                  key={emp.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div
                    className="w-9 h-9 rounded-full bg-primary-100 flex items-center
                                  justify-center text-primary-700 font-semibold text-sm shrink-0"
                  >
                    {emp.full_name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {emp.full_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {emp.employee_code} · {emp.department ?? "No dept"}
                    </p>
                  </div>

                  {log ? (
                    <>
                      <div className="text-right shrink-0">
                        {log.clock_in && log.clock_out ? (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={11} />
                            {log.clock_in.slice(0, 5)} –{" "}
                            {log.clock_out.slice(0, 5)}
                          </p>
                        ) : null}
                        {Number(log.day_pay) > 0 && (
                          <p className="text-xs font-medium text-teal-700 mt-0.5">
                            {formatCurrency(log.day_pay)}
                          </p>
                        )}
                      </div>

                      <StatusBadge status={log.status} />

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() =>
                            setMarkTarget({ employee: emp, existing: log })
                          }
                          className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-white
                                     border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirming(log.id)}
                          className="px-2.5 py-1 text-xs font-medium text-red-600 bg-white
                                     border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 ml-auto">
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg font-medium flex items-center gap-1">
                        <Calendar size={11} />
                        Not marked
                      </span>
                      <button
                        onClick={() => setMarkTarget({ employee: emp })}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-primary-600
                                   rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Mark
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={!!markTarget}
        onClose={() => setMarkTarget(null)}
        title={markTarget?.existing ? "Edit attendance" : "Mark attendance"}
        size="sm"
      >
        {markTarget && (
          <AttendanceForm
            employeeName={markTarget.employee.full_name}
            date={date}
            initial={markTarget.existing}
            onSubmit={handleSubmit}
            onCancel={() => setMarkTarget(null)}
            loading={createAttendance.isPending || updateAttendance.isPending}
          />
        )}
      </Modal>

      <Modal
        open={!!confirming}
        onClose={() => setConfirming(null)}
        title="Remove attendance"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-5">
          Are you sure you want to remove this attendance record? This cannot be
          undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirming(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={deleteAttendance.isPending}
            onClick={() => confirming && handleDelete(confirming)}
          >
            Remove
          </Button>
        </div>
      </Modal>
    </div>
  );
}
