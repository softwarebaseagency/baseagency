"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bug, Download, Printer, RefreshCw, Search, UserCheck, Clock3, CalendarDays, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { BrandInput } from "@/components/ui/form-controls";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeader } from "@/components/ui/page-header";

type AttendanceLog = {
  id: string;
  employeeCode: string;
  employeeName: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  attendanceDate: string;
  rawTimestamp: string;
  status: "PRESENT" | "LATE" | "ABSENT";
  deviceName: string;
  deviceSerialNumber: string;
};

type Summary = {
  todayAttendanceCount: number;
  weeklyAttendanceCount: number;
  monthlyAttendanceCount: number;
  lateEmployeesCount: number;
  activeEmployeesCount: number;
  absentEmployeesCount: number;
  scheduleConfigured: boolean;
  devices?: Array<{
    name: string;
    serialNumber: string | null;
    ipAddress: string;
    status: string;
    lastHeartbeatAt: string | null;
    lastRealDeviceRequestAt: string | null;
    onlineNow: boolean;
  }>;
};

type AttendancePerson = {
  id: string;
  userId: string;
  name: string;
  department: string | null;
  position: string | null;
  updatedAt: string;
  deviceName: string | null;
  serialNumber: string | null;
  lastPunchAt: string | null;
  punchCount: number;
};

const emptySummary: Summary = {
  todayAttendanceCount: 0,
  weeklyAttendanceCount: 0,
  monthlyAttendanceCount: 0,
  lateEmployeesCount: 0,
  activeEmployeesCount: 0,
  absentEmployeesCount: 0,
  scheduleConfigured: false
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
}

function formatTime(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function statusTone(status: AttendanceLog["status"]): "positive" | "warning" | "danger" {
  if (status === "PRESENT") return "positive";
  if (status === "LATE") return "warning";
  return "danger";
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function StatCard({ label, value, note, icon: Icon }: { label: string; value: number; note?: string; icon: typeof UserCheck }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-brand-yellow" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">{label}</p>
          <p className="mt-4 text-3xl font-semibold text-ink-primary">{value.toLocaleString()}</p>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-surface-muted text-ink-primary">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {note ? <p className="mt-3 text-xs text-ink-muted">{note}</p> : null}
    </Card>
  );
}

export function AdminAttendanceClient() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [people, setPeople] = useState<AttendancePerson[]>([]);
  const [summary, setSummary] = useState<Summary>(emptySummary);
  const [searchName, setSearchName] = useState("");
  const [searchId, setSearchId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [generatedAt, setGeneratedAt] = useState("");

  const combinedSearch = useMemo(() => [searchName, searchId].filter(Boolean).join(" "), [searchName, searchId]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");

    const params = new URLSearchParams();
    if (combinedSearch) params.set("search", combinedSearch);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    params.set("limit", "100");

    try {
      const [attendanceResponse, summaryResponse, peopleResponse] = await Promise.all([
        fetch(`/api/admin/attendance?${params.toString()}`),
        fetch("/api/admin/attendance/summary"),
        fetch(`/api/admin/attendance/people?${params.toString()}`)
      ]);

      const attendanceData = await attendanceResponse.json();
      const summaryData = await summaryResponse.json();
      const peopleData = await peopleResponse.json();

      if (!attendanceResponse.ok) throw new Error(attendanceData.message || "Unable to load attendance records.");
      if (!summaryResponse.ok) throw new Error(summaryData.message || "Unable to load attendance summary.");
      if (!peopleResponse.ok) throw new Error(peopleData.message || "Unable to load people list.");

      setLogs(attendanceData.logs || []);
      setPeople(peopleData.people || []);
      setSummary(summaryData.summary || emptySummary);
      setMessage(
        attendanceData.databaseAvailable === false || summaryData.databaseAvailable === false
          ? "Database is not reachable. Showing an empty attendance view until PostgreSQL is connected."
          : "Attendance data refreshed."
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load attendance.");
    } finally {
      setLoading(false);
    }
  }, [combinedSearch, endDate, startDate]);

  useEffect(() => {
    setGeneratedAt(new Date().toLocaleString());
    loadData();
  }, [loadData]);

  const exportAttendance = async () => {
    setError("");
    try {
      const response = await fetch("/api/admin/attendance/export", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ search: combinedSearch, startDate, endDate })
      });

      if (!response.ok) throw new Error("Unable to export attendance.");
      const blob = await response.blob();
      downloadBlob(blob, `attendance-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
      setMessage("Attendance export generated.");
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Unable to export attendance.");
    }
  };

  const printReport = () => window.print();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin / Protected Attendance"
        title="ZKTeco Attendance"
        description="Private admin dashboard for SpeedFace V5L attendance received through the local ADMS bridge."
        actions={
          <Link className="focus-brand inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink-primary" href="/admin/attendance/debug">
            <Bug className="h-4 w-4" /> Debug logs
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Today" value={summary.todayAttendanceCount} icon={UserCheck} />
        <StatCard label="This Week" value={summary.weeklyAttendanceCount} icon={CalendarDays} />
        <StatCard label="This Month" value={summary.monthlyAttendanceCount} icon={CalendarDays} />
        <StatCard label="Late Employees" value={summary.lateEmployeesCount} icon={Clock3} />
        <StatCard label="Registered People" value={summary.activeEmployeesCount} icon={Users} />
      </div>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>SpeedFace V5L Device</CardTitle>
            <p className="mt-1 text-sm text-ink-muted">
              {summary.devices?.[0]
                ? `${summary.devices[0].name} | SN ${summary.devices[0].serialNumber || "-"} | Expected device IP 192.168.1.201`
                : "Waiting for the first ADMS request from the device."}
            </p>
            {summary.devices?.[0] && !summary.devices[0].onlineNow ? (
              <p className="mt-1 text-xs text-ink-muted">Bridge is reachable, but no real request from 192.168.1.201 has reached the website in the last 2 minutes.</p>
            ) : null}
          </div>
          <Badge tone={summary.devices?.[0]?.onlineNow ? "positive" : "danger"}>
            {summary.devices?.[0]?.onlineNow ? "Online" : "Offline"}
          </Badge>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Filters & Actions</CardTitle>
              <p className="mt-1 text-sm text-ink-muted">Search by name or user ID, filter by date range, refresh, export, or print the current report.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="focus-brand inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink-primary" onClick={loadData} type="button">
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
              <button className="focus-brand inline-flex h-10 items-center gap-2 rounded-md border border-brand-yellow bg-brand-yellow px-3 text-sm font-semibold text-brand-navy" onClick={exportAttendance} type="button">
                <Download className="h-4 w-4" /> Export Excel
              </button>
              <button className="focus-brand inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink-primary" onClick={printReport} type="button">
                <Printer className="h-4 w-4" /> Print
              </button>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <BrandInput label="Search name" value={searchName} onChange={(event) => setSearchName(event.target.value)} />
            <BrandInput label="Search employee/user ID" value={searchId} onChange={(event) => setSearchId(event.target.value)} />
            <BrandInput label="Start date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            <BrandInput label="End date" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <Search className="h-4 w-4" />
            <span>{logs.length} record(s) in the current view.</span>
          </div>
        </div>
      </Card>

      {error ? <Card><p className="text-sm font-semibold text-rose-700">{error}</p></Card> : null}
      {message && !error ? <Card><p className="text-sm font-semibold text-ink-primary">{message}</p></Card> : null}

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>People from ZKTeco</CardTitle>
            <p className="mt-1 text-sm text-ink-muted">Shows every person received from the SpeedFace device, with name, user ID, device, last punch, and total punches.</p>
          </div>
          <Badge tone={people.length ? "positive" : "default"}>{people.length} people shown</Badge>
        </div>

        {loading ? (
          <div className="mt-4"><LoadingSkeleton count={2} /></div>
        ) : people.length ? (
          <>
            <div className="mt-4 hidden overflow-hidden rounded-lg border border-line md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead className="bg-surface-muted text-xs uppercase tracking-[0.16em] text-ink-muted">
                    <tr>
                      {["User ID", "Name", "Department", "Position", "Last punch", "Punches", "Device"].map((header) => (
                        <th key={header} className="px-4 py-3 text-start font-semibold">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {people.map((person) => (
                      <tr key={person.id} className="text-ink-muted">
                        <td className="px-4 py-3">{person.userId}</td>
                        <td className="px-4 py-3 font-semibold text-ink-primary">{person.name}</td>
                        <td className="px-4 py-3">{person.department || "-"}</td>
                        <td className="px-4 py-3">{person.position || "-"}</td>
                        <td className="px-4 py-3">{person.lastPunchAt ? `${formatDate(person.lastPunchAt)} ${formatTime(person.lastPunchAt)}` : "-"}</td>
                        <td className="px-4 py-3">{person.punchCount.toLocaleString()}</td>
                        <td className="px-4 py-3">{person.deviceName || person.serialNumber || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:hidden">
              {people.map((person) => (
                <Card key={person.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink-primary">{person.name}</p>
                      <p className="mt-1 text-xs text-ink-muted">User ID {person.userId}</p>
                    </div>
                    <Badge tone="info">{person.punchCount} punches</Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs text-ink-muted">Department</p><p className="font-semibold text-ink-primary">{person.department || "-"}</p></div>
                    <div><p className="text-xs text-ink-muted">Position</p><p className="font-semibold text-ink-primary">{person.position || "-"}</p></div>
                    <div className="col-span-2"><p className="text-xs text-ink-muted">Last punch</p><p className="font-semibold text-ink-primary">{person.lastPunchAt ? `${formatDate(person.lastPunchAt)} ${formatTime(person.lastPunchAt)}` : "-"}</p></div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-4">
            <EmptyState title="No people received yet" description="When the SpeedFace sends user or attendance records, each person will appear here with their name and details." />
          </div>
        )}
      </Card>

      <div className="print-report">
        <div className="mb-4 hidden print:block">
          <h1 className="text-2xl font-semibold text-ink-primary">Base Agency Attendance Report</h1>
          <p className="mt-2 text-sm text-ink-muted">Range: {startDate || "Start"} to {endDate || "Today"} | Generated: {generatedAt || "-"}</p>
        </div>

        {loading ? (
          <LoadingSkeleton count={4} />
        ) : logs.length ? (
          <>
            <div className="hidden overflow-hidden rounded-lg border border-line bg-surface-card shadow-soft md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead className="bg-surface-muted text-xs uppercase tracking-[0.16em] text-ink-muted">
                    <tr>
                      {["Employee/User ID", "Name", "Check-in time", "Check-out time", "Date", "Device name", "Status"].map((header) => (
                        <th key={header} className="px-4 py-3 text-start font-semibold">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {logs.map((log) => (
                      <tr key={log.id} className="text-ink-muted">
                        <td className="px-4 py-3">{log.employeeCode}</td>
                        <td className="px-4 py-3 font-semibold text-ink-primary">{log.employeeName}</td>
                        <td className="px-4 py-3">{formatTime(log.checkInTime)}</td>
                        <td className="px-4 py-3">{formatTime(log.checkOutTime)}</td>
                        <td className="px-4 py-3">{formatDate(log.attendanceDate)}</td>
                        <td className="px-4 py-3">{log.deviceName}</td>
                        <td className="px-4 py-3"><Badge tone={statusTone(log.status)}>{log.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-3 md:hidden">
              {logs.map((log) => (
                <Card key={log.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink-primary">{log.employeeName}</p>
                      <p className="mt-1 text-xs text-ink-muted">{log.employeeCode} | {formatDate(log.attendanceDate)}</p>
                    </div>
                    <Badge tone={statusTone(log.status)}>{log.status}</Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs text-ink-muted">Check-in</p><p className="font-semibold text-ink-primary">{formatTime(log.checkInTime)}</p></div>
                    <div><p className="text-xs text-ink-muted">Check-out</p><p className="font-semibold text-ink-primary">{formatTime(log.checkOutTime)}</p></div>
                    <div className="col-span-2"><p className="text-xs text-ink-muted">Device</p><p className="font-semibold text-ink-primary">{log.deviceName}</p></div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <EmptyState title="No attendance data yet" description="No production attendance records are shown until the local ZKTeco ADMS bridge forwards real device data." />
        )}
      </div>
    </div>
  );
}
