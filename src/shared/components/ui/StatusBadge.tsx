import { type AttendanceStatus, type SalaryStatus } from "../../../types";

type Status = AttendanceStatus | SalaryStatus;

const labels: Record<Status, string> = {
  present: "Present",
  absent: "Absent",
  leave: "Leave",
  draft: "Draft",
  approved: "Approved",
  paid: "Paid",
};

const styles: Record<Status, string> = {
  present: "badge-present",
  absent: "badge-absent",
  leave: "badge-leave",
  draft: "badge-draft",
  approved: "badge-approved",
  paid: "badge-paid",
};

export default function StatusBadge({ status }: { status: Status }) {
  return <span className={styles[status]}>{labels[status]}</span>;
}
