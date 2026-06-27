import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/erp-audit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const moduleId = searchParams.get("moduleId");
  const sectionId = searchParams.get("sectionId");
  const recordId = searchParams.get("recordId");

  try {
    const rows = await prisma.$queryRawUnsafe(
      `
        SELECT *
        FROM attachments
        WHERE ($1::text IS NULL OR module_id = $1)
          AND ($2::text IS NULL OR section_id = $2)
          AND ($3::text IS NULL OR record_id = $3)
        ORDER BY created_at DESC
        LIMIT 200
      `,
      moduleId,
      sectionId,
      recordId
    );

    return NextResponse.json({ success: true, attachments: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load attachments";
    return NextResponse.json({ success: false, databaseBacked: false, message, attachments: [] });
  }
}

export async function POST(request: Request) {
  let body: {
    moduleId?: string;
    sectionId?: string;
    recordId?: string;
    fileName?: string;
    fileUrl?: string;
    mimeType?: string;
    sizeBytes?: number;
    uploadedBy?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.moduleId || !body.fileName || !body.fileUrl) {
    return NextResponse.json({ success: false, message: "moduleId, fileName, and fileUrl are required." }, { status: 400 });
  }

  const id = randomUUID();

  try {
    await prisma.$executeRawUnsafe(
      `
        INSERT INTO attachments
          (id, module_id, section_id, record_id, file_name, file_url, mime_type, size_bytes, uploaded_by)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
      id,
      body.moduleId,
      body.sectionId || null,
      body.recordId || null,
      body.fileName,
      body.fileUrl,
      body.mimeType || null,
      body.sizeBytes || null,
      body.uploadedBy || "System"
    );

    await writeAuditLog({
      action: "attachment:create",
      moduleId: body.moduleId,
      sectionId: body.sectionId,
      recordId: body.recordId,
      entityTable: "attachments",
      afterData: body
    });

    return NextResponse.json({ success: true, attachment: { id, ...body } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save attachment";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
