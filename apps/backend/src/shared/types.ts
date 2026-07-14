export type UserRole =
  | "ADMIN"
  | "PROJECT_MANAGER"
  | "SITE_ENGINEER"
  | "PROCUREMENT"
  | "WORKER"
  | "TECHNICIAN";

export type ProjectStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "DELAYED"
  | "COMPLETED";

export type StageStatus = "TODO" | "DOING" | "DONE";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LEAVE";
export type LeaveType = "ANNUAL" | "SICK" | "UNPAID";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";
export type PayrollStatus = "DRAFT" | "APPROVED" | "PAID";
export type QuotationStatus = "DRAFT" | "SENT" | "APPROVED" | "REJECTED";
export type SystemType = "VENTILATION" | "FIRE_FIGHTING" | "FIRE_ALARM";
export type SystemStatus =
  | "DESIGN"
  | "INSTALLING"
  | "INSTALLED"
  | "TESTING"
  | "CERTIFIED";
export type ComponentInstallStatus = "PENDING" | "INSTALLED" | "TESTED";
export type DeficiencySeverity = "LOW" | "MEDIUM" | "HIGH";
export type DeficiencyStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
export type MaintenanceContractFrequency =
  | "MONTHLY"
  | "QUARTERLY"
  | "SEMI_ANNUAL"
  | "ANNUAL";
export type MaintenanceContractStatus =
  | "ACTIVE"
  | "EXPIRED"
  | "RENEWED"
  | "CANCELLED";
export type VisitStatus = "SCHEDULED" | "DONE" | "MISSED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  type: string;
  notes?: string;
  sector?: string;
  email?: string;
  city?: string;
  commercialRegister?: string;
  taxId?: string;
  digitalWallet?: string;
  documentationAuthority?: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  type: string;
  clientId: string;
  address: string;
  startDate: Date;
  endDate: Date;
  status: ProjectStatus;
  engineerId?: string;
  budget: number;
  progress: number;
  createdAt: Date;
}

export interface ProjectStage {
  id: string;
  projectId: string;
  name: string;
  status: StageStatus;
  notes?: string;
  color: string;
  customerSignature?: string;
  updatedAt: Date;
}

export interface ProjectStageHistory {
  id: string;
  stageId: string;
  status: StageStatus;
  notes?: string;
  updatedBy: string;
  updatedAt: Date;
}

export interface Worker {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  dailyRate: number;
  nationalId?: string;
  employmentType: string;
  monthlySalary: number;
  isActive: boolean;
  createdAt: Date;
}

export interface Contractor {
  id: string;
  name: string;
  phone: string;
  specialty: string;
  company: string;
  address: string;
  notes?: string;
}

export interface ProjectAssignment {
  id: string;
  projectId: string;
  workerId?: string;
  contractorId?: string;
  roleOnSite: string;
  startDate: Date;
  endDate?: Date;
}

export interface AttendanceRecord {
  id: string;
  workerId: string;
  projectId?: string;
  date: Date;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  hours: number;
  overtimeHours: number;
}

export interface Leave {
  id: string;
  workerId: string;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  status: LeaveStatus;
  reason: string;
}

export interface PayrollRun {
  id: string;
  workerId: string;
  period: string;
  presentDays: number;
  baseAmount: number;
  overtimeAmount: number;
  deductions: number;
  netAmount: number;
  status: PayrollStatus;
  notes?: string;
}

export interface QuotationItem {
  id: string;
  quotationId: string;
  name: string;
  brand?: string;
  qty: number;
  price: number;
  total: number;
}

export interface Quotation {
  id: string;
  number: string;
  clientId: string;
  date: Date;
  validUntil: Date;
  status: QuotationStatus;
  value: number;
  taxPercent: number;
  currency: string;
  notes?: string;
  createdAt: Date;
  items?: QuotationItem[];
}

export interface PaymentTerm {
  id: string;
  contractId: string;
  label: string;
  percent: number;
}

export interface Contract {
  id: string;
  projectId: string;
  clientId: string;
  value: number;
  currency: string;
  startDate: Date;
  endDate: Date;
  warranty: string;
  clauses: string;
  secondPartyName?: string;
  secondPartyRegister?: string;
  secondPartyRepresentative?: string;
  secondPartyRole?: string;
  locationCity?: string;
  locationDistrict?: string;
  locationPlot?: string;
  locationPlan?: string;
  quotationNumber?: string;
  quotationValue?: number;
  specs: string[];
  createdAt: Date;
  payments?: PaymentTerm[];
}

export interface ContractTemplate {
  id: string;
  type: "TERMS" | "CONDITIONS" | "SAFETY" | "PAYMENTS";
  content: string;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  projectId: string;
  number: string;
  amount: number;
  status: "PAID" | "PARTIAL" | "LATE";
  dueDate?: Date;
  paidAt?: Date;
  createdAt: Date;
}

export interface Expense {
  id: string;
  projectId?: string;
  type: string;
  amount: number;
  description: string;
  date: Date;
  createdAt: Date;
}

export interface InventoryItem {
  id: string;
  name: string;
  brand?: string;
  quantity: number;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  supplier?: string;
  receivedAt: Date;
  minQuantity: number;
  createdAt: Date;
}

export interface ProjectMaterial {
  id: string;
  projectId: string;
  itemId: string;
  name: string;
  unit: string;
  qty: number;
  unitPrice: number;
  date: Date;
}

export interface SiteDeficiency {
  id: string;
  projectId: string;
  raisedById: string;
  description: string;
  severity: DeficiencySeverity;
  status: DeficiencyStatus;
  raisedDate: Date;
  resolvedDate?: Date;
}

export interface ProjectSystem {
  id: string;
  projectId: string;
  type: SystemType;
  name: string;
  status: SystemStatus;
  notes?: string;
}

export interface SystemComponent {
  id: string;
  systemId: string;
  componentType: string;
  description: string;
  manufacturer: string;
  model: string;
  quantity: number;
  unit: string;
  location: string;
  installStatus: ComponentInstallStatus;
  installDate?: Date;
}

export interface DailyReportSystemEntry {
  id: string;
  reportId: string;
  systemType: SystemType;
  foundationDone: boolean;
  wiringDone: boolean;
  installDone: boolean;
}

export interface DailySiteReport {
  id: string;
  projectId: string;
  submittedById: string;
  date: Date;
  workersCount: number;
  problems?: string;
  solutions?: string;
  needsQuoteRequest: boolean;
  needsConsultantReview: boolean;
  engineerNotes?: string;
  completionPercent: number;
  signature?: string;
  createdAt: Date;
  systemEntries?: DailyReportSystemEntry[];
}

export interface MaintenanceContract {
  id: string;
  contractNumber: string;
  clientId: string;
  projectId?: string;
  value: number;
  currency: string;
  startDate: Date;
  endDate: Date;
  frequency: MaintenanceContractFrequency;
  status: MaintenanceContractStatus;
  notes?: string;
}

export interface MaintenanceVisit {
  id: string;
  contractId: string;
  scheduledDate: Date;
  completedDate?: Date;
  status: VisitStatus;
  performedBy?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  timestamp: Date;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
}
