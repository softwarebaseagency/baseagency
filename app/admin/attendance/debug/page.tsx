import { AdminAttendanceDebugClient } from "@/components/admin/admin-attendance-debug-client";
import { requireAdmin } from "@/lib/admin-auth";

export default function AdminAttendanceDebugPage() {
  requireAdmin();
  return <AdminAttendanceDebugClient />;
}
