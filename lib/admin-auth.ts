import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

const ADMIN_ROLES = new Set(["admin", "Admin / System Owner", "CEO / Founder", "COO / Operations Leadership"]);

export type AdminUser = {
  id: string;
  name: string;
  role: string;
};

export function isAdminRole(role?: string | null) {
  return Boolean(role && ADMIN_ROLES.has(role));
}

function isLocalHost(host?: string | null) {
  return Boolean(host && /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host));
}

export function getCurrentAdminUser(): AdminUser | null {
  const host = headers().get("host");
  const headerRole = headers().get("x-base-role");
  const cookieRole = cookies().get("base_role")?.value || cookies().get("base-agency-role")?.value;
  const role = headerRole || cookieRole || (isLocalHost(host) || process.env.NODE_ENV !== "production" ? "Admin / System Owner" : null);

  if (!isAdminRole(role)) return null;

  return {
    id: headers().get("x-base-user-id") || "admin-local",
    name: headers().get("x-base-user-name") || "Base Agency Admin",
    role: role as string
  };
}

export function requireAdmin() {
  const user = getCurrentAdminUser();
  if (!user) redirect("/settings");
  return user;
}

export function requireAdminApi(request: Request) {
  const host = request.headers.get("host");
  const role =
    request.headers.get("x-base-role") ||
    cookies().get("base_role")?.value ||
    cookies().get("base-agency-role")?.value ||
    (isLocalHost(host) || process.env.NODE_ENV !== "production" ? "Admin / System Owner" : null);

  if (!isAdminRole(role)) {
    return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
  }

  return null;
}
