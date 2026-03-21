import type { Employee } from "../../../types";
import type { CreateEmployeePayload } from "../api/employees.api";
import { useState } from "react";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";

interface EmployeeFormProps {
  initial?: Employee;
  onSubmit: (data: CreateEmployeePayload) => void;
  onCancel: () => void;
  loading?: boolean;
}

const DEPARTMENTS = [
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

export default function EmployeeForm({
  initial,
  onSubmit,
  onCancel,
  loading,
}: EmployeeFormProps) {
  const [form, setForm] = useState({
    full_name: initial?.full_name ?? "",
    phone: initial?.phone ?? "",
    position: initial?.position ?? "",
    department: initial?.department ?? "",
    monthly_salary: initial?.monthly_salary
      ? String(initial.monthly_salary)
      : "",
    joined_at: initial?.joined_at ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.full_name.trim()) e.full_name = "Name is required";
    if (!form.monthly_salary) e.monthly_salary = "Monthly salary is required";
    if (Number(form.monthly_salary) <= 0)
      e.monthly_salary = "Salary must be greater than 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      full_name: form.full_name.trim(),
      phone: form.phone || undefined,
      position: form.position || undefined,
      department: form.department || undefined,
      monthly_salary: Number(form.monthly_salary),
      joined_at: form.joined_at || undefined,
    });
  };

  const dailyRate =
    Number(form.monthly_salary) > 0
      ? (Number(form.monthly_salary) / 26).toFixed(2)
      : "0.00";
  const hourlyRate =
    Number(form.monthly_salary) > 0
      ? (Number(form.monthly_salary) / 26 / 8).toFixed(2)
      : "0.00";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full name"
        placeholder="e.g. Ravi Kumar"
        value={form.full_name}
        onChange={(e) => set("full_name", e.target.value)}
        error={errors.full_name}
        required
        autoFocus
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Phone"
          placeholder="+91 98765 43210"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
        />
        <Input
          label="Joined date"
          type="date"
          value={form.joined_at}
          onChange={(e) => set("joined_at", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Position"
          placeholder="e.g. Developer"
          value={form.position}
          onChange={(e) => set("position", e.target.value)}
        />
        <div>
          <label className="label">Department</label>
          <select
            className="input"
            value={form.department}
            onChange={(e) => set("department", e.target.value)}
          >
            <option value="">Select department</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Input
          label="Monthly salary (₹)"
          type="number"
          placeholder="e.g. 25000"
          value={form.monthly_salary}
          onChange={(e) => set("monthly_salary", e.target.value)}
          error={errors.monthly_salary}
          required
          min={1}
        />
        {Number(form.monthly_salary) > 0 && (
          <div className="mt-2 flex gap-4">
            <p className="text-xs text-gray-500">
              Daily rate:{" "}
              <span className="font-medium text-gray-700">₹{dailyRate}</span>
            </p>
            <p className="text-xs text-gray-500">
              Hourly rate:{" "}
              <span className="font-medium text-gray-700">₹{hourlyRate}</span>
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initial ? "Save changes" : "Add employee"}
        </Button>
      </div>
    </form>
  );
}
