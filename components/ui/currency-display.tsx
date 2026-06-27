import { formatCurrency } from "@/lib/utils";

export function CurrencyDisplay({ value }: { value: number | string }) {
  return <span className="ltr-num tabular-nums">{formatCurrency(value)}</span>;
}
