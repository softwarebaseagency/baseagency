"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { BrandButton } from "@/components/ui/brand-button";
import { Card, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { BrandInput, BrandSelect, BrandTextarea } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { useCrm } from "@/components/crm/crm-provider";
import { useLanguage } from "@/components/i18n/language-provider";
import { TeamMember, TeamPaymentType, TeamStatus, WorkType } from "@/lib/demo-data";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { translateRole, translateStatus, translateType } from "@/lib/i18n/format";
import { formatDate } from "@/lib/utils";

const blankMember: Omit<TeamMember, "id"> = {
  name: "",
  role: "",
  phone: "",
  email: "",
  salary: 0,
  workType: "FULL_TIME",
  startDate: new Date().toISOString().slice(0, 10),
  status: "ACTIVE",
  notes: ""
};

function exportJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function TeamClient() {
  const { data, addTeamMember, updateTeamMember, deleteTeamMember, addTeamPayment } = useCrm();
  const { t } = useLanguage();
  const [form, setForm] = useState(blankMember);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [workType, setWorkType] = useState("ALL");
  const [paymentMemberId, setPaymentMemberId] = useState("");
  const [paymentType, setPaymentType] = useState<TeamPaymentType>("SALARY");
  const [paymentAmount, setPaymentAmount] = useState(0);

  const filteredMembers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return data.teamMembers.filter((member) => {
      const matchesSearch = !normalized || `${member.name} ${member.role}`.toLowerCase().includes(normalized);
      const matchesStatus = status === "ALL" || member.status === status;
      const matchesWork = workType === "ALL" || member.workType === workType;
      return matchesSearch && matchesStatus && matchesWork;
    });
  }, [data.teamMembers, query, status, workType]);

  const saveMember = () => {
    if (!form.name.trim() || !form.role.trim()) return;
    if (editingId) updateTeamMember(editingId, form);
    else addTeamMember(form);
    setEditingId(null);
    setForm(blankMember);
  };

  const startEdit = (member: TeamMember) => {
    setEditingId(member.id);
    setForm({
      name: member.name,
      role: member.role,
      phone: member.phone,
      email: member.email,
      salary: member.salary,
      workType: member.workType,
      startDate: member.startDate,
      status: member.status,
      notes: member.notes
    });
  };

  const savePayment = () => {
    const teamMemberId = paymentMemberId || data.teamMembers[0]?.id;
    if (!teamMemberId || paymentAmount <= 0) return;
    addTeamPayment({
      teamMemberId,
      type: paymentType,
      amount: paymentAmount,
      paidAt: new Date().toISOString().slice(0, 10),
      notes: `${paymentType.toLowerCase()} payment`
    });
    setPaymentAmount(0);
  };

  const memberName = (id: string) => data.teamMembers.find((member) => member.id === id)?.name ?? t("label.unknownMember");
  const paymentTotals = {
    salary: data.teamPayments.filter((payment) => payment.type === "SALARY").reduce((sum, item) => sum + item.amount, 0),
    bonus: data.teamPayments.filter((payment) => payment.type === "BONUS").reduce((sum, item) => sum + item.amount, 0),
    commission: data.teamPayments.filter((payment) => payment.type === "COMMISSION").reduce((sum, item) => sum + item.amount, 0),
    advance: data.teamPayments.filter((payment) => payment.type === "ADVANCE").reduce((sum, item) => sum + item.amount, 0)
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("team.eyebrow")}
        title={t("nav.team")}
        description={t("team.description")}
        actions={<BrandButton variant="accent" onClick={() => { setEditingId(null); setForm(blankMember); }}>{t("team.addTeamMember")}</BrandButton>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card><p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">{t("team.salaryPayments")}</p><p className="mt-2 text-xl font-semibold text-ink-primary"><CurrencyDisplay value={paymentTotals.salary} /></p></Card>
        <Card><p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">{t("team.bonuses")}</p><p className="mt-2 text-xl font-semibold text-ink-primary"><CurrencyDisplay value={paymentTotals.bonus} /></p></Card>
        <Card><p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">{t("team.commissions")}</p><p className="mt-2 text-xl font-semibold text-ink-primary"><CurrencyDisplay value={paymentTotals.commission} /></p></Card>
        <Card><p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">{t("team.advances")}</p><p className="mt-2 text-xl font-semibold text-ink-primary"><CurrencyDisplay value={paymentTotals.advance} /></p></Card>
      </div>

      <Card>
        <CardTitle>{editingId ? t("team.editMember") : t("team.addMember")}</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <BrandInput label={t("team.name")} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <BrandInput label={t("team.role")} value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} />
          <BrandInput label={t("form.phone")} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          <BrandInput label={t("form.email")} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <BrandInput label={t("team.salary")} type="number" value={form.salary} onChange={(event) => setForm({ ...form, salary: Number(event.target.value) })} />
          <BrandSelect label={t("team.workType")} value={form.workType} onChange={(event) => setForm({ ...form, workType: event.target.value as WorkType })}>
            {["FULL_TIME", "PART_TIME", "CONTRACT", "FREELANCE"].map((item) => <option key={item} value={item}>{translateType(t, item)}</option>)}
          </BrandSelect>
          <BrandInput label={t("team.started")} type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} />
          <BrandSelect label={t("form.status")} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as TeamStatus })}>
            {["ACTIVE", "INACTIVE"].map((item) => <option key={item} value={item}>{translateStatus(t, item)}</option>)}
          </BrandSelect>
          <BrandTextarea className="md:col-span-2" label={t("form.notes")} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        </div>
        <div className="mt-5 flex justify-between gap-2 border-t border-line pt-4">
          <BrandButton variant="secondary" onClick={() => { setEditingId(null); setForm(blankMember); }}>{t("action.cancel")}</BrandButton>
          <BrandButton variant="accent" onClick={saveMember}>{t("team.saveMember")}</BrandButton>
        </div>
      </Card>

      <Card>
        <CardTitle>{t("team.addPayment")}</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <BrandSelect label={t("team.member")} value={paymentMemberId} onChange={(event) => setPaymentMemberId(event.target.value)}>
            <option value="">{t("team.selectMember")}</option>
            {data.teamMembers.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
          </BrandSelect>
          <BrandSelect label={t("team.paymentType")} value={paymentType} onChange={(event) => setPaymentType(event.target.value as TeamPaymentType)}>
            {["SALARY", "BONUS", "COMMISSION", "ADVANCE"].map((item) => <option key={item} value={item}>{translateType(t, item)}</option>)}
          </BrandSelect>
          <BrandInput label={t("form.amount")} type="number" value={paymentAmount} onChange={(event) => setPaymentAmount(Number(event.target.value))} />
          <div className="flex items-end"><BrandButton variant="accent" onClick={savePayment}>{t("team.addPayment")}</BrandButton></div>
        </div>
      </Card>

      <Card>
        <CardTitle>{t("team.filters")}</CardTitle>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <BrandInput label={t("team.searchNameRole")} value={query} onChange={(event) => setQuery(event.target.value)} />
          <BrandSelect label={t("form.status")} value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="ALL">{t("sales.allStatuses")}</option>
            {["ACTIVE", "INACTIVE"].map((item) => <option key={item} value={item}>{translateStatus(t, item)}</option>)}
          </BrandSelect>
          <BrandSelect label={t("team.workType")} value={workType} onChange={(event) => setWorkType(event.target.value)}>
            <option value="ALL">{t("team.allWorkTypes")}</option>
            {["FULL_TIME", "PART_TIME", "CONTRACT", "FREELANCE"].map((item) => <option key={item} value={item}>{translateType(t, item)}</option>)}
          </BrandSelect>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <BrandButton variant="secondary" onClick={() => { setQuery(""); setStatus("ALL"); setWorkType("ALL"); }}>{t("action.reset")}</BrandButton>
          <BrandButton onClick={() => exportJson("base-agency-team.json", { members: filteredMembers, payments: data.teamPayments })}>{t("action.export")}</BrandButton>
        </div>
      </Card>

      <DataTable
        emptyMessage={t("team.noMembers")}
        headers={[t("team.name"), t("team.role"), t("team.workType"), t("team.salary"), t("form.status"), t("team.started")]}
        rowActions={(index) => {
          const member = filteredMembers[index];
          return (
            <div className="flex justify-end gap-2">
              <button className="focus-brand rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-ink-primary" onClick={() => startEdit(member)} type="button">{t("action.edit")}</button>
              <button className="focus-brand rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700" onClick={() => confirm(t("team.deleteConfirm")) && deleteTeamMember(member.id)} type="button">{t("action.delete")}</button>
            </div>
          );
        }}
        rows={filteredMembers.map((member) => [
          member.name,
          translateRole(t, member.role),
          translateType(t, member.workType),
          <CurrencyDisplay key={`${member.id}-salary`} value={member.salary} />,
          <Badge key={member.status} tone={member.status === "ACTIVE" ? "positive" : "danger"}>{translateStatus(t, member.status)}</Badge>,
          formatDate(member.startDate)
        ])}
        title={t("team.members")}
      />

      <DataTable
        headers={[t("team.member"), t("table.type"), t("table.amount"), t("team.paidAt"), t("form.notes")]}
        rows={data.teamPayments.map((payment) => [
          memberName(payment.teamMemberId),
          translateType(t, payment.type),
          <CurrencyDisplay key={`${payment.id}-amount`} value={payment.amount} />,
          formatDate(payment.paidAt),
          payment.notes
        ])}
        title={t("team.paymentHistory")}
      />
    </div>
  );
}
