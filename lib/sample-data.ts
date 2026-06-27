export const dashboardStats = [
  { label: "Monthly Revenue", value: 24800, tone: "positive" },
  { label: "Monthly Expenses", value: 9300, tone: "warning" },
  { label: "Net Profit", value: 15500, tone: "positive" },
  { label: "Unpaid Balances", value: 6400, tone: "danger" }
];

export const recentSales = [
  {
    customer: "Zheen Market",
    section: "Website Development",
    service: "E-commerce website",
    status: "IN_PROGRESS",
    total: 4200,
    paid: 2500
  },
  {
    customer: "Roj Clinic",
    section: "Advertising Campaigns",
    service: "Meta ads campaign",
    status: "COMPLETED",
    total: 1800,
    paid: 1800
  },
  {
    customer: "Nali Group",
    section: "Software/System Development",
    service: "Internal CRM",
    status: "LEAD",
    total: 7800,
    paid: 1000
  }
];

export const recentExpenses = [
  { title: "Office rent", category: "Office", amount: 1200, status: "PAID" },
  { title: "Designer tools", category: "Software", amount: 240, status: "PAID" },
  { title: "Campaign assets", category: "Marketing", amount: 650, status: "UNPAID" }
];

export const salesBySection = [
  { section: "Website Development", total: 9500 },
  { section: "Social Media Management", total: 4200 },
  { section: "Graphic Design", total: 2600 },
  { section: "Advertising Campaigns", total: 5100 },
  { section: "Software/System Development", total: 12800 },
  { section: "Other Services", total: 1300 }
];

export const customers = [
  {
    name: "Zheen Market",
    phone: "+9647501112233",
    email: "hello@zheen.example",
    source: "Website",
    interest: "Website Development",
    status: "QUALIFIED"
  },
  {
    name: "Roj Clinic",
    phone: "+9647514445566",
    email: "info@rojclinic.example",
    source: "Referral",
    interest: "Advertising Campaigns",
    status: "CUSTOMER"
  },
  {
    name: "Nali Group",
    phone: "+9647708889900",
    email: "contact@nali.example",
    source: "WhatsApp",
    interest: "Software/System Development",
    status: "NEW"
  }
];

export const expenses = [
  {
    title: "Office rent",
    type: "Monthly recurring",
    category: "Office",
    amount: 1200,
    date: "2026-06-01",
    status: "PAID"
  },
  {
    title: "Client meeting lunch",
    type: "Daily",
    category: "Operations",
    amount: 85,
    date: "2026-06-18",
    status: "PAID"
  },
  {
    title: "New camera lens",
    type: "One-time",
    category: "Equipment",
    amount: 700,
    date: "2026-06-12",
    status: "PARTIAL"
  }
];

export const teamMembers = [
  {
    name: "Ari Ahmed",
    role: "Project Manager",
    workType: "FULL_TIME",
    salary: 1600,
    status: "ACTIVE"
  },
  {
    name: "Lana Karim",
    role: "Graphic Designer",
    workType: "PART_TIME",
    salary: 900,
    status: "ACTIVE"
  },
  {
    name: "Diyar Omar",
    role: "Developer",
    workType: "CONTRACT",
    salary: 2200,
    status: "ACTIVE"
  }
];
