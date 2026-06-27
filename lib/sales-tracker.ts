export const serviceCategories = [
  "Events Management & Production",
  "Marketing, Advertising & Brand Communications",
  "Print Production & Promotional Solutions",
  "Architecture, Interior Design & Fit-Out",
  "IT, Software Development & Cybersecurity",
  "Robotics, Automation & Intelligent Systems",
  "Networking, Telecommunications & Infrastructure",
  "Audio Visual, Broadcasting & Media Systems",
  "Security, Surveillance & Access Control Systems",
  "Artificial Intelligence, Data Analytics & Digital Transformation"
] as const;

export const leadSources = [
  "Website",
  "Instagram",
  "Facebook",
  "LinkedIn",
  "TikTok",
  "WhatsApp",
  "Phone call",
  "Referral",
  "Walk-in",
  "Existing client",
  "Event / Exhibition",
  "Sales visit",
  "Google search",
  "Personal network",
  "Other"
] as const;

export const crmStatuses = [
  "New Lead",
  "Contacted",
  "Interested",
  "Meeting Scheduled",
  "Meeting Completed",
  "Proposal Required",
  "Proposal Sent",
  "Quotation Sent",
  "Waiting Client",
  "Negotiation",
  "Approved",
  "Invoice Required",
  "Project Started",
  "Closed Won",
  "Closed Lost",
  "Follow-Up Later",
  "Not Qualified"
] as const;

export const pipelineProbabilities: Record<string, number> = {
  "New Lead": 10,
  Contacted: 20,
  Interested: 30,
  "Meeting Scheduled": 40,
  "Meeting Completed": 45,
  "Proposal Sent": 50,
  "Quotation Sent": 60,
  Negotiation: 70,
  Approved: 90,
  "Closed Won": 100,
  "Closed Lost": 0
};

export const pipelineStages = Object.keys(pipelineProbabilities);

export const priorities = ["High", "Medium", "Low"] as const;
export const contactMethods = ["Phone", "WhatsApp", "Email", "Meeting", "Visit", "Other"] as const;
export const meetingStatuses = ["Scheduled", "Completed", "Cancelled"] as const;
export const documentStatuses = ["Draft", "Sent", "Approved", "Rejected", "Expired"] as const;
export const paymentStatuses = ["Paid", "Partially Paid", "Pending"] as const;
export const lostReasons = ["Price", "No Response", "Competitor", "Not Interested", "Other"] as const;
export const yesNo = ["Yes", "No"] as const;

export const first30DayTargets = {
  targetClientsListed: 100,
  clientsContacted: 80,
  followUpsCompleted: 120,
  meetingsScheduled: 15,
  meetingsCompleted: 10,
  proposalsSent: 10,
  quotationsSent: 10,
  dealsClosedMin: 2,
  dealsClosedMax: 5,
  activeProjectsStartedMin: 1,
  activeProjectsStartedMax: 3
};

export const recommendedTargetIndustries = [
  "Clinics and medical centers",
  "Restaurants and cafes",
  "Real estate companies",
  "Construction companies",
  "Schools and institutes",
  "Hotels",
  "Retail stores",
  "Beauty clinics and salons",
  "Gyms and fitness centers",
  "Corporate offices"
];

export const roleResponsibilities = [
  {
    role: "CEO & Founder",
    responsibilities: "Approve major sales opportunities, review high-value clients, approve strategic pricing, and support important relationships."
  },
  {
    role: "Sales / Client Relations",
    responsibilities: "Add leads, contact clients, schedule meetings, send proposals and quotations, follow up on time, update pipeline status, and close deals professionally."
  },
  {
    role: "Finance",
    responsibilities: "Review pricing where required, issue invoices after approval, record payments, and confirm payment status to Sales and Operations."
  },
  {
    role: "Operations",
    responsibilities: "Receive approved projects from Sales, review approved scope, assign project tasks, and deliver work according to approved requirements."
  },
  {
    role: "Management",
    responsibilities: "Review weekly sales reports, solve client or pricing issues, support sales growth, and monitor sales performance."
  }
];

export type CrmStatus = typeof crmStatuses[number];
export type Priority = typeof priorities[number];

export type Lead = {
  id: string;
  leadCode: string;
  dateAdded: string;
  clientName: string;
  contactPerson: string;
  phone: string;
  email: string;
  whatsapp: string;
  instagramWebsite: string;
  location: string;
  leadSource: string;
  industry: string;
  serviceRequired: string;
  estimatedValue: number;
  priority: Priority;
  status: CrmStatus;
  nextFollowUp: string;
  responsiblePerson: string;
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type Deal = {
  id: string;
  dealCode: string;
  leadCode: string;
  clientName: string;
  serviceProject: string;
  pipelineStage: string;
  dealValue: number;
  probability: number;
  expectedRevenue: number;
  expectedClosingDate: string;
  responsiblePerson: string;
  status: string;
  notes: string;
};

export type ContactLog = {
  id: string;
  contactLogCode: string;
  leadCode: string;
  clientName: string;
  date: string;
  method: string;
  discussionSummary: string;
  nextAction: string;
  nextFollowUp: string;
  responsiblePerson: string;
};

export type Meeting = {
  id: string;
  meetingCode: string;
  leadCode: string;
  clientName: string;
  meetingDate: string;
  time: string;
  location: string;
  meetingPurpose: string;
  meetingStatus: string;
  responsiblePerson: string;
  followUpRequired: string;
  notes: string;
};

export type SalesDocument = {
  id: string;
  code: string;
  leadCode: string;
  clientName: string;
  projectService: string;
  value: number;
  dateSent: string;
  validUntil: string;
  status: string;
  followUpDate: string;
  convertedToInvoice?: string;
  attachmentUrl: string;
  notes: string;
};

export type ClosedDeal = {
  id: string;
  dealCode: string;
  clientName: string;
  serviceProject: string;
  finalValue: number;
  closingDate: string;
  paymentStatus: string;
  projectStarted: string;
  responsiblePerson: string;
  notes: string;
};

export type LostDeal = {
  id: string;
  lostDealCode: string;
  clientName: string;
  serviceProject: string;
  estimatedValue: number;
  lostDate: string;
  reasonLost: string;
  responsiblePerson: string;
  futureFollowUp: string;
  notes: string;
};

export type DailySalesActivity = {
  id: string;
  date: string;
  salesperson: string;
  callsMade: number;
  whatsappMessages: number;
  emailsSent: number;
  meetingsScheduled: number;
  proposalsSent: number;
  quotationsSent: number;
  followUpsCompleted: number;
  notes: string;
};

export type WeeklySalesReport = {
  id: string;
  weekFrom: string;
  weekTo: string;
  preparedBy: string;
  newLeadsAdded: number;
  clientsContacted: number;
  meetingsScheduled: number;
  meetingsCompleted: number;
  proposalsSent: number;
  quotationsSent: number;
  dealsApproved: number;
  dealsClosedWon: number;
  dealsClosedLost: number;
  totalExpectedPipelineValue: number;
  totalClosedValue: number;
  weeklySalesSummary: string;
  mainProblems: string;
  nextWeekSalesPlan: string;
};

export type TargetClient = {
  id: string;
  no: number;
  companyClientName: string;
  industry: string;
  location: string;
  contactPerson: string;
  phone: string;
  instagramWebsite: string;
  serviceOpportunity: string;
  priority: Priority;
  notes: string;
};

export type Handover = {
  id: string;
  handoverCode: string;
  clientName: string;
  projectService: string;
  approvedValue: number;
  paymentStatus: string;
  handoverDate: string;
  approvedScope: string;
  clientRequirements: string;
  filesMaterialsReceived: string[];
  operationsResponsiblePerson: string;
  salesResponsiblePerson: string;
  salesSignature: string;
  operationsSignature: string;
  date: string;
};

export type SalesTrackerState = {
  leads: Lead[];
  deals: Deal[];
  contactLogs: ContactLog[];
  meetings: Meeting[];
  proposals: SalesDocument[];
  quotations: SalesDocument[];
  closedDeals: ClosedDeal[];
  lostDeals: LostDeal[];
  dailyActivities: DailySalesActivity[];
  weeklyReports: WeeklySalesReport[];
  targetClients: TargetClient[];
  handovers: Handover[];
};

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createDocumentCode(prefix: string, existingCount: number, year = 2026) {
  return `BA-${prefix}-${year}-${String(existingCount + 1).padStart(3, "0")}`;
}

export function probabilityForStage(stage: string) {
  return pipelineProbabilities[stage] ?? 10;
}

export function expectedRevenue(value: number, probability: number) {
  return Math.round((Number(value || 0) * Number(probability || 0)) / 100);
}

export function isOverdue(date?: string) {
  return Boolean(date && date < todayIso());
}

export function emptyState(): SalesTrackerState {
  return {
    leads: [],
    deals: [],
    contactLogs: [],
    meetings: [],
    proposals: [],
    quotations: [],
    closedDeals: [],
    lostDeals: [],
    dailyActivities: [],
    weeklyReports: [],
    targetClients: recommendedTargetIndustries.map((industry, index) => ({
      id: createId("target"),
      no: index + 1,
      companyClientName: "",
      industry,
      location: "",
      contactPerson: "",
      phone: "",
      instagramWebsite: "",
      serviceOpportunity: serviceCategories[index % serviceCategories.length],
      priority: index < 4 ? "High" : index < 8 ? "Medium" : "Low",
      notes: "Recommended first 30-day target industry"
    })),
    handovers: []
  };
}

export function createWeeklyReportFromState(state: SalesTrackerState, preparedBy: string) {
  const now = new Date();
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const from = monday.toISOString().slice(0, 10);
  const to = sunday.toISOString().slice(0, 10);
  const inRange = (date: string) => date >= from && date <= to;
  const contactedLeadCodes = new Set(state.contactLogs.filter((log) => inRange(log.date)).map((log) => log.leadCode));

  return {
    id: createId("weekly"),
    weekFrom: from,
    weekTo: to,
    preparedBy,
    newLeadsAdded: state.leads.filter((lead) => inRange(lead.dateAdded)).length,
    clientsContacted: contactedLeadCodes.size,
    meetingsScheduled: state.meetings.filter((meeting) => inRange(meeting.meetingDate)).length,
    meetingsCompleted: state.meetings.filter((meeting) => inRange(meeting.meetingDate) && meeting.meetingStatus === "Completed").length,
    proposalsSent: state.proposals.filter((proposal) => inRange(proposal.dateSent) && proposal.status === "Sent").length,
    quotationsSent: state.quotations.filter((quotation) => inRange(quotation.dateSent) && quotation.status === "Sent").length,
    dealsApproved: state.deals.filter((deal) => deal.pipelineStage === "Approved").length,
    dealsClosedWon: state.closedDeals.filter((deal) => inRange(deal.closingDate)).length,
    dealsClosedLost: state.lostDeals.filter((deal) => inRange(deal.lostDate)).length,
    totalExpectedPipelineValue: state.deals.reduce((sum, deal) => sum + deal.expectedRevenue, 0),
    totalClosedValue: state.closedDeals.reduce((sum, deal) => sum + deal.finalValue, 0),
    weeklySalesSummary: "Generated from CRM activity. Review notes before sending to management.",
    mainProblems: "Update manually after the weekly sales review.",
    nextWeekSalesPlan: "Continue overdue follow-ups, proposal follow-ups, and high-priority target outreach."
  };
}
