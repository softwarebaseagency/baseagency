type Translator = (key: string) => string;

const statusKeyMap: Record<string, string> = {
  PAID: "status.paid",
  UNPAID: "status.unpaid",
  PARTIAL: "status.partial",
  OVERDUE: "status.overdue",
  ACTIVE: "status.active",
  INACTIVE: "status.inactive",
  COMPLETED: "status.completed",
  CANCELLED: "status.cancelled",
  NEW: "status.new",
  CONTACTED: "status.contacted",
  QUALIFIED: "status.qualified",
  CUSTOMER: "status.customer",
  LOST: "status.lost",
  LEAD: "status.lead",
  IN_PROGRESS: "status.inProgress"
};

const typeKeyMap: Record<string, string> = {
  DAILY: "type.daily",
  MONTHLY_RECURRING: "type.monthlyRecurring",
  ONE_TIME: "type.oneTime",
  FULL_TIME: "type.fullTime",
  PART_TIME: "type.partTime",
  CONTRACT: "type.contract",
  FREELANCE: "type.freelance",
  SALARY: "type.salary",
  BONUS: "type.bonus",
  COMMISSION: "type.commission",
  ADVANCE: "type.advance"
};

const roleKeyMap: Record<string, string> = {
  CEO: "role.ceo",
  COO: "role.coo",
  CTO: "role.cto",
  "Software Developer": "role.softwareDeveloper"
};

export function translateStatus(t: Translator, value: string) {
  const key = statusKeyMap[value];
  return key ? t(key) : value;
}

export function translateType(t: Translator, value: string) {
  const key = typeKeyMap[value];
  return key ? t(key) : value;
}

export function translateRole(t: Translator, value: string) {
  const key = roleKeyMap[value];
  return key ? t(key) : value;
}

export function translateTemplate(t: Translator, key: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (message, [name, value]) => message.replaceAll(`{${name}}`, value),
    t(key)
  );
}
