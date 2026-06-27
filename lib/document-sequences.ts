import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

export function currentSequenceYear() {
  return new Date().getFullYear();
}

export async function nextDocumentCode(prefix: string, year = currentSequenceYear()) {
  try {
    const rows = await prisma.$queryRawUnsafe(
      `
        INSERT INTO document_sequences (id, prefix, year, next_value, updated_at)
        VALUES ($1, $2, $3, 2, now())
        ON CONFLICT (prefix, year)
        DO UPDATE SET next_value = document_sequences.next_value + 1, updated_at = now()
        RETURNING next_value - 1 AS value
      `,
      randomUUID(),
      prefix,
      year
    );
    const value = Number((rows as any[])[0]?.value || 1);
    return `BA-${prefix}-${year}-${String(value).padStart(3, "0")}`;
  } catch {
    return `BA-${prefix}-${year}-${String(Date.now()).slice(-3)}`;
  }
}
