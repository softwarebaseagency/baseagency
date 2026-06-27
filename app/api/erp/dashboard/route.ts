import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Metric = {
  label: string;
  value: number;
  tone: "green" | "yellow" | "red";
};

async function scalar(sql: string, fallback = 0) {
  try {
    const rows = await prisma.$queryRawUnsafe(sql);
    const first = (rows as any[])[0];
    const value = first?.value ?? Object.values(first || {})[0];
    return Number(value || fallback);
  } catch {
    return fallback;
  }
}

function tone(value: number, warningAt = 1, redAt = 5): Metric["tone"] {
  if (value >= redAt) return "red";
  if (value >= warningAt) return "yellow";
  return "green";
}

function moneyTone(value: number) {
  if (value > 0) return "green";
  if (value < 0) return "red";
  return "yellow";
}

export async function GET() {
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database unavailable";
    return NextResponse.json({ success: false, databaseBacked: false, message, metrics: [] });
  }

  const [
    totalLeads,
    activeOpportunities,
    proposalsSent,
    dealsClosed,
    monthlyIncome,
    monthlyExpenses,
    activeProjects,
    delayedProjects,
    activeEmployees,
    lateAbsenceIssues,
    openRisks,
    pendingDecisions,
    activeTasks,
    completedTasks,
    openIssues,
    resolvedIssues
  ] = await Promise.all([
    scalar("SELECT COUNT(*) AS value FROM crm_leads WHERE deleted_at IS NULL"),
    scalar("SELECT COUNT(*) AS value FROM crm_deals WHERE deleted_at IS NULL AND status NOT IN ('Closed Won','Closed Lost','Cancelled')"),
    scalar("SELECT COUNT(*) AS value FROM crm_proposals WHERE deleted_at IS NULL AND status IN ('Sent','Proposal Sent','Approved','Under Review')"),
    scalar("SELECT COUNT(*) AS value FROM crm_closed_deals WHERE deleted_at IS NULL"),
    scalar("SELECT COALESCE(SUM(amount),0) AS value FROM finance_incomes WHERE deleted_at IS NULL AND date >= date_trunc('month', now())"),
    scalar("SELECT COALESCE(SUM(amount),0) AS value FROM finance_expenses WHERE deleted_at IS NULL AND date >= date_trunc('month', now())"),
    scalar("SELECT COUNT(*) AS value FROM operations_projects WHERE deleted_at IS NULL AND status NOT IN ('Closed','Cancelled')"),
    scalar("SELECT COUNT(*) AS value FROM operations_projects WHERE deleted_at IS NULL AND status = 'Delayed'"),
    scalar("SELECT COUNT(*) AS value FROM hr_employees WHERE deleted_at IS NULL AND status IN ('Active','On Probation','Confirmed')"),
    scalar("SELECT COUNT(*) AS value FROM hr_attendance_records WHERE deleted_at IS NULL AND status IN ('Late','Absent') AND date >= date_trunc('month', now())"),
    scalar("SELECT COUNT(*) AS value FROM risk_compliance_records WHERE deleted_at IS NULL AND status NOT IN ('Closed','Completed')"),
    scalar("SELECT COUNT(*) AS value FROM approval_register WHERE deleted_at IS NULL AND status IN ('Pending','Open','Waiting')"),
    scalar("SELECT COUNT(*) AS value FROM operations_tasks WHERE deleted_at IS NULL AND status NOT IN ('Completed','Closed','Cancelled')"),
    scalar("SELECT COUNT(*) AS value FROM operations_tasks WHERE deleted_at IS NULL AND status IN ('Completed','Closed')"),
    scalar("SELECT COUNT(*) AS value FROM operations_issues WHERE deleted_at IS NULL AND status NOT IN ('Resolved','Closed','Completed')"),
    scalar("SELECT COUNT(*) AS value FROM operations_issues WHERE deleted_at IS NULL AND status IN ('Resolved','Closed','Completed')")
  ]);

  const netProfit = monthlyIncome - monthlyExpenses;
  const attendanceRate = activeEmployees ? Math.max(0, Math.round(((activeEmployees - lateAbsenceIssues) / activeEmployees) * 100)) : 0;
  const conversionRate = totalLeads ? Math.round((dealsClosed / totalLeads) * 100) : 0;

  const metrics: Metric[] = [
    { label: "Total Leads", value: totalLeads, tone: totalLeads ? "green" : "yellow" },
    { label: "Active Opportunities", value: activeOpportunities, tone: activeOpportunities ? "green" : "yellow" },
    { label: "Proposals Sent", value: proposalsSent, tone: proposalsSent ? "green" : "yellow" },
    { label: "Deals Closed", value: dealsClosed, tone: dealsClosed ? "green" : "yellow" },
    { label: "Monthly Income", value: monthlyIncome, tone: monthlyIncome ? "green" : "yellow" },
    { label: "Monthly Expenses", value: monthlyExpenses, tone: monthlyExpenses > monthlyIncome ? "red" : "yellow" },
    { label: "Net Profit / Loss", value: netProfit, tone: moneyTone(netProfit) },
    { label: "Active Projects", value: activeProjects, tone: activeProjects ? "green" : "yellow" },
    { label: "Delayed Projects", value: delayedProjects, tone: tone(delayedProjects) },
    { label: "Active Employees", value: activeEmployees, tone: activeEmployees ? "green" : "yellow" },
    { label: "Attendance Rate", value: attendanceRate, tone: attendanceRate >= 95 ? "green" : attendanceRate >= 85 ? "yellow" : "red" },
    { label: "Open Risks / Issues", value: openRisks + openIssues, tone: tone(openRisks + openIssues) },
    { label: "Pending CEO Decisions", value: pendingDecisions, tone: tone(pendingDecisions) },
    { label: "Active Tasks", value: activeTasks, tone: activeTasks ? "green" : "yellow" },
    { label: "Completed Tasks", value: completedTasks, tone: completedTasks ? "green" : "yellow" },
    { label: "Issues Resolved", value: resolvedIssues, tone: resolvedIssues ? "green" : "yellow" },
    { label: "Conversion Rate", value: conversionRate, tone: conversionRate >= 20 ? "green" : conversionRate >= 10 ? "yellow" : "red" }
  ];

  return NextResponse.json({ success: true, metrics });
}
