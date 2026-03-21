import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Users,
  Phone,
  Building2,
  ChevronRight,
} from "lucide-react";
import {
  useEmployees,
  useCreateEmployee,
  useUpdateEmployee,
} from "../hooks/useEmployees";
import EmployeeForm from "../components/EmployeeForm";
import Modal from "../../../shared/components/ui/Modal";
import Button from "../../../shared/components/ui/Button";
import type { Employee } from "../../../types";
import type { CreateEmployeePayload } from "../api/employees.api";
import { formatCurrency } from "../../../shared/utils/format";

const DEPARTMENTS = [
  "All",
  "Engineering",
  "Design",
  "Management",
  "Sales",
  "Marketing",
  "Operations",
  "Finance",
  "HR",
  "Other",
];

export default function EmployeesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);

  const { data, isLoading } = useEmployees({
    search: search || undefined,
    department: department || undefined,
  });

  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();

  const employees = data?.data ?? [];

  const handleCreate = async (payload: CreateEmployeePayload) => {
    await createEmployee.mutateAsync(payload);
    setShowCreate(false);
  };

  const handleUpdate = async (payload: CreateEmployeePayload) => {
    if (!editTarget) return;
    await updateEmployee.mutateAsync({ id: editTarget.id, payload });
    setEditTarget(null);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500 mt-1">
            {data?.total ?? 0} total employees
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={16} />
          Add employee
        </Button>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            className="input pl-9"
            placeholder="Search by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-44"
          value={department}
          onChange={(e) =>
            setDepartment(e.target.value === "All" ? "" : e.target.value)
          }
        >
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d === "All" ? "" : d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-gray-100">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-4 animate-pulse"
              >
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-40" />
                  <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No employees found</p>
            <p className="text-gray-400 text-sm mt-1">
              {search || department
                ? "Try adjusting your filters"
                : "Add your first employee to get started"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {employees.map((emp) => (
              <div
                key={emp.id}
                onClick={() => navigate(`/employees/${emp.id}`)}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50
                           cursor-pointer transition-colors group"
              >
                <div
                  className="w-10 h-10 rounded-full bg-primary-100 flex items-center
                                justify-center text-primary-700 font-semibold text-sm shrink-0"
                >
                  {emp.full_name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 truncate">
                      {emp.full_name}
                    </p>
                    <span className="text-xs text-gray-400 shrink-0">
                      {emp.employee_code}
                    </span>
                    {!emp.is_active && (
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    {emp.position && (
                      <span className="text-sm text-gray-500 truncate">
                        {emp.position}
                      </span>
                    )}
                    {emp.department && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Building2 size={11} />
                        {emp.department}
                      </span>
                    )}
                    {emp.phone && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Phone size={11} />
                        {emp.phone}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(emp.monthly_salary)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">per month</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditTarget(emp);
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white
                               border border-gray-200 rounded-lg hover:bg-gray-50
                               opacity-0 group-hover:opacity-100 transition-all"
                  >
                    Edit
                  </button>
                  <ChevronRight
                    size={16}
                    className="text-gray-300 group-hover:text-gray-400"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Add employee"
        size="md"
      >
        <EmployeeForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
          loading={createEmployee.isPending}
        />
      </Modal>

      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit employee"
        size="md"
      >
        <EmployeeForm
          initial={editTarget ?? undefined}
          onSubmit={handleUpdate}
          onCancel={() => setEditTarget(null)}
          loading={updateEmployee.isPending}
        />
      </Modal>
    </div>
  );
}
