export type CustomerStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "CUSTOMER" | "LOST";
export type PaymentStatus = "PAID" | "UNPAID" | "PARTIAL" | "OVERDUE";
export type SaleStatus = "LEAD" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type ExpenseType = "DAILY" | "MONTHLY_RECURRING" | "ONE_TIME";
export type TeamStatus = "ACTIVE" | "INACTIVE";
export type WorkType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "FREELANCE";
export type TeamPaymentType = "SALARY" | "BONUS" | "COMMISSION" | "ADVANCE";

export type Customer = {
  id: string;
  fullName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  source: string;
  serviceInterest: string;
  status: CustomerStatus;
  notes: string;
  createdAt: string;
};

export type SalesSection = {
  id: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
};

export type Sale = {
  id: string;
  customerId: string;
  sectionId: string;
  serviceTitle: string;
  totalPrice: number;
  discount: number;
  extraFees: number;
  finalTotal: number;
  paidAmount: number;
  remainingAmount: number;
  projectCost: number;
  netProfit: number;
  status: SaleStatus;
  paymentStatus: PaymentStatus;
  deadline: string;
  notes: string;
  createdAt: string;
};

export type Expense = {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  type: ExpenseType;
  paymentStatus: PaymentStatus;
  paidBy: string;
  notes: string;
  attachment: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  salary: number;
  workType: WorkType;
  startDate: string;
  status: TeamStatus;
  notes: string;
};

export type TeamPayment = {
  id: string;
  teamMemberId: string;
  type: TeamPaymentType;
  amount: number;
  paidAt: string;
  notes: string;
};

export type CrmData = {
  customers: Customer[];
  salesSections: SalesSection[];
  sales: Sale[];
  expenses: Expense[];
  teamMembers: TeamMember[];
  teamPayments: TeamPayment[];
  expenseCategories: string[];
  settings: AppSettings;
};

export type AppSettings = {
  companyName: string;
  currency: string;
  dateFormat: string;
  timezone: string;
  defaultLanguage: string;
  enabledLanguages: string[];
  customCursor: boolean;
  animations: boolean;
  compactMode: boolean;
  sidebarStyle: "navy" | "light";
};

export const defaultSalesSections: SalesSection[] = [
  { id: "website", name: "Website Development", isActive: true, sortOrder: 1 },
  { id: "social", name: "Social Media Management", isActive: true, sortOrder: 2 },
  { id: "graphic", name: "Graphic Design", isActive: true, sortOrder: 3 },
  { id: "campaigns", name: "Advertising Campaigns", isActive: true, sortOrder: 4 },
  { id: "software", name: "Software/System Development", isActive: true, sortOrder: 5 },
  { id: "other", name: "Other Services", isActive: true, sortOrder: 6 }
];

export const initialCrmData: CrmData = {
  customers: [
    {
      id: "cust-zheen",
      fullName: "Zheen Market",
      phone: "+9647501112233",
      whatsapp: "+9647501112233",
      email: "hello@zheenmarket.krd",
      address: "Erbil, Empire Business Towers",
      source: "Website",
      serviceInterest: "Website Development",
      status: "QUALIFIED",
      notes: "Needs a premium e-commerce experience with product sync.",
      createdAt: "2026-06-03"
    },
    {
      id: "cust-roj",
      fullName: "Roj Clinic",
      phone: "+9647514445566",
      whatsapp: "+9647514445566",
      email: "info@rojclinic.krd",
      address: "Sulaimani, Salim Street",
      source: "Referral",
      serviceInterest: "Advertising Campaigns",
      status: "CUSTOMER",
      notes: "Monthly campaigns and landing page optimization.",
      createdAt: "2026-06-08"
    },
    {
      id: "cust-nali",
      fullName: "Nali Group",
      phone: "+9647708889900",
      whatsapp: "+9647708889900",
      email: "contact@naligroup.krd",
      address: "Duhok, Malta",
      source: "WhatsApp",
      serviceInterest: "Software/System Development",
      status: "NEW",
      notes: "Interested in internal operations system.",
      createdAt: "2026-06-13"
    },
    {
      id: "cust-havin",
      fullName: "Havin Properties",
      phone: "+9647502227788",
      whatsapp: "+9647502227788",
      email: "brand@havinproperties.krd",
      address: "Erbil, Dream City",
      source: "Instagram",
      serviceInterest: "Social Media Management",
      status: "CONTACTED",
      notes: "Wants visual identity and monthly content calendar.",
      createdAt: "2026-06-17"
    }
  ],
  salesSections: defaultSalesSections,
  sales: [
    {
      id: "sale-zheen-site",
      customerId: "cust-zheen",
      sectionId: "website",
      serviceTitle: "Premium e-commerce website",
      totalPrice: 5200,
      discount: 400,
      extraFees: 250,
      finalTotal: 5050,
      paidAmount: 2800,
      remainingAmount: 2250,
      projectCost: 1550,
      netProfit: 3500,
      status: "IN_PROGRESS",
      paymentStatus: "PARTIAL",
      deadline: "2026-07-20",
      notes: "Homepage, product catalog, checkout, and admin training.",
      createdAt: "2026-06-06"
    },
    {
      id: "sale-roj-ads",
      customerId: "cust-roj",
      sectionId: "campaigns",
      serviceTitle: "Meta lead generation campaign",
      totalPrice: 1800,
      discount: 0,
      extraFees: 120,
      finalTotal: 1920,
      paidAmount: 1920,
      remainingAmount: 0,
      projectCost: 520,
      netProfit: 1400,
      status: "COMPLETED",
      paymentStatus: "PAID",
      deadline: "2026-06-25",
      notes: "Campaign setup, creative testing, and weekly report.",
      createdAt: "2026-06-10"
    },
    {
      id: "sale-nali-system",
      customerId: "cust-nali",
      sectionId: "software",
      serviceTitle: "Operations CRM discovery",
      totalPrice: 7800,
      discount: 300,
      extraFees: 0,
      finalTotal: 7500,
      paidAmount: 1000,
      remainingAmount: 6500,
      projectCost: 2800,
      netProfit: 4700,
      status: "LEAD",
      paymentStatus: "PARTIAL",
      deadline: "2026-08-10",
      notes: "Discovery phase and technical proposal.",
      createdAt: "2026-06-16"
    },
    {
      id: "sale-havin-social",
      customerId: "cust-havin",
      sectionId: "social",
      serviceTitle: "Monthly social media management",
      totalPrice: 1400,
      discount: 0,
      extraFees: 100,
      finalTotal: 1500,
      paidAmount: 0,
      remainingAmount: 1500,
      projectCost: 480,
      netProfit: 1020,
      status: "IN_PROGRESS",
      paymentStatus: "UNPAID",
      deadline: "2026-07-01",
      notes: "Content plan, captions, design, and account management.",
      createdAt: "2026-06-18"
    }
  ],
  expenses: [
    {
      id: "exp-rent",
      title: "Office rent",
      category: "Office",
      amount: 1200,
      date: "2026-06-01",
      type: "MONTHLY_RECURRING",
      paymentStatus: "PAID",
      paidBy: "Omer Abdulrahman",
      notes: "Monthly office rental.",
      attachment: ""
    },
    {
      id: "exp-tools",
      title: "Design software subscriptions",
      category: "Software",
      amount: 340,
      date: "2026-06-05",
      type: "MONTHLY_RECURRING",
      paymentStatus: "PAID",
      paidBy: "Rawaz Rebaz",
      notes: "Creative and development tool licenses.",
      attachment: ""
    },
    {
      id: "exp-shoot",
      title: "Campaign photoshoot production",
      category: "Production",
      amount: 680,
      date: "2026-06-15",
      type: "ONE_TIME",
      paymentStatus: "PARTIAL",
      paidBy: "Abdulsabur",
      notes: "Studio, props, and assistant cost.",
      attachment: ""
    },
    {
      id: "exp-meeting",
      title: "Client strategy meeting",
      category: "Operations",
      amount: 95,
      date: "2026-06-19",
      type: "DAILY",
      paymentStatus: "PAID",
      paidBy: "Muhamad Aram",
      notes: "Meeting hospitality for discovery workshop.",
      attachment: ""
    }
  ],
  teamMembers: [
    {
      id: "team-omer",
      name: "Omer Abdulrahman",
      role: "CEO",
      phone: "+9647501000001",
      email: "omer@base.agy",
      salary: 3000,
      workType: "FULL_TIME",
      startDate: "2025-01-01",
      status: "ACTIVE",
      notes: "Founder and executive lead."
    },
    {
      id: "team-abdulsabur",
      name: "Abdulsabur",
      role: "COO",
      phone: "+9647501000002",
      email: "abdulsabur@base.agy",
      salary: 2400,
      workType: "FULL_TIME",
      startDate: "2025-01-01",
      status: "ACTIVE",
      notes: "Operations and delivery oversight."
    },
    {
      id: "team-rawaz",
      name: "Rawaz Rebaz",
      role: "CTO",
      phone: "+9647501000003",
      email: "rawaz@base.agy",
      salary: 2800,
      workType: "FULL_TIME",
      startDate: "2025-02-01",
      status: "ACTIVE",
      notes: "Technology strategy and engineering quality."
    },
    {
      id: "team-muhamad",
      name: "Muhamad Aram",
      role: "Software Developer",
      phone: "+9647501000004",
      email: "muhamad@base.agy",
      salary: 1800,
      workType: "FULL_TIME",
      startDate: "2025-04-01",
      status: "ACTIVE",
      notes: "Full-stack development and integrations."
    }
  ],
  teamPayments: [
    {
      id: "pay-omer-june",
      teamMemberId: "team-omer",
      type: "SALARY",
      amount: 3000,
      paidAt: "2026-06-20",
      notes: "June salary"
    },
    {
      id: "pay-abdulsabur-bonus",
      teamMemberId: "team-abdulsabur",
      type: "BONUS",
      amount: 350,
      paidAt: "2026-06-18",
      notes: "Delivery bonus"
    },
    {
      id: "pay-muhamad-commission",
      teamMemberId: "team-muhamad",
      type: "COMMISSION",
      amount: 220,
      paidAt: "2026-06-17",
      notes: "Software discovery commission"
    }
  ],
  expenseCategories: ["Office", "Software", "Production", "Operations", "Marketing", "Equipment"],
  settings: {
    companyName: "Base Agency",
    currency: "USD",
    dateFormat: "DD MMM YYYY",
    timezone: "Asia/Baghdad",
    defaultLanguage: "en",
    enabledLanguages: ["ku-sorani", "ku-behdini", "ar", "en"],
    customCursor: true,
    animations: true,
    compactMode: false,
    sidebarStyle: "navy"
  }
};

export function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function calculateSale(input: {
  totalPrice: number;
  extraFees: number;
  discount: number;
  paidAmount: number;
  projectCost: number;
}) {
  const finalTotal = input.totalPrice + input.extraFees - input.discount;
  const remainingAmount = finalTotal - input.paidAmount;
  const netProfit = finalTotal - input.projectCost;
  const paymentStatus: PaymentStatus =
    input.paidAmount <= 0 ? "UNPAID" : remainingAmount <= 0 ? "PAID" : "PARTIAL";

  return { finalTotal, remainingAmount, netProfit, paymentStatus };
}
