"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeader } from "@/components/ui/page-header";

type DebugLog = {
  id: string;
  serialNumber: string | null;
  method: string;
  path: string;
  queryParams: Record<string, unknown> | null;
  headers: Record<string, unknown> | null;
  rawBody: string | null;
  responseBody: string | null;
  remoteAddress: string | null;
  createdAt: string;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "medium"
  }).format(new Date(value));
}

function preview(value: unknown) {
  if (!value) return "-";
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > 180 ? `${text.slice(0, 180)}...` : text;
}

export function AdminAttendanceDebugClient() {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/attendance/debug");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load ZKTeco debug logs.");
      setLogs(data.logs || []);
      setMessage(data.databaseAvailable === false ? data.message : "Latest device requests loaded.");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load ZKTeco debug logs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin / Attendance Debug"
        title="ZKTeco ADMS Request Logs"
        description="Raw SpeedFace V5L iClock traffic, responses, and device registration status for production troubleshooting."
        actions={
          <>
            <Link className="focus-brand inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink-primary" href="/admin/attendance">
              <ArrowLeft className="h-4 w-4" /> Attendance
            </Link>
            <button className="focus-brand inline-flex h-10 items-center gap-2 rounded-md border border-brand-yellow bg-brand-yellow px-3 text-sm font-semibold text-brand-navy" onClick={loadLogs} type="button">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </>
        }
      />

      {error ? <Card><p className="text-sm font-semibold text-rose-700">{error}</p></Card> : null}
      {message && !error ? <Card><p className="text-sm font-semibold text-ink-primary">{message}</p></Card> : null}

      {loading ? (
        <LoadingSkeleton count={4} />
      ) : logs.length ? (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id}>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={log.method === "POST" ? "warning" : "default"}>{log.method}</Badge>
                      <p className="font-semibold text-ink-primary">{log.path}</p>
                    </div>
                    <p className="mt-1 text-xs text-ink-muted">
                      {formatDateTime(log.createdAt)} | SN: {log.serialNumber || "-"} | IP: {log.remoteAddress || "-"}
                    </p>
                  </div>
                  <Badge tone={log.responseBody === "OK" ? "positive" : "default"}>{preview(log.responseBody)}</Badge>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <CardTitle>Query</CardTitle>
                    <pre className="mt-2 max-h-40 overflow-auto rounded-md border border-line bg-surface-muted p-3 text-xs text-ink-muted">{preview(log.queryParams)}</pre>
                  </div>
                  <div>
                    <CardTitle>Raw body</CardTitle>
                    <pre className="mt-2 max-h-40 overflow-auto rounded-md border border-line bg-surface-muted p-3 text-xs text-ink-muted">{preview(log.rawBody)}</pre>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No device requests yet" description="Start the local bridge, point the SpeedFace cloud server to 192.168.1.100:8081, then refresh this page." />
      )}
    </div>
  );
}
