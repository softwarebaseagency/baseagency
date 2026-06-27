CREATE TABLE IF NOT EXISTS "commercial_documents" (
  "id" TEXT NOT NULL,
  "document_no" TEXT NOT NULL,
  "document_type" TEXT NOT NULL,
  "lead_code" TEXT,
  "related_document_no" TEXT,
  "client_supplier_name" TEXT,
  "project_code" TEXT,
  "owner" TEXT,
  "amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'Draft',
  "approval_status" TEXT NOT NULL DEFAULT 'Pending Approval',
  "approved_by" TEXT,
  "approved_at" TIMESTAMP(3),
  "issue_date" TIMESTAMP(3),
  "due_date" TIMESTAMP(3),
  "signed_confirmed" TEXT NOT NULL DEFAULT 'No',
  "attachment_url" TEXT,
  "version" TEXT NOT NULL DEFAULT '1.0',
  "is_locked" BOOLEAN NOT NULL DEFAULT false,
  "archive_status" TEXT NOT NULL DEFAULT 'Open',
  "notes" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT,
  "deleted_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "commercial_documents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "commercial_payments" (
  "id" TEXT NOT NULL,
  "payment_no" TEXT NOT NULL,
  "related_document_no" TEXT,
  "payment_type" TEXT NOT NULL DEFAULT 'Client Payment',
  "client_supplier_name" TEXT,
  "project_code" TEXT,
  "amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "payment_method" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Recorded',
  "paid_at" TIMESTAMP(3),
  "received_paid_by" TEXT,
  "attachment_url" TEXT,
  "notes" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT,
  "deleted_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "commercial_payments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "commercial_receipts" (
  "id" TEXT NOT NULL,
  "receipt_no" TEXT NOT NULL,
  "related_document_no" TEXT,
  "client_supplier_name" TEXT,
  "project_code" TEXT,
  "amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "payment_method" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Issued',
  "received_date" TIMESTAMP(3),
  "received_by" TEXT,
  "attachment_url" TEXT,
  "notes" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT,
  "deleted_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "commercial_receipts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "commercial_suppliers" (
  "id" TEXT NOT NULL,
  "supplier_code" TEXT NOT NULL,
  "supplier_name" TEXT NOT NULL,
  "category" TEXT,
  "contact_person" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "address" TEXT,
  "payment_terms" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Active',
  "notes" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT,
  "deleted_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "commercial_suppliers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "commercial_archives" (
  "id" TEXT NOT NULL,
  "archive_code" TEXT NOT NULL,
  "document_chain" TEXT,
  "client_supplier_name" TEXT,
  "project_code" TEXT,
  "quotation_no" TEXT,
  "delivery_note_no" TEXT,
  "invoice_no" TEXT,
  "payment_no" TEXT,
  "receipt_no" TEXT,
  "archive_status" TEXT NOT NULL DEFAULT 'Final',
  "locked_by" TEXT,
  "locked_at" TIMESTAMP(3),
  "storage_location" TEXT,
  "notes" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT,
  "deleted_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "commercial_archives_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "commercial_documents_document_no_key" ON "commercial_documents"("document_no");
CREATE INDEX IF NOT EXISTS "commercial_documents_type_status_idx" ON "commercial_documents"("document_type", "status");
CREATE INDEX IF NOT EXISTS "commercial_documents_project_idx" ON "commercial_documents"("project_code");
CREATE UNIQUE INDEX IF NOT EXISTS "commercial_payments_payment_no_key" ON "commercial_payments"("payment_no");
CREATE INDEX IF NOT EXISTS "commercial_payments_related_idx" ON "commercial_payments"("related_document_no");
CREATE UNIQUE INDEX IF NOT EXISTS "commercial_receipts_receipt_no_key" ON "commercial_receipts"("receipt_no");
CREATE INDEX IF NOT EXISTS "commercial_receipts_related_idx" ON "commercial_receipts"("related_document_no");
CREATE UNIQUE INDEX IF NOT EXISTS "commercial_suppliers_supplier_code_key" ON "commercial_suppliers"("supplier_code");
CREATE UNIQUE INDEX IF NOT EXISTS "commercial_archives_archive_code_key" ON "commercial_archives"("archive_code");
