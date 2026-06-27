ALTER TABLE "zkteco_devices"
  ADD COLUMN IF NOT EXISTS "serial_number" TEXT,
  ADD COLUMN IF NOT EXISTS "model" TEXT,
  ADD COLUMN IF NOT EXISTS "last_heartbeat_at" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "zkteco_devices_serial_number_key" ON "zkteco_devices"("serial_number");
CREATE INDEX IF NOT EXISTS "zkteco_devices_serial_number_idx" ON "zkteco_devices"("serial_number");

CREATE TABLE IF NOT EXISTS "zkteco_employees" (
  "id" TEXT NOT NULL,
  "device_id" TEXT,
  "user_id" TEXT NOT NULL,
  "name" TEXT,
  "department" TEXT,
  "position" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "raw_payload" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "zkteco_employees_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "zkteco_device_commands" (
  "id" TEXT NOT NULL,
  "device_id" TEXT,
  "command_code" TEXT NOT NULL,
  "command" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "response" TEXT,
  "sent_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "zkteco_device_commands_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "zkteco_debug_logs" (
  "id" TEXT NOT NULL,
  "device_id" TEXT,
  "serial_number" TEXT,
  "method" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "query_params" JSONB,
  "headers" JSONB,
  "raw_body" TEXT,
  "response_body" TEXT NOT NULL,
  "remote_address" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "zkteco_debug_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "zkteco_employees_device_id_user_id_key" ON "zkteco_employees"("device_id", "user_id");
CREATE INDEX IF NOT EXISTS "zkteco_employees_user_id_idx" ON "zkteco_employees"("user_id");
CREATE INDEX IF NOT EXISTS "zkteco_employees_name_idx" ON "zkteco_employees"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "zkteco_device_commands_command_code_key" ON "zkteco_device_commands"("command_code");
CREATE INDEX IF NOT EXISTS "zkteco_device_commands_device_id_idx" ON "zkteco_device_commands"("device_id");
CREATE INDEX IF NOT EXISTS "zkteco_device_commands_status_idx" ON "zkteco_device_commands"("status");
CREATE INDEX IF NOT EXISTS "zkteco_debug_logs_serial_number_idx" ON "zkteco_debug_logs"("serial_number");
CREATE INDEX IF NOT EXISTS "zkteco_debug_logs_path_idx" ON "zkteco_debug_logs"("path");
CREATE INDEX IF NOT EXISTS "zkteco_debug_logs_created_at_idx" ON "zkteco_debug_logs"("created_at");

ALTER TABLE "zkteco_employees"
  ADD CONSTRAINT "zkteco_employees_device_id_fkey"
  FOREIGN KEY ("device_id") REFERENCES "zkteco_devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "zkteco_device_commands"
  ADD CONSTRAINT "zkteco_device_commands_device_id_fkey"
  FOREIGN KEY ("device_id") REFERENCES "zkteco_devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "zkteco_debug_logs"
  ADD CONSTRAINT "zkteco_debug_logs_device_id_fkey"
  FOREIGN KEY ("device_id") REFERENCES "zkteco_devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
