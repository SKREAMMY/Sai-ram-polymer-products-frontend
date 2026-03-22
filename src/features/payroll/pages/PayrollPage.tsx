import { useState } from "react";
import {
  Wallet,
  RefreshCw,
  ChevronDown,
  CheckCircle,
  Banknote,
  Clock,
  UserCheck,
  UserX,
  Calendar,
} from "lucide-react";
import {
  usePayrollByMonth,
  useGeneratePayroll,
  useApprovePayroll,
  useMarkPaid,
} from "../hooks/usePayroll";
import StatusBadge from "../../../shared/components/ui/StatusBadge";
import Button from "../../../shared/components/ui/Button";
import Modal from "../../../shared/components/ui/Modal";
import { formatCurrency } from "../../../shared/utils/format";
import type { SalaryRecord } from "../../../types";

function getCurrentPeriod() {
  return new Date().toISOString().slice(0, 7);
}

function periodToLabel(period: string) {
  const [year, month] = period.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

export default function PayrollPage() {
  const [period, setPeriod] = useState(getCurrentPeriod());
  const [selected, setSelected] = useState<SalaryRecord | null>(null);
  const [confirming, setConfirming] = useState<{
    action: "approve" | "paid";
    record: SalaryRecord;
  } | null>(null);

  const {
    data: records = [],
    isLoading,
    refetch,
    isFetching,
  } = usePayrollByMonth(period);
  const generatePayroll = useGeneratePayroll();
  const approvePayroll = useApprovePayroll();
  const markPaid = useMarkPaid();

  const [year, month] = period.split("-").map(Number);

  const handleGenerate = async () => {
    await generatePayroll.mutateAsync({
      period_year: year,
      period_month: month,
    });
  };

  const handleConfirm = async () => {
    if (!confirming) return;
    if (confirming.action === "approve") {
      await approvePayroll.mutateAsync(confirming.record.id);
    } else {
      await markPaid.mutateAsync(confirming.record.id);
    }
    setConfirming(null);
    setSelected(null);
  };

  const totalGross = records.reduce((sum, r) => sum + Number(r.gross_pay), 0);
  const totalPresent = records.reduce(
    (sum, r) => sum + Number(r.days_present),
    0,
  );
  const allApproved =
    records.length > 0 && records.every((r) => r.status !== "draft");
  const allPaid =
    records.length > 0 && records.every((r) => r.status === "paid");

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
          <p className="text-sm text-gray-500 mt-1">
            {records.length} records · {periodToLabel(period)}
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
        <div className="relative">
          <input
            type="month"
            className="input w-44 pr-8"
            value={period}
            max={getCurrentPeriod()}
            onChange={(e) => setPeriod(e.target.value)}
          />
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        <Button onClick={handleGenerate} loading={generatePayroll.isPending}>
          <Wallet size={15} />
          {records.length > 0 ? "Regenerate payroll" : "Generate payroll"}
        </Button>
      </div>

      {records.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
              <Banknote size={18} className="text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total gross pay</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(totalGross)}
              </p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
              <UserCheck size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total days present</p>
              <p className="text-lg font-bold text-gray-900">{totalPresent}</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <p className="text-lg font-bold text-gray-900">
                {allPaid ? "All paid" : allApproved ? "All approved" : "Draft"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-gray-100">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-4 animate-pulse"
              >
                <div className="w-9 h-9 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-36" />
                  <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
                <div className="h-6 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Wallet size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">
              No payroll for {periodToLabel(period)}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Click "Generate payroll" to create salary records for this month
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wide">
              <div className="col-span-2">Employee</div>
              <div className="text-center">Present</div>
              <div className="text-center">Absent</div>
              <div className="text-center">Hours</div>
              <div className="text-right">Gross pay</div>
              <div className="text-right">Status</div>
            </div>
            <div className="divide-y divide-gray-100">
              {records.map((record) => (
                <div
                  key={record.id}
                  onClick={() => setSelected(record)}
                  className="grid grid-cols-7 items-center px-5 py-3.5 hover:bg-gray-50
                             cursor-pointer transition-colors"
                >
                  <div className="col-span-2 flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full bg-primary-100 flex items-center
                                    justify-center text-primary-700 font-semibold text-sm shrink-0"
                    >
                      {record.employee?.full_name?.charAt(0).toUpperCase() ??
                        "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {record.employee?.full_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {record.employee?.employee_code}
                      </p>
                    </div>
                  </div>
                  <div className="text-center text-sm text-gray-700">
                    {record.days_present}
                  </div>
                  <div className="text-center text-sm text-gray-700">
                    {record.days_absent}
                  </div>
                  <div className="text-center text-sm text-gray-700">
                    {Number(record.total_hours).toFixed(1)}h
                  </div>
                  <div className="text-right text-sm font-semibold text-gray-900">
                    {formatCurrency(record.gross_pay)}
                  </div>
                  <div className="text-right">
                    <StatusBadge status={record.status} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Salary record"
        size="md"
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div
                className="w-12 h-12 rounded-xl bg-primary-100 flex items-center
                              justify-center text-primary-700 font-bold text-lg"
              >
                {selected.employee?.full_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {selected.employee?.full_name}
                </p>
                <p className="text-sm text-gray-500">
                  {selected.employee?.employee_code} ·{" "}
                  {selected.employee?.department}
                </p>
              </div>
              <div className="ml-auto">
                <StatusBadge status={selected.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Period",
                  value: periodToLabel(selected.period_label),
                },
                {
                  label: "Working days",
                  value: `${selected.working_days_in_month} days`,
                },
                {
                  label: "Monthly salary",
                  value: formatCurrency(selected.monthly_salary),
                },
                {
                  label: "Daily rate",
                  value: formatCurrency(selected.daily_rate),
                },
                {
                  label: "Hourly rate",
                  value: formatCurrency(selected.hourly_rate),
                },
                {
                  label: "Total hours",
                  value: `${Number(selected.total_hours).toFixed(1)}h`,
                },
              ].map(({ label, value }) => (
                <div key={label} className="px-3 py-2.5 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Days present",
                  value: selected.days_present,
                  icon: <UserCheck size={14} className="text-green-600" />,
                  color: "bg-green-50",
                },
                {
                  label: "Days absent",
                  value: selected.days_absent,
                  icon: <UserX size={14} className="text-red-600" />,
                  color: "bg-red-50",
                },
                {
                  label: "Days leave",
                  value: selected.days_leave,
                  icon: <Calendar size={14} className="text-blue-600" />,
                  color: "bg-blue-50",
                },
              ].map(({ label, value, icon, color }) => (
                <div
                  key={label}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg ${color}`}
                >
                  {icon}
                  <div>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-teal-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Banknote size={18} className="text-teal-600" />
                <span className="text-sm font-medium text-teal-800">
                  Gross pay
                </span>
              </div>
              <span className="text-xl font-bold text-teal-700">
                {formatCurrency(selected.gross_pay)}
              </span>
            </div>

            {selected.status !== "paid" && (
              <div className="flex justify-end gap-3 pt-1">
                {selected.status === "draft" && (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setConfirming({ action: "approve", record: selected })
                    }
                  >
                    <CheckCircle size={15} />
                    Approve
                  </Button>
                )}
                {selected.status === "approved" && (
                  <Button
                    onClick={() =>
                      setConfirming({ action: "paid", record: selected })
                    }
                  >
                    <Banknote size={15} />
                    Mark as paid
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={!!confirming}
        onClose={() => setConfirming(null)}
        title={
          confirming?.action === "approve" ? "Approve payroll" : "Mark as paid"
        }
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-5">
          {confirming?.action === "approve"
            ? `Are you sure you want to approve the payroll for ${confirming?.record.employee?.full_name}? This will lock the record.`
            : `Confirm that you have paid ${confirming?.record.employee?.full_name} ${formatCurrency(confirming?.record.gross_pay ?? 0)}.`}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirming(null)}>
            Cancel
          </Button>
          <Button
            loading={approvePayroll.isPending || markPaid.isPending}
            onClick={handleConfirm}
          >
            {confirming?.action === "approve" ? "Approve" : "Mark as paid"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
