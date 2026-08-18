export type Section =
  | "dashboard"
  | "clients"
  | "contractors"
  | "projects"
  | "stages"
  | "workers"
  | "inventory"
  | "finance"
  | "contracts"
  | "quotations"
  | "reports"
  | "deficiencies"
  | "maintenance"
  | "systems"
  | "attendance"
  | "leaves"
  | "payroll"
  | "teams"
  | "showcase"
  | "site"
  | "config"
  | "alerts"
  | "settings"
  | "projectDetail";

export type ProjectStatus = "لم يبدأ" | "جاري" | "متوقف" | "متأخر" | "مكتمل";
export type StageStatus = "لم يبدأ" | "جاري" | "تم";
export type InvoiceStatus = "مدفوعة" | "جزئية" | "متأخرة";
export type AttendanceStatus = "حاضر" | "غياب" | "إجازة";

export type ClientSector = "حكومي" | "خاص";

export type Client = {
  id: number;
  name: string;
  phone: string;
  address: string;
  type: string;
  notes: string;
  payments?: PaymentTerm[]; // جدول دفعات مخصّص لهذا العميل (اختياري)
  // حقول إضافية (اختيارية) — بيانات العميل/المؤسسة الرسمية.
  sector?: ClientSector; // حكومي | خاص
  email?: string;
  city?: string;
  commercialRegister?: string; // السجل التجاري
  taxId?: string; // الرقم الضريبي
  digitalWallet?: string; // رقم المحفظة الرقمية
  documentationAuthority?: string; // الجهة المعنية بالتوثيق
};

export type Contractor = {
  id: number;
  name: string;
  phone: string;
  specialty: string;
  company: string;
  address: string;
  notes: string;
};

export type ProjectStage = {
  id: number;
  projectId: number;
  name: string;
  status: StageStatus;
  notes: string;
  updatedAt: string;
  photos?: string[];
  files?: Array<{ name: string; url: string }>;
  signature?: string;
};

export type Project = {
  id: number;
  name: string;
  type: string;
  clientId: number;
  address: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  engineer: string;
  allowEngineerEdit?: boolean;
  budget: number;
  progress: number;
};

export type EmploymentType = "يومي" | "شهري";

export type Worker = {
  id: number;
  name: string;
  specialty: string;
  phone: string;
  dailyRate: number;
  currentProjectId: number | null;
  attendance: AttendanceStatus;
  hours: number;
  // حقول إضافية (اختيارية للتوافق مع البيانات القديمة) لمنظومة الحضور والرواتب.
  nationalId?: string;
  employmentType?: EmploymentType;
  monthlySalary?: number;
  isActive?: boolean;
};

export type InventoryItem = {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  purchasePrice: number;
  salePrice: number; // سعر البيع
  supplier: string;
  receivedAt: string;
  minQuantity: number;
  brand?: string; // الماركة / الشركة المصنعة
};

export type Invoice = {
  id: number;
  projectId: number;
  number: string;
  amount: number;
  status: InvoiceStatus;
  date: string;
};

export type Expense = {
  id: number;
  projectId: number;
  type: string;
  amount: number;
  description: string;
  date: string;
};

// دفعة مالية في جدول دفعات العقد (نسبة من قيمة العقد).
export type PaymentTerm = {
  id: number;
  label: string;
  percent: string;
};

export type Contract = {
  id: number;
  projectId: number;
  value: number;
  currency?: string; // EGP افتراضي | SAR | AED
  startDate: string;
  endDate: string;
  warranty: string;
  clauses: string;
  payments?: PaymentTerm[];
  
  // حقول العقد المخصصة المعتمدة في PDF
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
  specs?: string[]; // المواصفات الـ 13
};

// رقم/إثبات يظهر في شريط الأرقام على الموقع العام، يتحكم فيه الأدمن من اللوحة.
export type SiteStat = {
  id: number;
  value: string;
  label: string;
};

export type SiteSettings = {
  stats: SiteStat[];
  stamp: string;
  signature: string; // توقيع الطرف الأول (يظهر على العقد المطبوع جنب الختم)
  payments: PaymentTerm[];
  contactWhatsApp?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactAddress?: string;
  contactFacebook?: string;
  contactInstagram?: string;
  contactTikTok?: string;
  contactWhatsAppMsg?: string;
};

// حساب موظف بصلاحيات محددة. الأدمن يدخل بجوجل؛ الموظفون يدخلون بإيميل وكلمة سر.
export type StaffAccount = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  sections: Section[];
  permissions?: Partial<Record<Section, "view" | "edit">>;
};

// عنصر معرض العملاء على الموقع العام: صورة العميل واسمه، صور الأعمال، التفاصيل، ورأيه.
export type ShowcaseItem = {
  id: number;
  clientName: string;
  clientPhoto: string;
  projectType: string;
  city?: string;
  year?: string;
  duration: string;
  opinion: string;
  photos: string[];
};

export type QuotationItem = {
  name: string;
  brand?: string; // الوصف / الماركة
  qty: number;
  price: number;
  total: number;
};

export type Quotation = {
  id: number;
  number: string;
  clientId: number;
  date: string;
  validUntil: string;
  status: "مسودة" | "مرسل" | "معتمد" | "ملغي";
  items: QuotationItem[];
  value: number; // Total value including VAT
  taxPercent: number; // e.g. 15
  currency?: string; // EGP افتراضي | SAR | AED
  notes?: string;
  clientName?: string;
  locationCity?: string;
  locationDistrict?: string;
  locationPlot?: string;
  locationPlan?: string;
  projectAddress?: string;
  introText?: string;
};

// ===== تفاصيل المشروع الكاملة (تُفتح بالضغط على مربع المشروع) =====
// مخزّنة منفصلة عن Project ومرتبطة به عبر projectId، حتى لا يتضخّم نوع Project الأساسي.

// 7.1 مهندس الموقع
export type SiteEngineer = {
  name: string;
  phone: string;
  email: string;
};

// 6.2 صف في جدول التوريد والتركيب (نظام/بند)
export type SupplyInstallRow = {
  id: number;
  system: string;
  supply: StageStatus; // حالة التوريد
  install: StageStatus; // حالة التركيب
  notes: string;
};

// 6.3 شهادة من شهادات المشروع
export type ProjectCertificate = {
  id: number;
  name: string;
  issued: boolean;
  date: string;
};

// 7.2 طلب توريد
export type SupplyRequest = {
  id: number;
  item: string;
  qty: number;
  unit: string;
  status: "مطلوب" | "تم الطلب" | "تم الاستلام";
  date: string;
};

// منتج/خامة مصروفة من المخزن على الموقع (يُخصم من رصيد المخزن، ويُحتسب ضمن مصروف الموقع).
export type ProjectMaterial = {
  id: number;
  itemId: number; // مرجع لصنف المخزن
  name: string; // لقطة من اسم الصنف وقت الصرف
  unit: string; // لقطة من الوحدة
  qty: number;
  unitPrice: number; // لقطة من سعر الشراء وقت الصرف
  date: string;
};

// 8.3–8.6 نموذج سير العمل التشغيلي وملاحظات الاستشاري والتسليم
export type ProjectWorkflow = {
  workersCount: string;
  contractorsCount: string;
  alarmRemaining: string; // المتبقي من نظام الإنذار
  fireRemaining: string; // المتبقي من نظام الإطفاء
  ceilingAlarm: string; // تأسيس الإنذار في السقف
  ventilation: string; // التهوية وسحب الدخان
  problems: string; // المشاكل والحلول / طلب مواد
  consultantNotes: string; // ملاحظات مهندس المشروع (الاستشاري)
  handover: string; // تسليم المشروع
};

export type ProjectDetail = {
  projectId: number;
  siteEngineer: SiteEngineer; // 7.1
  openings: string; // 6.1 الموقع والفتحات
  planNumber: string; // 7.10 رقم المخطط
  parcelNumber: string; // 7.10 رقم القطعة
  supplyInstall: SupplyInstallRow[]; // 6.2 جدول التوريد والتركيب
  certificates: ProjectCertificate[]; // 6.3 الشهادات
  supplyRequests: SupplyRequest[]; // 7.2 طلبات التوريد
  materials: ProjectMaterial[]; // منتجات/خامات مصروفة من المخزن على الموقع
  teamWorkerIds: number[]; // 7.9 فرق العمل (العمال)
  teamContractorId: number | null; // 7.9 المقاول
  workflow: ProjectWorkflow; // 8
};

// ===== نواقص المواقع (C — عمليات الموقع) =====
export type DeficiencySeverity = "منخفضة" | "متوسطة" | "عالية";
export type DeficiencyStatus = "مفتوح" | "قيد المعالجة" | "تم الحل";

// نقص/ملاحظة مفتوحة على الموقع يرفعها المهندس المشرف أو الاستشاري.
export type SiteDeficiency = {
  id: number;
  projectId: number;
  raisedBy: string; // من رفع النقص (مهندس مشرف/استشاري)
  description: string;
  severity: DeficiencySeverity;
  status: DeficiencyStatus;
  raisedDate: string;
  resolvedDate: string;
};

// ===== الصيانة الدورية (A — العقود) =====
export type MaintenanceFrequency = "شهري" | "ربع سنوي" | "نصف سنوي" | "سنوي";
export type MaintenanceContractStatus = "نشط" | "منتهي" | "متجدد" | "ملغي";

// عقد صيانة دورية لعميل/موقع، يولّد جدول زيارات تلقائيًا حسب التكرار.
export type MaintenanceContract = {
  id: number;
  contractNumber: string;
  clientId: number;
  projectId: number | null;
  value: number;
  currency: string; // EGP | SAR | AED
  startDate: string;
  endDate: string;
  frequency: MaintenanceFrequency;
  status: MaintenanceContractStatus;
  notes: string;
};

// زيارة صيانة واحدة ضمن جدول العقد. الحالة المخزّنة "مجدولة"/"تمت"؛ و"فائتة" تُحتسب عند العرض.
export type VisitStatus = "مجدولة" | "تمت" | "فائتة";
export type MaintenanceVisit = {
  id: number;
  contractId: number;
  scheduledDate: string;
  completedDate: string;
  status: "مجدولة" | "تمت";
  performedBy: string;
  notes: string;
};

// ===== الأنظمة الفنية ومكوّناتها (B — النطاق الفني) =====
export type SystemType = "تهوية وتكييف" | "شبكة إطفاء" | "إنذار حريق";
export type SystemStatus = "تصميم" | "جاري التركيب" | "مركّب" | "تشغيل تجريبي" | "معتمد";

// نظام هندسي مركّب على مشروع (تهوية/إطفاء/إنذار).
export type ProjectSystem = {
  id: number;
  projectId: number;
  type: SystemType;
  name: string;
  status: SystemStatus;
  notes: string;
};

export type ComponentInstallStatus = "بانتظار" | "مركّب" | "تم اختباره";

// مكوّن تفصيلي داخل نظام (محبس/حساس/لوحة/فتحة...) بكمية وحالة تركيب.
export type SystemComponent = {
  id: number;
  systemId: number;
  componentType: string;
  description: string;
  manufacturer: string;
  model: string;
  quantity: number;
  unit: string;
  location: string;
  installStatus: ComponentInstallStatus;
  installDate: string;
};

// ===== فرق العمل وتعيينات المواقع (D — العمالة) =====

// فريق عمل يُسنَد للمواقع (داخلي أو تابع لمقاول فرعي).
export type WorkTeam = {
  id: number;
  name: string;
  subcontractorId: number | null; // null = فريق داخلي
  teamLead: string;
  trade: string;
};

// تعيين فريق/عامل/مقاول على موقع بدور ومدة.
export type ProjectAssignment = {
  id: number;
  projectId: number;
  teamId: number | null;
  workerId: number | null;
  subcontractorId: number | null;
  roleOnSite: string;
  startDate: string;
  endDate: string;
};

// ===== الحضور والإجازات والرواتب (D/E — العمالة) =====

// سجل حضور يومي تاريخي لعامل (بديل عن حالة الحضور اللحظية الواحدة على Worker).
export type AttendanceRecord = {
  id: number;
  workerId: number;
  projectId: number | null;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus; // حاضر | غياب | إجازة
  checkIn: string;
  checkOut: string;
  hours: number;
  overtimeHours: number;
};

export type LeaveType = "سنوية" | "مرضية" | "بدون راتب";
export type LeaveStatus = "مطلوبة" | "مقبولة" | "مرفوضة";

export type Leave = {
  id: number;
  workerId: number;
  type: LeaveType;
  startDate: string;
  endDate: string;
  status: LeaveStatus;
  reason: string;
};

export type PayrollStatus = "مسودة" | "معتمد" | "مدفوع";

// مسير رواتب شهري لعامل، يُحتسب من سجلات الحضور.
export type PayrollRun = {
  id: number;
  workerId: number;
  period: string; // YYYY-MM
  presentDays: number;
  baseAmount: number;
  overtimeAmount: number;
  deductions: number;
  netAmount: number;
  status: PayrollStatus;
  notes: string;
};

// تنبيه/إشعار يظهر في الجرس ومركز التنبيهات؛ قابل للمعالجة (الإخفاء) بالضغط.
export type AppAlert = {
  id: string;
  title: string;
  detail: string;
  tone: string;
  section: Section;
};
