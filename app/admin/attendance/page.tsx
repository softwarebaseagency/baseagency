import { requireAdmin } from "@/lib/admin-auth";
import { AdminAttendanceClient } from "@/components/admin/admin-attendance-client";

export default function AdminAttendancePage() {
  requireAdmin();
  return <AdminAttendanceClient />;
}
