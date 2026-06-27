"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, HardDrive, Play, RefreshCw, Settings, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BrandTabs } from "@/components/ui/brand-tabs";
import { Card, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { BrandInput, BrandSelect } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { useLanguage } from "@/components/i18n/language-provider";
import { formatDate } from "@/lib/utils";

type Device = {
  name: string;
  ipAddress: string;
  port: number;
  status: string;
  lastSeenAt: string | null;
};

type AttendanceLog = {
  id: string;
  device: Device | null;
  zktecoUserId: string;
  employeeName: string | null;
  attendanceTimestamp: string;
  attendanceDate: string;
  attendanceTime: string;
  punchType: string | null;
  syncBatchId: string | null;
  syncStatus: string | null;
  createdAt: string;
};

type ZktecoUser = {
  id: string;
  device: Device | null;
  zktecoUserId: string;
  name: string | null;
  cardNumber: string | null;
  privilege: string | null;
  lastSyncedAt: string;
};

type SyncHistory = {
  id: string;
  batchId: string;
  device: Device | null;
  startedAt: string;
  finishedAt: string | null;
  status: string;
  logsFetched: number;
  logsInserted: number;
  duplicatesSkipped: number;
  usersFetched: number;
  usersInserted: number;
  errorMessage: string | null;
};

type Summary = {
  totalLogs: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  latestSyncTime: string | null;
  deviceStatus: string;
  successfulSyncCount: number;
  failedSyncCount: number;
};

const emptySummary: Summary = {
  totalLogs: 0,
  todayCheckIns: 0,
  todayCheckOuts: 0,
  latestSyncTime: null,
  deviceStatus: "UNKNOWN",
  successfulSyncCount: 0,
  failedSyncCount: 0
};

const syncStatuses = [
  "SUCCESS",
  "DEVICE_OFFLINE",
  "WRONG_IP",
  "TIMEOUT",
  "API_TOKEN_INVALID",
  "DATABASE_ERROR",
  "PARTIAL_SYNC",
  "FAILED",
  "PENDING"
];

function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function statusTone(status?: string | null): "positive" | "warning" | "danger" | "default" | "info" {
  if (!status) return "default";
  if (status === "SUCCESS" || status === "ONLINE") return "positive";
  if (status === "PENDING" || status === "PARTIAL_SYNC" || status === "TIMEOUT") return "warning";
  if (status === "UNKNOWN") return "info";
  return "danger";
}

function prettyStatus(status?: string | null) {
  return status ? status.replace(/_/g, " ").toLowerCase() : "-";
}

function StatCard({
  label,
  value,
  footer,
  icon: Icon
}: {
  label: string;
  value: ReactNode;
  footer?: ReactNode;
  icon: LucideIcon;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-brand-yellow" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">{label}</p>
          <p className="ltr-num mt-4 text-3xl font-semibold text-ink-primary">{value}</p>
        </div>
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line bg-surface-muted text-ink-primary">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {footer ? <div className="mt-4 text-sm text-ink-muted">{footer}</div> : null}
    </Card>
  );
}

export function ZktecoAttendanceClient() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [users, setUsers] = useState<ZktecoUser[]>([]);
  const [history, setHistory] = useState<SyncHistory[]>([]);
  const [summary, setSummary] = useState<Summary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [employee, setEmployee] = useState("");
  const [device, setDevice] = useState("");
  const [syncStatus, setSyncStatus] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [localAgentUrl, setLocalAgentUrl] = useState("http://127.0.0.1:8081");
  const [agentBusy, setAgentBusy] = useState(false);
  const [agentMessage, setAgentMessage] = useState("");
  const [agentLogs, setAgentLogs] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (employee) params.set("employee", employee);
    if (device) params.set("device", device);
    if (syncStatus !== "ALL") params.set("syncStatus", syncStatus);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);

    try {
      const [attendanceResponse, usersResponse, historyResponse] = await Promise.all([
        fetch(`/api/zkteco/attendance?${params.toString()}`),
        fetch(`/api/zkteco/users${device ? `?device=${encodeURIComponent(device)}` : ""}`),
        fetch(`/api/zkteco/sync-history${device ? `?device=${encodeURIComponent(device)}` : ""}`)
      ]);

      if (!attendanceResponse.ok || !usersResponse.ok || !historyResponse.ok) {
        throw new Error("Unable to load ZKTeco attendance data.");
      }

      const attendanceData = await attendanceResponse.json();
      const usersData = await usersResponse.json();
      const historyData = await historyResponse.json();

      setLogs(attendanceData.logs || []);
      setSummary(attendanceData.summary || emptySummary);
      setUsers(usersData.users || []);
      setHistory(historyData.syncHistory || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load ZKTeco attendance data.");
    } finally {
      setLoading(false);
    }
  }, [device, employee, fromDate, search, syncStatus, toDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const employeeOptions = useMemo(() => {
    const ids = new Set<string>();
    logs.forEach((log) => ids.add(log.zktecoUserId));
    users.forEach((user) => ids.add(user.zktecoUserId));
    return Array.from(ids).sort();
  }, [logs, users]);

  const deviceOptions = useMemo(() => {
    const devices = new Set<string>();
    logs.forEach((log) => log.device?.ipAddress && devices.add(log.device.ipAddress));
    users.forEach((user) => user.device?.ipAddress && devices.add(user.device.ipAddress));
    history.forEach((item) => item.device?.ipAddress && devices.add(item.device.ipAddress));
    return Array.from(devices).sort();
  }, [history, logs, users]);

  const resetFilters = () => {
    setSearch("");
    setEmployee("");
    setDevice("");
    setSyncStatus("ALL");
    setFromDate("");
    setToDate("");
  };

  const refreshAgentLogs = useCallback(async () => {
    try {
      const response = await fetch(`${localAgentUrl.replace(/\/$/, "")}/iclock/ping?SN=SYZ8254200145`);
      const text = await response.text();
      if (!response.ok || text.trim() !== "OK") throw new Error("Bridge did not return OK.");
      setAgentLogs((current) => [...current, `${new Date().toLocaleTimeString()} Bridge ping: ${text.trim()}`].slice(-80));
      setAgentMessage("Local ADMS bridge is reachable.");
    } catch {
      setAgentMessage("Local ADMS bridge is not reachable. Start tools/zkteco-bridge on this PC, then try again.");
    }
  }, [localAgentUrl]);

  const runLocalAgentCommand = async (name: "test-device" | "test-api" | "sync:debug") => {
    setAgentBusy(true);
    setAgentMessage("");

    try {
      const baseUrl = localAgentUrl.replace(/\/$/, "");
      const path =
        name === "test-api"
          ? "/iclock/cdata?SN=SYZ8254200145&options=all"
          : "/iclock/ping?SN=SYZ8254200145";
      const response = await fetch(`${baseUrl}${path}`, { method: "GET" });
      const text = await response.text();
      if (!response.ok) throw new Error(text || "Bridge command failed.");
      setAgentLogs((current) => [...current, `${new Date().toLocaleTimeString()} ${path}: ${text.trim()}`].slice(-80));
      setAgentMessage(
        name === "sync:debug"
          ? "Bridge test completed. Make a real face/fingerprint punch on the device to sync attendance."
          : "Bridge test completed successfully."
      );
      loadData();
    } catch {
      setAgentMessage("Local ADMS bridge is not reachable. Start tools/zkteco-bridge on this PC, then try again.");
    } finally {
      setAgentBusy(false);
    }
  };

  const dashboard = (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t("zkteco.totalLogs")} value={summary.totalLogs} icon={HardDrive} />
        <StatCard label={t("zkteco.todayCheckIns")} value={summary.todayCheckIns} icon={Users} />
        <StatCard label={t("zkteco.todayCheckOuts")} value={summary.todayCheckOuts} icon={Clock} />
        <StatCard
          label={t("zkteco.deviceStatus")}
          value={<Badge tone={statusTone(summary.deviceStatus)}>{prettyStatus(summary.deviceStatus)}</Badge>}
          icon={CheckCircle2}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label={t("zkteco.latestSync")} value={formatDateTime(summary.latestSyncTime)} icon={RefreshCw} />
        <StatCard label={t("zkteco.successfulSyncs")} value={summary.successfulSyncCount} icon={CheckCircle2} />
        <StatCard label={t("zkteco.failedSyncs")} value={summary.failedSyncCount} icon={AlertTriangle} />
      </div>
      <Card>
        <CardTitle>{t("zkteco.manualSyncNote")}</CardTitle>
      </Card>
    </div>
  );

  const filters = (
    <Card>
      <CardTitle>{t("action.filter")}</CardTitle>
      <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <BrandInput label={t("zkteco.search")} value={search} onChange={(event) => setSearch(event.target.value)} />
        <BrandSelect label={t("zkteco.employee")} value={employee} onChange={(event) => setEmployee(event.target.value)}>
          <option value="">{t("zkteco.employee")}</option>
          {employeeOptions.map((id) => (
            <option key={id} value={id}>{id}</option>
          ))}
        </BrandSelect>
        <BrandSelect label={t("zkteco.deviceIp")} value={device} onChange={(event) => setDevice(event.target.value)}>
          <option value="">{t("zkteco.allDevices")}</option>
          {deviceOptions.map((ip) => (
            <option key={ip} value={ip}>{ip}</option>
          ))}
        </BrandSelect>
        <BrandSelect label={t("table.status")} value={syncStatus} onChange={(event) => setSyncStatus(event.target.value)}>
          <option value="ALL">{t("zkteco.allStatuses")}</option>
          {syncStatuses.map((status) => (
            <option key={status} value={status}>{prettyStatus(status)}</option>
          ))}
        </BrandSelect>
        <BrandInput label={t("zkteco.fromDate")} type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
        <BrandInput label={t("zkteco.toDate")} type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="focus-brand rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink-primary" onClick={resetFilters} type="button">
          {t("action.reset")}
        </button>
      </div>
    </Card>
  );

  const logsTable = (
    <div className="space-y-4">
      {filters}
      <DataTable
        emptyMessage={loading ? "Loading..." : t("zkteco.noLogs")}
        headers={[
          t("zkteco.employeeId"),
          t("zkteco.employeeName"),
          t("zkteco.timestamp"),
          t("table.date"),
          t("zkteco.time"),
          t("zkteco.punchType"),
          t("zkteco.deviceIp"),
          t("zkteco.deviceName"),
          t("zkteco.syncBatchId"),
          t("zkteco.createdAt")
        ]}
        rows={logs.map((log) => [
          log.zktecoUserId,
          log.employeeName || "-",
          formatDateTime(log.attendanceTimestamp),
          formatDate(log.attendanceDate),
          log.attendanceTime || "-",
          log.punchType || "-",
          log.device?.ipAddress || "-",
          log.device?.name || "-",
          log.syncBatchId || "-",
          formatDateTime(log.createdAt)
        ])}
        title={t("zkteco.logs")}
      />
    </div>
  );

  const usersTable = (
    <DataTable
      emptyMessage={loading ? "Loading..." : t("zkteco.noUsers")}
      headers={[
        t("zkteco.employeeId"),
        t("zkteco.employeeName"),
        t("zkteco.cardNumber"),
        t("zkteco.privilege"),
        t("zkteco.deviceIp"),
        t("zkteco.lastSyncedAt")
      ]}
      rows={users.map((user) => [
        user.zktecoUserId,
        user.name || "-",
        user.cardNumber || "-",
        user.privilege || "-",
        user.device?.ipAddress || "-",
        formatDateTime(user.lastSyncedAt)
      ])}
      title={t("zkteco.users")}
    />
  );

  const historyTable = (
    <DataTable
      emptyMessage={loading ? "Loading..." : t("zkteco.noHistory")}
      headers={[
        t("zkteco.syncBatchId"),
        t("zkteco.deviceIp"),
        t("zkteco.startedAt"),
        t("zkteco.finishedAt"),
        t("table.status"),
        t("zkteco.logsFetched"),
        t("zkteco.logsInserted"),
        t("zkteco.duplicatesSkipped"),
        t("zkteco.errorMessage")
      ]}
      rows={history.map((item) => [
        item.batchId,
        item.device?.ipAddress || "-",
        formatDateTime(item.startedAt),
        formatDateTime(item.finishedAt),
        <Badge key={`${item.id}-status`} tone={statusTone(item.status)}>{prettyStatus(item.status)}</Badge>,
        item.logsFetched,
        item.logsInserted,
        item.duplicatesSkipped,
        item.errorMessage || "-"
      ])}
      title={t("zkteco.history")}
    />
  );

  const setup = (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {[
          "Device IP: 192.168.1.201",
          "Port: 4370",
          "Communication key: 0",
          "Force UDP/ZKTeco protocol mode: true",
          t("zkteco.sameRouter"),
          t("zkteco.agentLocation"),
          t("zkteco.vercelUrl"),
          t("zkteco.apiSecret"),
          t("zkteco.manualSyncNote")
        ].map((item) => (
          <Card key={item}>
            <p className="text-sm leading-6 text-ink-primary">{item}</p>
          </Card>
        ))}
      </div>
      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Local Agent Bridge</CardTitle>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                These buttons call the local ADMS bridge on this PC. The SpeedFace device sends real punches to the bridge, and the bridge forwards them securely to the website.
              </p>
            </div>
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line bg-surface-muted text-ink-primary">
              <Settings className="h-5 w-5" />
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <BrandInput label="Local Agent URL" value={localAgentUrl} onChange={(event) => setLocalAgentUrl(event.target.value)} />
            <button
              className="focus-brand mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink-primary"
              onClick={refreshAgentLogs}
              type="button"
            >
              <RefreshCw className="h-4 w-4" />
              Check
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="focus-brand inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink-primary"
              disabled={agentBusy}
              onClick={() => runLocalAgentCommand("test-device")}
              type="button"
            >
              <CheckCircle2 className="h-4 w-4" />
              Test Bridge Ping
            </button>
            <button
              className="focus-brand inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink-primary"
              disabled={agentBusy}
              onClick={() => runLocalAgentCommand("test-api")}
              type="button"
            >
              <CheckCircle2 className="h-4 w-4" />
              Test ADMS Options
            </button>
            <button
              className="focus-brand inline-flex h-10 items-center gap-2 rounded-md bg-ink-primary px-3 text-sm font-semibold text-white"
              disabled={agentBusy}
              onClick={() => runLocalAgentCommand("sync:debug")}
              type="button"
            >
              <Play className="h-4 w-4" />
              Check Bridge and Refresh
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="focus-brand inline-flex h-10 items-center gap-2 rounded-md border border-brand-yellow bg-brand-yellow px-3 text-sm font-semibold text-brand-navy" href="/admin/attendance">
              Open Attendance Dashboard
            </Link>
            <Link className="focus-brand inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink-primary" href="/admin/attendance/debug">
              Open Debug Logs
            </Link>
          </div>
          {agentMessage ? <p className="text-sm font-semibold text-ink-primary">{agentMessage}</p> : null}
          <div className="max-h-72 overflow-auto whitespace-pre-wrap rounded-md border border-line bg-ink-primary p-3 text-xs text-white">
            {agentLogs.length ? agentLogs.slice(-80).join("\n") : "No local agent logs loaded."}
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("zkteco.eyebrow")}
        title={t("zkteco.title")}
        description={t("zkteco.description")}
      />
      {error ? (
        <Card>
          <div className="flex items-start gap-3 text-rose-700 dark:text-rose-300">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        </Card>
      ) : null}
      <BrandTabs
        tabs={[
          { id: "dashboard", label: t("zkteco.dashboard"), content: dashboard },
          { id: "logs", label: t("zkteco.logs"), content: logsTable },
          { id: "users", label: t("zkteco.users"), content: usersTable },
          { id: "history", label: t("zkteco.history"), content: historyTable },
          { id: "setup", label: t("zkteco.setup"), content: setup }
        ]}
      />
    </div>
  );
}
