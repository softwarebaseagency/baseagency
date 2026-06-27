import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createDbId,
  getSection,
  resolveSectionTableMap,
  valueForColumn
} from "@/lib/document-module-db";
import { nextDocumentCode } from "@/lib/document-sequences";
import { writeAuditLog } from "@/lib/erp-audit";
import { canAccessModule, roleFromRequest } from "@/lib/rbac";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    moduleId: string;
    sectionId: string;
  };
};

function quoteIdentifier(identifier: string) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

function formatDateOnly(value: unknown) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString().slice(0, 10);
}

function formatCell(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (value === null || value === undefined) return "";
  return String(value);
}

function incrementVersion(version: unknown) {
  const current = Number.parseFloat(String(version || "1.0"));
  if (Number.isNaN(current)) return "2.0";
  return (Math.floor(current) + 1).toFixed(1);
}

function commercialDocumentType(map: NonNullable<ReturnType<typeof resolveSectionTableMap>>) {
  return map.columns.find((column) => column.column === "document_type" && !column.field)?.defaultValue;
}

function forbiddenResponse() {
  return NextResponse.json({ success: false, message: "You do not have permission to access this section." }, { status: 403 });
}

export async function GET(request: Request, { params }: RouteContext) {
  if (!canAccessModule(roleFromRequest(request), params.moduleId, params.sectionId)) return forbiddenResponse();

  const section = getSection(params.moduleId, params.sectionId);
  const map = resolveSectionTableMap(params.moduleId, params.sectionId);

  if (!section || !map) {
    return NextResponse.json({ success: true, databaseBacked: false, records: [] });
  }

  const orderColumn = map.orderColumn || "created_at";

  try {
    let rows: unknown;
    try {
      rows = await prisma.$queryRawUnsafe(
        `
          SELECT *
          FROM ${quoteIdentifier(map.table)}
          WHERE deleted_at IS NULL
          ${map.table === "commercial_documents" ? "AND document_type = $1" : ""}
          ORDER BY ${quoteIdentifier(orderColumn)} DESC
          LIMIT 500
        `,
        ...(map.table === "commercial_documents" ? [commercialDocumentType(map)] : [])
      );
    } catch {
      try {
        rows = await prisma.$queryRawUnsafe(
          `
            SELECT *
            FROM ${quoteIdentifier(map.table)}
            ${map.table === "commercial_documents" ? "WHERE document_type = $1" : ""}
            ORDER BY ${quoteIdentifier(orderColumn)} DESC
            LIMIT 500
          `,
          ...(map.table === "commercial_documents" ? [commercialDocumentType(map)] : [])
        );
      } catch {
        rows = await prisma.$queryRawUnsafe(
          `
            SELECT *
            FROM ${quoteIdentifier(map.table)}
            ${map.table === "commercial_documents" ? "WHERE document_type = $1" : ""}
            ORDER BY id DESC
            LIMIT 500
          `,
          ...(map.table === "commercial_documents" ? [commercialDocumentType(map)] : [])
        );
      }
    }

    const records = (rows as any[]).map((row) => ({
      id: row.id,
      code: map.codeColumn ? row[map.codeColumn] : undefined,
      sectionId: params.sectionId,
      createdAt: formatDateOnly(row.created_at || row[orderColumn] || new Date()),
      values: Object.fromEntries(
        map.columns
          .filter((column) => column.field)
          .map((column) => [column.field as string, formatCell(row[column.column])])
      )
    }));

    return NextResponse.json({ success: true, databaseBacked: true, records });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load document module records";
    return NextResponse.json({ success: false, databaseBacked: true, message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  if (!canAccessModule(roleFromRequest(request), params.moduleId, params.sectionId)) return forbiddenResponse();

  const section = getSection(params.moduleId, params.sectionId);
  const map = resolveSectionTableMap(params.moduleId, params.sectionId);

  if (!section || !map) {
    return NextResponse.json(
      { success: false, message: "This section is a reference/dashboard section and is not database-backed for CRUD." },
      { status: 400 }
    );
  }

  let body: { values?: Record<string, string> };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const values = body.values || {};
  const columns = ["id"];
  const paramsList: unknown[] = [createDbId()];

  if (map.codeColumn && map.codePrefix) {
    columns.push(map.codeColumn);
    paramsList.push(await nextDocumentCode(map.codePrefix));
  }

  for (const column of map.columns) {
    columns.push(column.column);
    paramsList.push(valueForColumn(column, values));
  }

  if (map.hasUpdatedAt) {
    columns.push("updated_at");
    paramsList.push(new Date());
  }

  const placeholders = paramsList.map((_, index) => `$${index + 1}`).join(", ");

  try {
    const inserted = await prisma.$queryRawUnsafe(
      `
        INSERT INTO ${quoteIdentifier(map.table)}
          (${columns.map(quoteIdentifier).join(", ")})
        VALUES (${placeholders})
        RETURNING *
      `,
      ...paramsList
    );
    const row = (inserted as any[])[0];
    const record = {
      id: row.id,
      code: map.codeColumn ? row[map.codeColumn] : undefined,
      sectionId: params.sectionId,
      createdAt: formatDateOnly(row.created_at || new Date()),
      values: Object.fromEntries(
        map.columns
          .filter((column) => column.field)
          .map((column) => [column.field as string, formatCell(row[column.column])])
      )
    };

    await writeAuditLog({
      action: "create",
      moduleId: params.moduleId,
      sectionId: params.sectionId,
      recordId: row.id,
      entityTable: map.table,
      afterData: record
    });

    return NextResponse.json({ success: true, databaseBacked: true, record });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save document module record";
    return NextResponse.json({ success: false, databaseBacked: true, message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  if (!canAccessModule(roleFromRequest(request), params.moduleId, params.sectionId)) return forbiddenResponse();

  const map = resolveSectionTableMap(params.moduleId, params.sectionId);

  if (!map) {
    return NextResponse.json({ success: false, message: "This section is not database-backed for CRUD." }, { status: 400 });
  }

  let body: { id?: string; values?: Record<string, string> };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ success: false, message: "Record id is required" }, { status: 400 });
  }

  if (map.table === "commercial_documents") {
    const existingRows = await prisma.$queryRawUnsafe(
      `
        SELECT *
        FROM commercial_documents
        WHERE id = $1
        LIMIT 1
      `,
      body.id
    );
    const existing = (existingRows as any[])[0];
    const isFinal =
      existing?.is_locked === true ||
      String(existing?.approval_status || "").toLowerCase() === "approved" ||
      String(existing?.archive_status || "").toLowerCase() === "archived" ||
      String(existing?.archive_status || "").toLowerCase() === "final";

    if (existing && isFinal && map.codeColumn && map.codePrefix) {
      const values = {
        ...(body.values || {}),
        Version: incrementVersion(existing.version),
        "Related Document No": existing.document_no
      };
      const columns = ["id", map.codeColumn];
      const paramsList: unknown[] = [createDbId(), await nextDocumentCode(map.codePrefix)];

      for (const column of map.columns) {
        columns.push(column.column);
        paramsList.push(valueForColumn(column, values));
      }

      if (map.hasUpdatedAt) {
        columns.push("updated_at");
        paramsList.push(new Date());
      }

      const placeholders = paramsList.map((_, index) => `$${index + 1}`).join(", ");
      const inserted = await prisma.$queryRawUnsafe(
        `
          INSERT INTO ${quoteIdentifier(map.table)}
            (${columns.map(quoteIdentifier).join(", ")})
          VALUES (${placeholders})
          RETURNING *
        `,
        ...paramsList
      );
      const row = (inserted as any[])[0];
      const record = {
        id: row.id,
        code: row[map.codeColumn],
        sectionId: params.sectionId,
        createdAt: formatDateOnly(row.created_at || new Date()),
        values: Object.fromEntries(
          map.columns
            .filter((column) => column.field)
            .map((column) => [column.field as string, formatCell(row[column.column])])
        )
      };

      await writeAuditLog({
        action: "version:create-from-locked",
        moduleId: params.moduleId,
        sectionId: params.sectionId,
        recordId: row.id,
        entityTable: map.table,
        beforeData: { sourceRecordId: body.id, sourceDocumentNo: existing.document_no },
        afterData: record
      });

      return NextResponse.json({
        success: true,
        databaseBacked: true,
        versioned: true,
        message: "Approved or locked commercial document was preserved; a new version was created.",
        record
      });
    }
  }

  const assignments: string[] = [];
  const paramsList: unknown[] = [];

  for (const column of map.columns) {
    paramsList.push(valueForColumn(column, body.values || {}));
    assignments.push(`${quoteIdentifier(column.column)} = $${paramsList.length}`);
  }

  if (map.hasUpdatedAt) {
    paramsList.push(new Date());
    assignments.push(`${quoteIdentifier("updated_at")} = $${paramsList.length}`);
  }

  paramsList.push(body.id);

  try {
    const updated = await prisma.$queryRawUnsafe(
      `
        UPDATE ${quoteIdentifier(map.table)}
        SET ${assignments.join(", ")}
        WHERE id = $${paramsList.length}
        RETURNING *
      `,
      ...paramsList
    );
    const row = (updated as any[])[0];

    if (!row) {
      return NextResponse.json({ success: false, message: "Record not found" }, { status: 404 });
    }

    const record = {
      id: row.id,
      code: map.codeColumn ? row[map.codeColumn] : undefined,
      sectionId: params.sectionId,
      createdAt: formatDateOnly(row.created_at || new Date()),
      values: Object.fromEntries(
        map.columns
          .filter((column) => column.field)
          .map((column) => [column.field as string, formatCell(row[column.column])])
      )
    };

    await writeAuditLog({
      action: "update",
      moduleId: params.moduleId,
      sectionId: params.sectionId,
      recordId: row.id,
      entityTable: map.table,
      afterData: record
    });

    return NextResponse.json({ success: true, databaseBacked: true, record });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update document module record";
    return NextResponse.json({ success: false, databaseBacked: true, message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  if (!canAccessModule(roleFromRequest(request), params.moduleId, params.sectionId)) return forbiddenResponse();

  const map = resolveSectionTableMap(params.moduleId, params.sectionId);

  if (!map) {
    return NextResponse.json({ success: false, message: "This section is not database-backed for CRUD." }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, message: "Record id is required" }, { status: 400 });
  }

  try {
    try {
      await prisma.$executeRawUnsafe(
        `
          UPDATE ${quoteIdentifier(map.table)}
          SET deleted_at = now()
          WHERE id = $1
        `,
        id
      );
    } catch {
      await prisma.$executeRawUnsafe(
        `
          DELETE FROM ${quoteIdentifier(map.table)}
          WHERE id = $1
        `,
        id
      );
    }

    await writeAuditLog({
      action: "archive",
      moduleId: params.moduleId,
      sectionId: params.sectionId,
      recordId: id,
      entityTable: map.table
    });

    return NextResponse.json({ success: true, databaseBacked: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete document module record";
    return NextResponse.json({ success: false, databaseBacked: true, message }, { status: 500 });
  }
}
