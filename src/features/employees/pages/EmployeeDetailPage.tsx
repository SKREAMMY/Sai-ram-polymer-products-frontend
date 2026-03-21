import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Building2,
  Calendar,
  Clock,
  UserCheck,
  UserX,
  Banknote,
  Edit2,
} from "lucide-react";
import {
  useEmployee,
  useEmployeeSummary,
  useUpdateEmployee,
} from "../hooks/useEmployees";
import EmployeeForm from "../components/EmployeeForm";
import Modal from "../../../shared/components/ui/Modal";
import Button from "../../../shared/components/ui/Button";
import { formatCurrency } from "../../../shared/utils/format";
import type { CreateEmployeePayload } from "../api/employees.api";

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);
  const [month, setMonth] = useState(getCurrentMonth());

  const { data: employee, isLoading } = useEmployee(id!);
  const { data: summary } = useEmployeeSummary(id!, month);
  const updateEmployee = useUpdateEmployee();

  const handleUpdate = async (payload: CreateEmployeePayload) => {
    if (!id) return;
    await updateEmployee.mutateAsync({ id, payload });
    setShowEdit(false);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-48 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Employee not found.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <button
        onClick={() => navigate("/employees")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to employees
      </button>

      <div className="card p-6 mb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center
                            justify-center text-primary-700 font-bold text-2xl"
            >
              {employee.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">
                  {employee.full_name}
                </h1>
                {!employee.is_active && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm mt-0.5">
                {employee.position || "No position"} · {employee.employee_code}
              </p>
              <div className="flex items-center gap-4 mt-2">
                {employee.department && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Building2 size={12} />
                    {employee.department}
                  </span>
                )}
                {employee.phone && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone size={12} />
                    {employee.phone}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar size={12} />
                  Joined{" "}
                  {new Date(employee.joined_at).toLocaleDateString("en-IN")}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowEdit(true)}
          >
            <Edit2 size={14} />
            Edit
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500">Monthly salary</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">
              {formatCurrency(employee.monthly_salary)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Daily rate</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">
              {formatCurrency(employee.daily_rate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Hourly rate</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">
              {formatCurrency(employee.hourly_rate)}
            </p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">
            Monthly summary
          </h2>
          <input
            type="month"
            className="input w-40 text-sm"
            value={month}
            max={getCurrentMonth()}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Days present",
              value: summary?.days_present ?? 0,
              icon: <UserCheck size={18} className="text-green-600" />,
              color: "bg-green-50",
            },
            {
              label: "Days absent",
              value: summary?.days_absent ?? 0,
              icon: <UserX size={18} className="text-red-600" />,
              color: "bg-red-50",
            },
            {
              label: "Days leave",
              value: summary?.days_leave ?? 0,
              icon: <Calendar size={18} className="text-blue-600" />,
              color: "bg-blue-50",
            },
            {
              label: "Total hours",
              value: `${Number(summary?.total_hours ?? 0).toFixed(1)}h`,
              icon: <Clock size={18} className="text-amber-600" />,
              color: "bg-amber-50",
            },
            {
              label: "Gross pay",
              value: formatCurrency(summary?.gross_pay ?? 0),
              icon: <Banknote size={18} className="text-teal-600" />,
              color: "bg-teal-50",
            },
          ].map(({ label, value, icon, color }) => (
            <div
              key={label}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${color} shrink-0`}
              >
                {icon}
              </div>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit employee"
        size="md"
      >
        <EmployeeForm
          initial={employee}
          onSubmit={handleUpdate}
          onCancel={() => setShowEdit(false)}
          loading={updateEmployee.isPending}
        />
      </Modal>
    </div>
  );
}
