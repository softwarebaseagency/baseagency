CREATE TYPE "ZktecoDeviceStatus" AS ENUM ('ONLINE', 'OFFLINE', 'UNKNOWN');

CREATE TYPE "ZktecoSyncStatus" AS ENUM (
  'SUCCESS',
  'DEVICE_OFFLINE',
  'WRONG_IP',
  'TIMEOUT',
  'API_TOKEN_INVALID',
  'DATABASE_ERROR',
  'PARTIAL_SYNC',
  'FAILED',
  'PENDING'
);

CREATE TABLE "zkteco_devices" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "ip_address" TEXT NOT NULL,
  "port" INTEGER NOT NULL DEFAULT 4370,
  "location" TEXT,
  "status" "ZktecoDeviceStatus" NOT NULL DEFAULT 'UNKNOWN',
  "last_seen_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "zkteco_devices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "zkteco_users" (
  "id" TEXT NOT NULL,
  "device_id" TEXT NOT NULL,
  "zkteco_user_id" TEXT NOT NULL,
  "name" TEXT,
  "card_number" TEXT,
  "privilege" TEXT,
  "raw_payload" JSONB,
  "last_synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "zkteco_users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "zkteco_sync_batches" (
  "id" TEXT NOT NULL,
  "device_id" TEXT NOT NULL,
  "batch_id" TEXT NOT NULL,
  "started_at" TIMESTAMP(3) NOT NULL,
  "finished_at" TIMESTAMP(3),
  "status" "ZktecoSyncStatus" NOT NULL DEFAULT 'PENDING',
  "logs_fetched" INTEGER NOT NULL DEFAULT 0,
  "logs_inserted" INTEGER NOT NULL DEFAULT 0,
  "duplicates_skipped" INTEGER NOT NULL DEFAULT 0,
  "users_fetched" INTEGER NOT NULL DEFAULT 0,
  "users_inserted" INTEGER NOT NULL DEFAULT 0,
  "error_code" TEXT,
  "error_message" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "zkteco_sync_batches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "zkteco_attendance_logs" (
  "id" TEXT NOT NULL,
  "device_id" TEXT NOT NULL,
  "zkteco_user_id" TEXT NOT NULL,
  "employee_name" TEXT,
  "attendance_timestamp" TIMESTAMP(3) NOT NULL,
  "punch_type" TEXT,
  "verify_type" TEXT,
  "work_code" TEXT,
  "raw_payload" JSONB,
  "sync_batch_id" TEXT,
  "unique_key" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "zkteco_attendance_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "zkteco_devices_ip_address_key" ON "zkteco_devices"("ip_address");
CREATE INDEX "zkteco_devices_status_idx" ON "zkteco_devices"("status");

CREATE INDEX "zkteco_users_zkteco_user_id_idx" ON "zkteco_users"("zkteco_user_id");
CREATE INDEX "zkteco_users_name_idx" ON "zkteco_users"("name");
CREATE UNIQUE INDEX "zkteco_users_device_id_zkteco_user_id_key" ON "zkteco_users"("device_id", "zkteco_user_id");

CREATE UNIQUE INDEX "zkteco_sync_batches_batch_id_key" ON "zkteco_sync_batches"("batch_id");
CREATE INDEX "zkteco_sync_batches_device_id_idx" ON "zkteco_sync_batches"("device_id");
CREATE INDEX "zkteco_sync_batches_status_idx" ON "zkteco_sync_batches"("status");
CREATE INDEX "zkteco_sync_batches_started_at_idx" ON "zkteco_sync_batches"("started_at");

CREATE UNIQUE INDEX "zkteco_attendance_logs_unique_key_key" ON "zkteco_attendance_logs"("unique_key");
CREATE INDEX "zkteco_attendance_logs_device_id_idx" ON "zkteco_attendance_logs"("device_id");
CREATE INDEX "zkteco_attendance_logs_zkteco_user_id_idx" ON "zkteco_attendance_logs"("zkteco_user_id");
CREATE INDEX "zkteco_attendance_logs_attendance_timestamp_idx" ON "zkteco_attendance_logs"("attendance_timestamp");
CREATE INDEX "zkteco_attendance_logs_sync_batch_id_idx" ON "zkteco_attendance_logs"("sync_batch_id");

ALTER TABLE "zkteco_users"
  ADD CONSTRAINT "zkteco_users_device_id_fkey"
  FOREIGN KEY ("device_id") REFERENCES "zkteco_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "zkteco_sync_batches"
  ADD CONSTRAINT "zkteco_sync_batches_device_id_fkey"
  FOREIGN KEY ("device_id") REFERENCES "zkteco_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "zkteco_attendance_logs"
  ADD CONSTRAINT "zkteco_attendance_logs_device_id_fkey"
  FOREIGN KEY ("device_id") REFERENCES "zkteco_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "zkteco_attendance_logs"
  ADD CONSTRAINT "zkteco_attendance_logs_sync_batch_id_fkey"
  FOREIGN KEY ("sync_batch_id") REFERENCES "zkteco_sync_batches"("batch_id") ON DELETE SET NULL ON UPDATE CASCADE;
