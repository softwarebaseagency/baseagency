CREATE TABLE "crm_clients" (
  "id" TEXT NOT NULL,
  "client_code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "industry" TEXT,
  "location" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "website" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "crm_clients_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm_contacts" (
  "id" TEXT NOT NULL,
  "client_id" TEXT,
  "name" TEXT NOT NULL,
  "title" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "whatsapp" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "crm_contacts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm_leads" (
  "id" TEXT NOT NULL,
  "lead_code" TEXT NOT NULL,
  "client_id" TEXT,
  "date_added" TIMESTAMP(3) NOT NULL,
  "client_name" TEXT NOT NULL,
  "contact_person" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "whatsapp" TEXT,
  "instagram_website" TEXT,
  "location" TEXT,
  "lead_source" TEXT NOT NULL,
  "industry" TEXT,
  "service_required" TEXT NOT NULL,
  "estimated_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "priority" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "next_follow_up" TIMESTAMP(3),
  "responsible_person" TEXT NOT NULL,
  "notes" TEXT,
  "created_by" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "crm_leads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm_deals" (
  "id" TEXT NOT NULL,
  "deal_code" TEXT NOT NULL,
  "lead_id" TEXT,
  "lead_code" TEXT NOT NULL,
  "client_name" TEXT NOT NULL,
  "service_project" TEXT NOT NULL,
  "pipeline_stage" TEXT NOT NULL,
  "deal_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "probability" INTEGER NOT NULL DEFAULT 10,
  "expected_revenue" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "expected_closing_date" TIMESTAMP(3),
  "responsible_person" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "crm_deals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm_contact_logs" (
  "id" TEXT NOT NULL,
  "contact_log_code" TEXT NOT NULL,
  "lead_id" TEXT,
  "lead_code" TEXT NOT NULL,
  "client_name" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "method" TEXT NOT NULL,
  "discussion_summary" TEXT NOT NULL,
  "next_action" TEXT NOT NULL,
  "next_follow_up" TIMESTAMP(3),
  "responsible_person" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "crm_contact_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm_meetings" (
  "id" TEXT NOT NULL,
  "meeting_code" TEXT NOT NULL,
  "lead_id" TEXT,
  "lead_code" TEXT NOT NULL,
  "client_name" TEXT NOT NULL,
  "meeting_date" TIMESTAMP(3) NOT NULL,
  "time" TEXT NOT NULL,
  "location" TEXT,
  "meeting_purpose" TEXT NOT NULL,
  "meeting_status" TEXT NOT NULL,
  "responsible_person" TEXT NOT NULL,
  "follow_up_required" TEXT NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "crm_meetings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm_proposals" (
  "id" TEXT NOT NULL,
  "proposal_code" TEXT NOT NULL,
  "lead_id" TEXT,
  "lead_code" TEXT NOT NULL,
  "client_name" TEXT NOT NULL,
  "project_service" TEXT NOT NULL,
  "proposal_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "date_sent" TIMESTAMP(3),
  "valid_until" TIMESTAMP(3),
  "status" TEXT NOT NULL,
  "follow_up_date" TIMESTAMP(3),
  "attachment_url" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "crm_proposals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm_quotations" (
  "id" TEXT NOT NULL,
  "quotation_code" TEXT NOT NULL,
  "lead_id" TEXT,
  "lead_code" TEXT NOT NULL,
  "client_name" TEXT NOT NULL,
  "service_item" TEXT NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "date_sent" TIMESTAMP(3),
  "valid_until" TIMESTAMP(3),
  "status" TEXT NOT NULL,
  "converted_to_invoice" TEXT NOT NULL DEFAULT 'No',
  "attachment_url" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "crm_quotations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm_closed_deals" (
  "id" TEXT NOT NULL,
  "deal_code" TEXT NOT NULL,
  "client_name" TEXT NOT NULL,
  "service_project" TEXT NOT NULL,
  "final_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "closing_date" TIMESTAMP(3) NOT NULL,
  "payment_status" TEXT NOT NULL,
  "project_started" TEXT NOT NULL,
  "responsible_person" TEXT NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "crm_closed_deals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm_lost_deals" (
  "id" TEXT NOT NULL,
  "lost_deal_code" TEXT NOT NULL,
  "client_name" TEXT NOT NULL,
  "service_project" TEXT NOT NULL,
  "estimated_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "lost_date" TIMESTAMP(3) NOT NULL,
  "reason_lost" TEXT NOT NULL,
  "responsible_person" TEXT NOT NULL,
  "future_follow_up" TEXT NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "crm_lost_deals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm_daily_sales_activities" (
  "id" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "salesperson" TEXT NOT NULL,
  "calls_made" INTEGER NOT NULL DEFAULT 0,
  "whatsapp_messages" INTEGER NOT NULL DEFAULT 0,
  "emails_sent" INTEGER NOT NULL DEFAULT 0,
  "meetings_scheduled" INTEGER NOT NULL DEFAULT 0,
  "proposals_sent" INTEGER NOT NULL DEFAULT 0,
  "quotations_sent" INTEGER NOT NULL DEFAULT 0,
  "follow_ups_completed" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "crm_daily_sales_activities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm_weekly_sales_reports" (
  "id" TEXT NOT NULL,
  "week_from" TIMESTAMP(3) NOT NULL,
  "week_to" TIMESTAMP(3) NOT NULL,
  "prepared_by" TEXT NOT NULL,
  "new_leads_added" INTEGER NOT NULL DEFAULT 0,
  "clients_contacted" INTEGER NOT NULL DEFAULT 0,
  "meetings_scheduled" INTEGER NOT NULL DEFAULT 0,
  "meetings_completed" INTEGER NOT NULL DEFAULT 0,
  "proposals_sent" INTEGER NOT NULL DEFAULT 0,
  "quotations_sent" INTEGER NOT NULL DEFAULT 0,
  "deals_approved" INTEGER NOT NULL DEFAULT 0,
  "deals_closed_won" INTEGER NOT NULL DEFAULT 0,
  "deals_closed_lost" INTEGER NOT NULL DEFAULT 0,
  "total_expected_pipeline_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "total_closed_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "weekly_sales_summary" TEXT,
  "main_problems" TEXT,
  "next_week_sales_plan" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "crm_weekly_sales_reports_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm_target_clients" (
  "id" TEXT NOT NULL,
  "no" INTEGER NOT NULL,
  "company_client_name" TEXT,
  "industry" TEXT NOT NULL,
  "location" TEXT,
  "contact_person" TEXT,
  "phone" TEXT,
  "instagram_website" TEXT,
  "service_opportunity" TEXT NOT NULL,
  "priority" TEXT NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "crm_target_clients_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm_sales_handovers" (
  "id" TEXT NOT NULL,
  "handover_code" TEXT NOT NULL,
  "client_name" TEXT NOT NULL,
  "project_service" TEXT NOT NULL,
  "approved_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "payment_status" TEXT NOT NULL,
  "handover_date" TIMESTAMP(3) NOT NULL,
  "approved_scope" TEXT NOT NULL,
  "client_requirements" TEXT,
  "files_materials_received" JSONB,
  "operations_responsible_person" TEXT NOT NULL,
  "sales_responsible_person" TEXT NOT NULL,
  "sales_signature" TEXT,
  "operations_signature" TEXT,
  "date" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "crm_sales_handovers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm_attachments" (
  "id" TEXT NOT NULL,
  "entity_type" TEXT NOT NULL,
  "entity_id" TEXT NOT NULL,
  "file_name" TEXT NOT NULL,
  "file_url" TEXT NOT NULL,
  "content_type" TEXT,
  "uploaded_by" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "crm_attachments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm_notifications" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "responsible_person" TEXT,
  "due_at" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "entity_type" TEXT,
  "entity_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "crm_notifications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "crm_clients_client_code_key" ON "crm_clients"("client_code");
CREATE INDEX "crm_clients_name_idx" ON "crm_clients"("name");
CREATE INDEX "crm_clients_status_idx" ON "crm_clients"("status");
CREATE INDEX "crm_contacts_client_id_idx" ON "crm_contacts"("client_id");
CREATE INDEX "crm_contacts_phone_idx" ON "crm_contacts"("phone");
CREATE INDEX "crm_contacts_email_idx" ON "crm_contacts"("email");

CREATE UNIQUE INDEX "crm_leads_lead_code_key" ON "crm_leads"("lead_code");
CREATE INDEX "crm_leads_lead_code_idx" ON "crm_leads"("lead_code");
CREATE INDEX "crm_leads_status_idx" ON "crm_leads"("status");
CREATE INDEX "crm_leads_priority_idx" ON "crm_leads"("priority");
CREATE INDEX "crm_leads_responsible_person_idx" ON "crm_leads"("responsible_person");
CREATE INDEX "crm_leads_next_follow_up_idx" ON "crm_leads"("next_follow_up");
CREATE INDEX "crm_leads_created_at_idx" ON "crm_leads"("created_at");

CREATE UNIQUE INDEX "crm_deals_deal_code_key" ON "crm_deals"("deal_code");
CREATE INDEX "crm_deals_deal_code_idx" ON "crm_deals"("deal_code");
CREATE INDEX "crm_deals_lead_code_idx" ON "crm_deals"("lead_code");
CREATE INDEX "crm_deals_pipeline_stage_idx" ON "crm_deals"("pipeline_stage");
CREATE INDEX "crm_deals_status_idx" ON "crm_deals"("status");
CREATE INDEX "crm_deals_responsible_person_idx" ON "crm_deals"("responsible_person");
CREATE INDEX "crm_deals_expected_closing_date_idx" ON "crm_deals"("expected_closing_date");

CREATE UNIQUE INDEX "crm_contact_logs_contact_log_code_key" ON "crm_contact_logs"("contact_log_code");
CREATE INDEX "crm_contact_logs_lead_code_idx" ON "crm_contact_logs"("lead_code");
CREATE INDEX "crm_contact_logs_date_idx" ON "crm_contact_logs"("date");
CREATE INDEX "crm_contact_logs_next_follow_up_idx" ON "crm_contact_logs"("next_follow_up");
CREATE INDEX "crm_contact_logs_responsible_person_idx" ON "crm_contact_logs"("responsible_person");

CREATE UNIQUE INDEX "crm_meetings_meeting_code_key" ON "crm_meetings"("meeting_code");
CREATE INDEX "crm_meetings_lead_code_idx" ON "crm_meetings"("lead_code");
CREATE INDEX "crm_meetings_meeting_date_idx" ON "crm_meetings"("meeting_date");
CREATE INDEX "crm_meetings_meeting_status_idx" ON "crm_meetings"("meeting_status");
CREATE INDEX "crm_meetings_responsible_person_idx" ON "crm_meetings"("responsible_person");

CREATE UNIQUE INDEX "crm_proposals_proposal_code_key" ON "crm_proposals"("proposal_code");
CREATE INDEX "crm_proposals_lead_code_idx" ON "crm_proposals"("lead_code");
CREATE INDEX "crm_proposals_status_idx" ON "crm_proposals"("status");
CREATE INDEX "crm_proposals_follow_up_date_idx" ON "crm_proposals"("follow_up_date");

CREATE UNIQUE INDEX "crm_quotations_quotation_code_key" ON "crm_quotations"("quotation_code");
CREATE INDEX "crm_quotations_lead_code_idx" ON "crm_quotations"("lead_code");
CREATE INDEX "crm_quotations_status_idx" ON "crm_quotations"("status");

CREATE UNIQUE INDEX "crm_closed_deals_deal_code_key" ON "crm_closed_deals"("deal_code");
CREATE INDEX "crm_closed_deals_deal_code_idx" ON "crm_closed_deals"("deal_code");
CREATE INDEX "crm_closed_deals_closing_date_idx" ON "crm_closed_deals"("closing_date");
CREATE INDEX "crm_closed_deals_payment_status_idx" ON "crm_closed_deals"("payment_status");
CREATE INDEX "crm_closed_deals_responsible_person_idx" ON "crm_closed_deals"("responsible_person");

CREATE UNIQUE INDEX "crm_lost_deals_lost_deal_code_key" ON "crm_lost_deals"("lost_deal_code");
CREATE INDEX "crm_lost_deals_lost_deal_code_idx" ON "crm_lost_deals"("lost_deal_code");
CREATE INDEX "crm_lost_deals_lost_date_idx" ON "crm_lost_deals"("lost_date");
CREATE INDEX "crm_lost_deals_reason_lost_idx" ON "crm_lost_deals"("reason_lost");
CREATE INDEX "crm_lost_deals_responsible_person_idx" ON "crm_lost_deals"("responsible_person");

CREATE INDEX "crm_daily_sales_activities_date_idx" ON "crm_daily_sales_activities"("date");
CREATE INDEX "crm_daily_sales_activities_salesperson_idx" ON "crm_daily_sales_activities"("salesperson");

CREATE INDEX "crm_weekly_sales_reports_week_from_idx" ON "crm_weekly_sales_reports"("week_from");
CREATE INDEX "crm_weekly_sales_reports_week_to_idx" ON "crm_weekly_sales_reports"("week_to");
CREATE INDEX "crm_weekly_sales_reports_prepared_by_idx" ON "crm_weekly_sales_reports"("prepared_by");

CREATE INDEX "crm_target_clients_industry_idx" ON "crm_target_clients"("industry");
CREATE INDEX "crm_target_clients_priority_idx" ON "crm_target_clients"("priority");

CREATE UNIQUE INDEX "crm_sales_handovers_handover_code_key" ON "crm_sales_handovers"("handover_code");
CREATE INDEX "crm_sales_handovers_handover_code_idx" ON "crm_sales_handovers"("handover_code");
CREATE INDEX "crm_sales_handovers_handover_date_idx" ON "crm_sales_handovers"("handover_date");
CREATE INDEX "crm_sales_handovers_operations_responsible_person_idx" ON "crm_sales_handovers"("operations_responsible_person");
CREATE INDEX "crm_sales_handovers_sales_responsible_person_idx" ON "crm_sales_handovers"("sales_responsible_person");

CREATE INDEX "crm_attachments_entity_type_entity_id_idx" ON "crm_attachments"("entity_type", "entity_id");
CREATE INDEX "crm_notifications_status_idx" ON "crm_notifications"("status");
CREATE INDEX "crm_notifications_due_at_idx" ON "crm_notifications"("due_at");
CREATE INDEX "crm_notifications_responsible_person_idx" ON "crm_notifications"("responsible_person");

ALTER TABLE "crm_contacts" ADD CONSTRAINT "crm_contacts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "crm_clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "crm_leads" ADD CONSTRAINT "crm_leads_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "crm_clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "crm_deals" ADD CONSTRAINT "crm_deals_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "crm_leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "crm_contact_logs" ADD CONSTRAINT "crm_contact_logs_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "crm_leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "crm_meetings" ADD CONSTRAINT "crm_meetings_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "crm_leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "crm_proposals" ADD CONSTRAINT "crm_proposals_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "crm_leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "crm_quotations" ADD CONSTRAINT "crm_quotations_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "crm_leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
