const FULL_ACCESS_ROLES = new Set(["CEO / Founder", "Admin / System Owner", "admin"]);

const MODULE_ACCESS: Record<string, string[]> = {
  ceo: ["CEO / Founder", "COO / Operations Leadership", "Management", "Admin / System Owner"],
  management: ["CEO / Founder", "COO / Operations Leadership", "Management", "Admin / System Owner"],
  sales: ["CEO / Founder", "COO / Operations Leadership", "Management", "Sales / Client Relations", "Admin / System Owner"],
  outreach: ["CEO / Founder", "COO / Operations Leadership", "Management", "Sales / Client Relations", "Admin / System Owner"],
  finance: ["CEO / Founder", "Finance", "Admin / System Owner"],
  hr: ["CEO / Founder", "HR / Office Admin", "Admin / System Owner"],
  operations: ["CEO / Founder", "COO / Operations Leadership", "Operations Manager", "Project Manager", "Admin / System Owner"],
  packages: ["CEO / Founder", "COO / Operations Leadership", "Management", "Sales / Client Relations", "Finance", "Admin / System Owner"],
  commercial: ["CEO / Founder", "COO / Operations Leadership", "Management", "Sales / Client Relations", "Finance", "Operations Manager", "Project Manager", "Admin / System Owner"],
  approvals: ["CEO / Founder", "COO / Operations Leadership", "Management", "Finance", "HR / Office Admin", "Operations Manager", "Admin / System Owner"],
  documents: ["CEO / Founder", "COO / Operations Leadership", "Management", "Admin / System Owner"],
  requirements: ["CEO / Founder", "Admin / System Owner"]
};

const HIGHLY_RESTRICTED_SECTIONS = new Set([
  "finance:salary",
  "hr:disciplinary",
  "hr:exit",
  "hr:clearance",
  "management:risk-compliance",
  "approvals:ceo-approvals"
]);

export function roleFromRequest(request: Request) {
  return request.headers.get("x-base-role") || "Admin / System Owner";
}

export function canAccessModule(role: string, moduleId: string, sectionId?: string) {
  if (FULL_ACCESS_ROLES.has(role)) return true;
  if (sectionId && HIGHLY_RESTRICTED_SECTIONS.has(`${moduleId}:${sectionId}`)) return false;
  return MODULE_ACCESS[moduleId]?.includes(role) || false;
}
