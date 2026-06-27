"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import {
  AppSettings,
  CrmData,
  Customer,
  Expense,
  Sale,
  SalesSection,
  TeamMember,
  TeamPayment,
  calculateSale,
  createId,
  initialCrmData
} from "@/lib/demo-data";

type CrmContextValue = {
  data: CrmData;
  resetDemoData: () => void;
  addCustomer: (customer: Omit<Customer, "id" | "createdAt">) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addSale: (sale: Omit<Sale, "id" | "createdAt" | "finalTotal" | "remainingAmount" | "netProfit" | "paymentStatus">) => void;
  updateSale: (id: string, sale: Partial<Sale>) => void;
  deleteSale: (id: string) => void;
  addExpense: (expense: Omit<Expense, "id">) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addTeamMember: (member: Omit<TeamMember, "id">) => void;
  updateTeamMember: (id: string, member: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;
  addTeamPayment: (payment: Omit<TeamPayment, "id">) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  updateSalesSection: (id: string, section: Partial<SalesSection>) => void;
  addExpenseCategory: (category: string) => void;
  deleteExpenseCategory: (category: string) => void;
};

const CrmContext = createContext<CrmContextValue | null>(null);
const storageKey = "base-agency-crm-demo-data";

export function CrmProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CrmData>(initialCrmData);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setData({ ...initialCrmData, ...JSON.parse(saved) });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data]);

  const value = useMemo<CrmContextValue>(
    () => ({
      data,
      resetDemoData: () => setData(initialCrmData),
      addCustomer: (customer) =>
        setData((current) => ({
          ...current,
          customers: [
            { ...customer, id: createId("cust"), createdAt: new Date().toISOString().slice(0, 10) },
            ...current.customers
          ]
        })),
      updateCustomer: (id, customer) =>
        setData((current) => ({
          ...current,
          customers: current.customers.map((item) => (item.id === id ? { ...item, ...customer } : item))
        })),
      deleteCustomer: (id) =>
        setData((current) => ({
          ...current,
          customers: current.customers.filter((item) => item.id !== id),
          sales: current.sales.filter((sale) => sale.customerId !== id)
        })),
      addSale: (sale) =>
        setData((current) => {
          const totals = calculateSale(sale);
          return {
            ...current,
            sales: [
              { ...sale, ...totals, id: createId("sale"), createdAt: new Date().toISOString().slice(0, 10) },
              ...current.sales
            ]
          };
        }),
      updateSale: (id, sale) =>
        setData((current) => ({
          ...current,
          sales: current.sales.map((item) => {
            if (item.id !== id) return item;
            const updated = { ...item, ...sale };
            return { ...updated, ...calculateSale(updated) };
          })
        })),
      deleteSale: (id) =>
        setData((current) => ({ ...current, sales: current.sales.filter((item) => item.id !== id) })),
      addExpense: (expense) =>
        setData((current) => ({
          ...current,
          expenses: [{ ...expense, id: createId("exp") }, ...current.expenses]
        })),
      updateExpense: (id, expense) =>
        setData((current) => ({
          ...current,
          expenses: current.expenses.map((item) => (item.id === id ? { ...item, ...expense } : item))
        })),
      deleteExpense: (id) =>
        setData((current) => ({ ...current, expenses: current.expenses.filter((item) => item.id !== id) })),
      addTeamMember: (member) =>
        setData((current) => ({
          ...current,
          teamMembers: [{ ...member, id: createId("team") }, ...current.teamMembers]
        })),
      updateTeamMember: (id, member) =>
        setData((current) => ({
          ...current,
          teamMembers: current.teamMembers.map((item) => (item.id === id ? { ...item, ...member } : item))
        })),
      deleteTeamMember: (id) =>
        setData((current) => ({
          ...current,
          teamMembers: current.teamMembers.filter((item) => item.id !== id),
          teamPayments: current.teamPayments.filter((payment) => payment.teamMemberId !== id)
        })),
      addTeamPayment: (payment) =>
        setData((current) => ({
          ...current,
          teamPayments: [{ ...payment, id: createId("team-pay") }, ...current.teamPayments]
        })),
      updateSettings: (settings) =>
        setData((current) => ({ ...current, settings: { ...current.settings, ...settings } })),
      updateSalesSection: (id, section) =>
        setData((current) => ({
          ...current,
          salesSections: current.salesSections.map((item) => (item.id === id ? { ...item, ...section } : item))
        })),
      addExpenseCategory: (category) =>
        setData((current) =>
          current.expenseCategories.includes(category)
            ? current
            : { ...current, expenseCategories: [...current.expenseCategories, category] }
        ),
      deleteExpenseCategory: (category) =>
        setData((current) => ({
          ...current,
          expenseCategories: current.expenseCategories.filter((item) => item !== category)
        }))
    }),
    [data]
  );

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const value = useContext(CrmContext);
  if (!value) {
    throw new Error("useCrm must be used inside CrmProvider");
  }
  return value;
}
