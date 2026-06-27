CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'LATE', 'ABSENT');
CREATE TYPE "AttendanceSource" AS ENUM ('ZKTECO_ADMS', 'MANUAL', 'IMPORT');
CREATE TYPE "AttendanceSyncStatus" AS ENUM ('SUCCESS', 'FAILED', 'PARTIAL');

CREATE TABLE IF NOT EXISTS "devices" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "serial_number" TEXT NOT NULL,
  "ip_address" TEXT,
  "port" INTEGER NOT NULL DEFAULT 8081,
  "model" TEXT,
  "location" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "last_seen_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "employees" (
  "id" TEXT NOT NULL,
  "employee_code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "department" TEXT,
  "position" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "attendance_logs" (
  "id" TEXT NOT NULL,
  "employee_id" TEXT NOT NULL,
  "device_id" TEXT NOT NULL,
  "employee_code" TEXT NOT NULL,
  "check_in_time" TIMESTAMP(3),
  "check_out_time" TIMESTAMP(3),
  "attendance_date" DATE NOT NULL,
  "raw_timestamp" TIMESTAMP(3) NOT NULL,
  "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
  "source" "AttendanceSource" NOT NULL DEFAULT 'ZKTECO_ADMS',
  "raw_payload" JSONB,
  "unique_key" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "attendance_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "sync_logs" (
  "id" TEXT NOT NULL,
  "device_id" TEXT,
  "sync_type" TEXT NOT NULL,
  "status" "AttendanceSyncStatus" NOT NULL,
  "message" TEXT NOT NULL,
  "payload" JSONB,
  "started_at" TIMESTAMP(3) NOT NULL,
  "finished_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "devices_serial_number_key" ON "devices"("serial_number");
CREATE INDEX IF NOT EXISTS "devices_serial_number_idx" ON "devices"("serial_number");
CREATE INDEX IF NOT EXISTS "devices_is_active_idx" ON "devices"("is_active");
CREATE UNIQUE INDEX IF NOT EXISTS "employees_employee_code_key" ON "employees"("employee_code");
CREATE INDEX IF NOT EXISTS "employees_employee_code_idx" ON "employees"("employee_code");
CREATE INDEX IF NOT EXISTS "employees_name_idx" ON "employees"("name");
CREATE INDEX IF NOT EXISTS "employees_is_active_idx" ON "employees"("is_active");
CREATE UNIQUE INDEX IF NOT EXISTS "attendance_logs_unique_key_key" ON "attendance_logs"("unique_key");
CREATE INDEX IF NOT EXISTS "attendance_logs_employee_code_idx" ON "attendance_logs"("employee_code");
CREATE INDEX IF NOT EXISTS "attendance_logs_attendance_date_idx" ON "attendance_logs"("attendance_date");
CREATE INDEX IF NOT EXISTS "attendance_logs_raw_timestamp_idx" ON "attendance_logs"("raw_timestamp");
CREATE INDEX IF NOT EXISTS "attendance_logs_status_idx" ON "attendance_logs"("status");
CREATE INDEX IF NOT EXISTS "sync_logs_device_id_idx" ON "sync_logs"("device_id");
CREATE INDEX IF NOT EXISTS "sync_logs_status_idx" ON "sync_logs"("status");
CREATE INDEX IF NOT EXISTS "sync_logs_started_at_idx" ON "sync_logs"("started_at");

ALTER TABLE "attendance_logs"
  ADD CONSTRAINT "attendance_logs_employee_id_fkey"
  FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "attendance_logs"
  ADD CONSTRAINT "attendance_logs_device_id_fkey"
  FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sync_logs"
  ADD CONSTRAINT "sync_logs_device_id_fkey"
  FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
