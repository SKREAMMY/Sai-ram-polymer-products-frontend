import { useState } from "react";
import type { AttendanceLog, AttendanceStatus } from "../../../types";
import Button from "../../../shared/components/ui/Button";
import Input from "../../../shared/components/ui/Input";

interface AttendanceFormProps {
  employeeName: string;
  date: string;
  initial?: AttendanceLog;
  onSubmit: (data: {
    status: AttendanceStatus;
    clock_in?: string;
    clock_out?: string;
    notes?: string;
  }) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function AttendanceForm({
  employeeName,
  date,
  initial,
  onSubmit,
  onCancel,
  loading,
}: AttendanceFormProps) {
  const [status, setStatus] = useState<AttendanceStatus>(
    initial?.status ?? "present",
  );
  const [clockIn, setClockIn] = useState(
    initial?.clock_in?.slice(0, 5) ?? "09:00",
  );
  const [clockOut, setClockOut] = useState(
    initial?.clock_out?.slice(0, 5) ?? "18:00",
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState("");

  const needsClock = status === "present";

  const previewHours = (() => {
    if (!needsClock || !clockIn || !clockOut) return null;
    const [ih, im] = clockIn.split(":").map(Number);
    const [oh, om] = clockOut.split(":").map(Number);
    const mins = oh * 60 + om - (ih * 60 + im);
    if (mins <= 0) return null;
    return (mins / 60).toFixed(2);
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (needsClock) {
      if (!clockIn || !clockOut) {
        setError("Clock-in and clock-out are required");
        return;
      }
      const [ih, im] = clockIn.split(":").map(Number);
      const [oh, om] = clockOut.split(":").map(Number);
      if (oh * 60 + om <= ih * 60 + im) {
        setError("Clock-out must be after clock-in");
        return;
      }
    }
    onSubmit({
      status,
      clock_in: needsClock ? clockIn : undefined,
      clock_out: needsClock ? clockOut : undefined,
      notes: notes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="px-4 py-3 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium text-gray-900">{employeeName}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div>
        <label className="label">Status</label>
        <div className="grid grid-cols-3 gap-2">
          {(["present", "absent", "leave"] as AttendanceStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`py-2 rounded-lg text-sm font-medium border transition-colors capitalize ${
                status === s
                  ? s === "present"
                    ? "bg-green-600 text-white border-green-600"
                    : s === "absent"
                      ? "bg-red-600  text-white border-red-600"
                      : "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {needsClock && (
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Clock in"
            type="time"
            value={clockIn}
            onChange={(e) => setClockIn(e.target.value)}
            required
          />
          <Input
            label="Clock out"
            type="time"
            value={clockOut}
            onChange={(e) => setClockOut(e.target.value)}
            required
          />
        </div>
      )}

      {needsClock && previewHours && (
        <div className="px-4 py-2.5 bg-primary-50 rounded-lg">
          <p className="text-sm text-primary-700">
            Hours worked: <span className="font-semibold">{previewHours}h</span>
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <label className="label">Notes (optional)</label>
        <textarea
          className="input resize-none"
          rows={2}
          placeholder="e.g. left early, worked from home..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-3 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initial ? "Update" : "Mark attendance"}
        </Button>
      </div>
    </form>
  );
}
