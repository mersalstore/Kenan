import type {
  Client,
  Contract,
  Expense,
  InventoryItem,
  Invoice,
  Project,
  ProjectStage,
  ShowcaseItem,
  SiteSettings,
  StaffAccount,
  Worker,
  Contractor,
  Quotation,
  ProjectDetail,
  SupplyInstallRow,
  ProjectCertificate,
  SiteDeficiency,
  MaintenanceContract,
  MaintenanceVisit,
  AttendanceRecord,
  Leave,
  PayrollRun,
  ProjectSystem,
  SystemComponent,
  SystemType,
  WorkTeam,
  ProjectAssignment,
} from "./types";

export const seedClients: Client[] = [
  {
    id: 1,
    name: "أحمد الشامي",
    phone: "01001234567",
    address: "التجمع الخامس، القاهرة",
    type: "مالك وحدة",
    notes: "يفضل المتابعة عبر واتساب",
  },
  {
    id: 2,
    name: "شركة المدار",
    phone: "01119876543",
    address: "مدينة نصر، القاهرة",
    type: "شركة",
    notes: "تركيبات كاميرات وشبكات",
  },
  {
    id: 3,
    name: "محمود عبدالعزيز",
    phone: "01225556667",
    address: "الشيخ زايد، الجيزة",
    type: "مقاول باطن",
    notes: "مشروع دهانات وأرضيات",
  },
];

export const seedProjects: Project[] = [
  {
    id: 1,
    name: "فيلا الياسمين",
    type: "نظام إنذار حريق",
    clientId: 1,
    address: "التجمع الخامس",
    startDate: "2026-05-01",
    endDate: "2026-06-15",
    status: "جاري",
    engineer: "م. كريم عادل",
    budget: 850000,
    progress: 58,
  },
  {
    id: 2,
    name: "فرع المدار الرئيسي",
    type: "كاميرات وشبكات",
    clientId: 2,
    address: "مدينة نصر",
    startDate: "2026-04-22",
    endDate: "2026-05-28",
    status: "متأخر",
    engineer: "م. ندى حسام",
    budget: 240000,
    progress: 72,
  },
  {
    id: 3,
    name: "شقة الشيخ زايد",
    type: "إطفاء بالمياه (رش آلي)",
    clientId: 3,
    address: "الشيخ زايد",
    startDate: "2026-05-12",
    endDate: "2026-05-30",
    status: "جاري",
    engineer: "م. يوسف سمير",
    budget: 125000,
    progress: 35,
  },
];

export const seedStages: ProjectStage[] = [
  { id: 1, projectId: 1, name: "المعاينة", status: "تم", notes: "تم اعتماد المقاسات", updatedAt: "2026-05-01" },
  { id: 2, projectId: 1, name: "التأسيس", status: "تم", notes: "تم تأسيس الكهرباء والسباكة", updatedAt: "2026-05-11" },
  { id: 3, projectId: 1, name: "التركيب", status: "جاري", notes: "تركيب وحدات الإضاءة", updatedAt: "2026-05-21" },
  { id: 4, projectId: 1, name: "الاختبار", status: "لم يبدأ", notes: "", updatedAt: "2026-05-21" },
  { id: 5, projectId: 1, name: "التسليم", status: "لم يبدأ", notes: "", updatedAt: "2026-05-21" },
  { id: 6, projectId: 2, name: "المعاينة", status: "تم", notes: "تم تحديد نقاط الكاميرات", updatedAt: "2026-04-22" },
  { id: 7, projectId: 2, name: "التأسيس", status: "تم", notes: "سحب كابلات الشبكة", updatedAt: "2026-05-03" },
  { id: 8, projectId: 2, name: "التركيب", status: "جاري", notes: "نقص في بعض حوامل الكاميرات", updatedAt: "2026-05-23" },
  { id: 9, projectId: 2, name: "الاختبار", status: "جاري", notes: "اختبار التسجيل الليلي", updatedAt: "2026-05-23" },
  { id: 10, projectId: 2, name: "التسليم", status: "لم يبدأ", notes: "", updatedAt: "2026-05-23" },
  { id: 11, projectId: 3, name: "المعاينة", status: "تم", notes: "تم اختيار الألوان", updatedAt: "2026-05-12" },
  { id: 12, projectId: 3, name: "التأسيس", status: "جاري", notes: "معالجة الحوائط", updatedAt: "2026-05-22" },
  { id: 13, projectId: 3, name: "التركيب", status: "لم يبدأ", notes: "", updatedAt: "2026-05-22" },
  { id: 14, projectId: 3, name: "الاختبار", status: "لم يبدأ", notes: "", updatedAt: "2026-05-22" },
  { id: 15, projectId: 3, name: "التسليم", status: "لم يبدأ", notes: "", updatedAt: "2026-05-22" },
];

export const seedWorkers: Worker[] = [
  { id: 1, name: "سيد مصطفى", specialty: "كهربائي", phone: "01005550101", dailyRate: 450, currentProjectId: 1, attendance: "حاضر", hours: 8, nationalId: "29001011200011", employmentType: "يومي", monthlySalary: 0, isActive: true },
  { id: 2, name: "أحمد فوزي", specialty: "فني كاميرات", phone: "01104440202", dailyRate: 500, currentProjectId: 2, attendance: "حاضر", hours: 7, nationalId: "28805052200022", employmentType: "يومي", monthlySalary: 0, isActive: true },
  { id: 3, name: "حسن إبراهيم", specialty: "نقاش", phone: "01203330303", dailyRate: 420, currentProjectId: 3, attendance: "غياب", hours: 0, nationalId: "29209091200033", employmentType: "يومي", monthlySalary: 0, isActive: true },
  { id: 4, name: "رامي نبيل", specialty: "مشرف موقع", phone: "01002220404", dailyRate: 0, currentProjectId: null, attendance: "حاضر", hours: 8, nationalId: "28503031200044", employmentType: "شهري", monthlySalary: 9000, isActive: true },
];

export const seedInventory: InventoryItem[] = [
  { id: 1, name: "توريد وتركيب مضخة حريق كهربائية 350 ج/د +جوكي 350 ج/د مع جميع الملحقات", brand: "TOSY", quantity: 5, unit: "مجموعة", purchasePrice: 12000, salePrice: 15000, supplier: "TOSY Pumps", receivedAt: "2026-05-10", minQuantity: 1 },
  { id: 2, name: "توريد وتركيب واختبار وضغط مواسير البولي ايثيلين HDPE بقطر (4 بوصة) وكل ما يلزم من اكواع وقسامات وجلب بالمتر الطولي", brand: "ALMONIF", quantity: 250, unit: "متر طولي", purchasePrice: 45, salePrice: 60, supplier: "المنيف للمواسير", receivedAt: "2026-05-14", minQuantity: 50 },
  { id: 3, name: "توريد وتركيب واختبار وضغط مواسير البولي ايثيلين HDPE بقطر (1.5 بوصة) وكل ما يلزم من اكواع وقسامات وجلب بالمتر الطولي", brand: "ALMONIF", quantity: 180, unit: "متر طولي", purchasePrice: 30, salePrice: 40, supplier: "المنيف للمواسير", receivedAt: "2026-05-18", minQuantity: 40 },
  { id: 4, name: "توريد وتركيب رشاش مياه سفلي بقطر 0.5 بوصة يعمل عند درجة حرارة 68 درجة مئوية وكل ما يلزم التركيب والاختبار والضغط", brand: "TYCO أمريكي", quantity: 500, unit: "حبة", purchasePrice: 180, salePrice: 250, supplier: "تايكو للسلامة", receivedAt: "2026-05-04", minQuantity: 100 },
  { id: 5, name: "توريد وتركيب صندوق حريق باب واحد 1.5 بوصة داخلي شامل جميع المواسير والتوصيلات وكل ما يلزم التركيب", brand: "ALSABEH", quantity: 25, unit: "صندوق", purchasePrice: 1000, salePrice: 1400, supplier: "الصانع المحلي", receivedAt: "2026-05-20", minQuantity: 5 },
  { id: 6, name: "توريد وتركيب طفاية حريق بودرة 6 كغ", brand: "ALSABEH", quantity: 150, unit: "طفاية", purchasePrice: 35, salePrice: 50, supplier: "الصانع المحلي", receivedAt: "2026-05-20", minQuantity: 20 },
  { id: 7, name: "توريد وتركيب مجموعة التحكم بسعة 3 بوصة ZCV وكل ما يلزم التركيب والاختبار", brand: "DUKO", quantity: 12, unit: "مجموعة", purchasePrice: 1500, salePrice: 2000, supplier: "DUKO Valves", receivedAt: "2026-05-20", minQuantity: 2 },
  { id: 8, name: "توريد وتركيب مجموعة التحكم بسعة 4 بوصة ZCV وكل ما يلزم التركيب والاختبار", brand: "DUKO", quantity: 10, unit: "مجموعة", purchasePrice: 1900, salePrice: 2500, supplier: "DUKO Valves", receivedAt: "2026-05-20", minQuantity: 2 },
  { id: 9, name: "توريد وتركيب ALARM CHECK VALVE بقطر 6 بوصة وكل ما يلزم التركيب والتشغيل والاختبار", brand: "DUKO", quantity: 8, unit: "صمام", purchasePrice: 1900, salePrice: 2500, supplier: "DUKO Valves", receivedAt: "2026-05-20", minQuantity: 2 },
  { id: 10, name: "توريد وتركيب وصلة دفاع مدني 4 بوصة وكل ما يلزم التركيب", brand: "DUKO", quantity: 15, unit: "وصلة", purchasePrice: 900, salePrice: 1200, supplier: "DUKO Valves", receivedAt: "2026-05-20", minQuantity: 3 },
  { id: 11, name: "توريد وتركيب شفاط لخزان الحريق بسعة 4 بوصة", brand: "DUKO", quantity: 8, unit: "شفاط", purchasePrice: 350, salePrice: 450, supplier: "DUKO Valves", receivedAt: "2026-05-20", minQuantity: 2 },
  { id: 12, name: "توريد وتركيب نظام ال FM200 بسعة 17 كغ وكل ما يلزم التركيب والاختبار", brand: "TECH OR AMERICAN FIRE", quantity: 6, unit: "نظام", purchasePrice: 11000, salePrice: 14000, supplier: "نظم الإطفاء بالغاز", receivedAt: "2026-05-20", minQuantity: 1 },
];

export const seedInvoices: Invoice[] = [
  { id: 1, projectId: 1, number: "INV-2026-001", amount: 320000, status: "مدفوعة", date: "2026-05-05" },
  { id: 2, projectId: 2, number: "INV-2026-002", amount: 90000, status: "جزئية", date: "2026-05-09" },
  { id: 3, projectId: 3, number: "INV-2026-003", amount: 45000, status: "متأخرة", date: "2026-05-18" },
];

export const seedExpenses: Expense[] = [
  { id: 1, projectId: 1, type: "خامات", amount: 185000, description: "توريد خامات كهرباء وتشطيب", date: "2026-05-06" },
  { id: 2, projectId: 2, type: "عمال", amount: 42000, description: "فنيين كاميرات وشبكات", date: "2026-05-17" },
  { id: 3, projectId: 3, type: "نقل", amount: 6500, description: "نقل خامات دهانات", date: "2026-05-20" },
];

export const seedContracts: Contract[] = [
  {
    id: 1,
    projectId: 1,
    value: 850000,
    startDate: "2026-05-01",
    endDate: "2026-06-15",
    warranty: "12 شهر",
    clauses: "تشطيبات كاملة مع ضمان التركيبات الكهربائية",
  },
  {
    id: 2,
    projectId: 2,
    value: 240000,
    startDate: "2026-04-22",
    endDate: "2026-05-28",
    warranty: "24 شهر",
    clauses: "توريد وتركيب كاميرات وشبكات وتدريب مسؤول الفرع",
  },
];

export const seedShowcase: ShowcaseItem[] = [
  {
    id: 1,
    clientName: "شركة المدار",
    clientPhoto: "",
    projectType: "كاميرات مراقبة وشبكات",
    city: "الرياض",
    year: "2025",
    duration: "18 يوم",
    opinion: "تنفيذ منظم وتسليم في الموعد، والكاميرات تغطي كل النقاط اللي طلبناها بدقة عالية.",
    photos: ["/images/cctv-project.jpg"],
  },
  {
    id: 2,
    clientName: "أحمد الشامي",
    clientPhoto: "",
    projectType: "إنذار وإطفاء حريق",
    city: "جدة",
    year: "2024",
    duration: "11 يوم",
    opinion: "فريق محترم وشرح كل خطوة، ونظام الإنذار اتسلّم باختبارات موثقة وضمان واضح.",
    photos: ["/images/fire-pumps.jpg"],
  },
  {
    id: 3,
    clientName: "مجمع النخيل التجاري",
    clientPhoto: "",
    projectType: "تحكم بالدخول وبنية شبكات",
    city: "الدمام",
    year: "2024",
    duration: "26 يوم",
    opinion: "أنظمة الدخول والبصمة اشتغلت من أول يوم، والصيانة الدورية ملتزمة وسريعة في الرد.",
    photos: ["/images/clean-agent-room.jpg"],
  },
];

export const seedStaff: StaffAccount[] = [
  {
    id: 1,
    name: "م. كريم عادل (مهندس الموقع)",
    email: "engineer@kenan.com",
    password: "123456",
    role: "مهندس مشروع",
    sections: ["dashboard", "projects", "stages", "systems", "deficiencies", "workers", "teams", "attendance", "alerts"],
  },
  {
    id: 2,
    name: "مدير المشاريع",
    email: "pm@kenan.com",
    password: "123456",
    role: "مدير مشاريع",
    sections: ["dashboard", "projects", "stages", "systems", "deficiencies", "workers", "teams", "contractors", "attendance", "reports", "alerts"],
  },
  {
    id: 3,
    name: "محاسب الشركة ومسؤول المشتريات",
    email: "accountant@kenan.com",
    password: "123456",
    role: "محاسب",
    sections: ["dashboard", "finance", "contracts", "quotations", "inventory", "reports", "contractors", "payroll"],
  },
  {
    id: 4,
    name: "موظف الاستقبال والمبيعات",
    email: "reception@kenan.com",
    password: "123456",
    role: "موظف استقبال",
    sections: ["dashboard", "clients", "quotations", "showcase"],
  },
  {
    id: 5,
    name: "فني المواقع والتركيبات",
    email: "technician@kenan.com",
    password: "123456",
    role: "عامل/فني",
    sections: ["dashboard", "projects", "systems", "maintenance", "deficiencies"],
  },
];

export const staffRoles = ["مدير مشاريع", "مهندس مشروع", "مسؤول مشتريات", "محاسب", "عامل/فني", "موظف استقبال", "مدير عام"];

export const seedSite: SiteSettings = {
  stats: [
    { id: 1, value: "+10", label: "سنوات خبرة" },
    { id: 2, value: "+250", label: "مشروع منفّذ" },
    { id: 3, value: "+180", label: "عميل يثق بنا" },
    { id: 4, value: "98%", label: "التزام بالمواعيد" },
  ],
  stamp: "",
  signature: "",
  payments: [
    { id: 1, label: "دفعة مقدّم عند توقيع العقد", percent: "50" },
    { id: 2, label: "دفعة عند بدء التركيب", percent: "25" },
    { id: 3, label: "دفعة عند التسليم النهائي", percent: "25" },
  ],
  contactWhatsApp: "966574590198",
  contactPhone: "+966574590198",
  contactEmail: "info@kenan4saftey.com",
  contactAddress: "الرياض - حي المنار",
  contactFacebook: "https://www.facebook.com/kenansafety/",
  contactInstagram: "https://www.instagram.com/kenansafety/",
  contactTikTok: "",
  contactWhatsAppMsg: "أريد معاينة مجانية لموقعي",
};

// أنواع المشاريع = البنود/الأنظمة الفعلية لمؤسسة كنان للأمن والسلامة.
export const projectTypes = [
  "نظام إنذار حريق",
  "إطفاء بالمياه (رش آلي)",
  "إطفاء بالغازات النظيفة",
  "سحب الدخان",
  "تهوية ودكت",
  "صناديق ومضخات حريق",
  "كاميرات وشبكات",
  "تحكم بالدخول",
];
export const engineers = ["م. كريم عادل", "م. ندى حسام", "م. يوسف سمير", "م. منى صلاح"];

// البنود الافتراضية لجدول التوريد والتركيب (المواصفات 6.2).
export const supplyInstallSystems = [
  "نظام إنذار الحريق",
  "الإطفاء بالمياه (الرش الآلي)",
  "الإطفاء بالغازات النظيفة",
  "سحب الدخان",
  "التهوية والدكت",
];

// الشهادات الافتراضية للمشروع (المواصفات 6.3).
export const certificateTypes = [
  "شهادة إنجاز تركيب",
  "شهادة مقاومة حريق",
  "شهادة سلامة",
  "شهادة إنجاز تركيبات كهرباء",
  "تقرير فني",
];

// قالب تفاصيل مشروع جديد بقيم افتراضية مهيّأة بالبنود والشهادات.
export function makeProjectDetail(projectId: number): ProjectDetail {
  return {
    projectId,
    siteEngineer: { name: "", phone: "", email: "" },
    openings: "",
    planNumber: "",
    parcelNumber: "",
    supplyInstall: supplyInstallSystems.map(
      (system, index): SupplyInstallRow => ({
        id: index + 1,
        system,
        supply: "لم يبدأ",
        install: "لم يبدأ",
        notes: "",
      }),
    ),
    certificates: certificateTypes.map(
      (name, index): ProjectCertificate => ({
        id: index + 1,
        name,
        issued: false,
        date: "",
      }),
    ),
    supplyRequests: [],
    materials: [],
    teamWorkerIds: [],
    teamContractorId: null,
    workflow: {
      workersCount: "",
      contractorsCount: "",
      alarmRemaining: "",
      fireRemaining: "",
      ceilingAlarm: "",
      ventilation: "",
      problems: "",
      consultantNotes: "",
      handover: "",
    },
  };
}

export const seedContractors: Contractor[] = [
  {
    id: 1,
    name: "مؤسسة إعمار النخبة للمقاولات",
    phone: "0555123456",
    specialty: "أعمال التكسير والحفر",
    company: "مؤسسة إعمار النخبة",
    address: "الرياض، حي السلي",
    notes: "مقاول باطن لأعمال الحفر والشبكات الأرضية",
  },
  {
    id: 2,
    name: "شركة جودة الدهانات المحدودة",
    phone: "0566987654",
    specialty: "دهانات وعزل مائي",
    company: "شركة جودة الدهانات",
    address: "الرياض، حي المروة",
    notes: "مقاول معتمد لأعمال العزل للمضخات والخزانات",
  },
];

export const seedQuotations: Quotation[] = [
  {
    id: 1,
    number: "QT-2026-001",
    clientId: 1,
    date: "2026-05-10",
    validUntil: "2026-06-10",
    status: "معتمد",
    items: [
      { name: "توريد وتركيب شبكة مواسير إطفاء حريق 2 بوصة", brand: "ALMONIF", qty: 45, price: 120, total: 5400 },
      { name: "صندوق حريق حائط حريق أحمر (السايح)", brand: "ALSABEH", qty: 2, price: 1100, total: 2200 },
      { name: "مضخة حريق معتمدة من الدفاع المدني", brand: "TOSY", qty: 1, price: 14500, total: 14500 },
    ],
    value: 25415,
    taxPercent: 15,
    notes: "الأسعار تشمل التوريد والتركيب والضمان سنتين",
  },
  {
    id: 2,
    number: "QT-2026-002",
    clientId: 2,
    date: "2026-05-18",
    validUntil: "2026-06-18",
    status: "مرسل",
    items: [
      { name: "توريد كابلات شبكة Cat6 لفة", brand: "كابلات", qty: 10, price: 2100, total: 21000 },
      { name: "تركيب كاميرات مراقبة IP 4MP مع البرمجة", brand: "كاميرات", qty: 12, price: 350, total: 4200 },
    ],
    value: 28980,
    taxPercent: 15,
    notes: "يشمل البرمجة وربط النظام على الموبايل",
  },
];

// نواقص المواقع — ملاحظات مفتوحة يرفعها المهندس المشرف/الاستشاري على كل موقع.
export const seedDeficiencies: SiteDeficiency[] = [
  {
    id: 1,
    projectId: 1,
    raisedBy: "م. كريم عادل",
    description: "حساس دخان غير مثبت في غرفة الكهرباء بالدور الأرضي",
    severity: "عالية",
    status: "مفتوح",
    raisedDate: "2026-06-10",
    resolvedDate: "",
  },
  {
    id: 2,
    projectId: 2,
    raisedBy: "م. ندى حسام",
    description: "تأخر توريد محبس دلتا 4 بوصة لخط الإطفاء الرئيسي",
    severity: "متوسطة",
    status: "قيد المعالجة",
    raisedDate: "2026-06-08",
    resolvedDate: "",
  },
  {
    id: 3,
    projectId: 1,
    raisedBy: "استشاري المشروع",
    description: "ملاحظة على ميل مواسير سحب الدخان — مطلوب تعديل بسيط",
    severity: "منخفضة",
    status: "تم الحل",
    raisedDate: "2026-06-02",
    resolvedDate: "2026-06-06",
  },
];

// عقود الصيانة الدورية — يولّد جدول الزيارات منها تلقائيًا في التطبيق.
export const seedMaintenanceContracts: MaintenanceContract[] = [
  {
    id: 1,
    contractNumber: "MNT-2026-001",
    clientId: 2,
    projectId: 2,
    value: 36000,
    currency: "EGP",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    frequency: "شهري",
    status: "نشط",
    notes: "صيانة شهرية لنظام إنذار وإطفاء الفرع الرئيسي",
  },
  {
    id: 2,
    contractNumber: "MNT-2026-002",
    clientId: 1,
    projectId: 1,
    value: 18000,
    currency: "EGP",
    startDate: "2026-03-01",
    endDate: "2027-02-28",
    frequency: "ربع سنوي",
    status: "نشط",
    notes: "صيانة ربع سنوية لنظام سحب الدخان والتهوية",
  },
];

// زيارات الصيانة المبدئية (يُكمل التطبيق توليد الباقي حسب التكرار عند إنشاء عقد جديد).
export const seedMaintenanceVisits: MaintenanceVisit[] = [
  { id: 1, contractId: 1, scheduledDate: "2026-01-01", completedDate: "2026-01-03", status: "تمت", performedBy: "م. ندى حسام", notes: "فحص دوري — سليم" },
  { id: 2, contractId: 1, scheduledDate: "2026-02-01", completedDate: "2026-02-02", status: "تمت", performedBy: "م. ندى حسام", notes: "تم استبدال بطارية لوحة" },
  { id: 3, contractId: 1, scheduledDate: "2026-03-01", completedDate: "", status: "مجدولة", performedBy: "", notes: "" },
  { id: 4, contractId: 1, scheduledDate: "2026-04-01", completedDate: "", status: "مجدولة", performedBy: "", notes: "" },
  { id: 5, contractId: 2, scheduledDate: "2026-03-01", completedDate: "2026-03-04", status: "تمت", performedBy: "م. كريم عادل", notes: "تنظيف دكت" },
  { id: 6, contractId: 2, scheduledDate: "2026-06-01", completedDate: "", status: "مجدولة", performedBy: "", notes: "" },
];

// سجلات حضور تاريخية (يونيو 2026) — أساس احتساب الرواتب.
export const seedAttendance: AttendanceRecord[] = [
  { id: 1, workerId: 1, projectId: 1, date: "2026-06-01", status: "حاضر", checkIn: "08:00", checkOut: "16:00", hours: 8, overtimeHours: 1 },
  { id: 2, workerId: 1, projectId: 1, date: "2026-06-02", status: "حاضر", checkIn: "08:00", checkOut: "16:00", hours: 8, overtimeHours: 0 },
  { id: 3, workerId: 1, projectId: 1, date: "2026-06-03", status: "حاضر", checkIn: "08:00", checkOut: "17:00", hours: 8, overtimeHours: 2 },
  { id: 4, workerId: 2, projectId: 2, date: "2026-06-01", status: "حاضر", checkIn: "08:00", checkOut: "15:00", hours: 7, overtimeHours: 0 },
  { id: 5, workerId: 2, projectId: 2, date: "2026-06-02", status: "غياب", checkIn: "", checkOut: "", hours: 0, overtimeHours: 0 },
  { id: 6, workerId: 2, projectId: 2, date: "2026-06-03", status: "حاضر", checkIn: "08:00", checkOut: "16:00", hours: 8, overtimeHours: 0 },
  { id: 7, workerId: 3, projectId: 3, date: "2026-06-01", status: "غياب", checkIn: "", checkOut: "", hours: 0, overtimeHours: 0 },
  { id: 8, workerId: 3, projectId: 3, date: "2026-06-02", status: "حاضر", checkIn: "08:00", checkOut: "16:00", hours: 8, overtimeHours: 0 },
  { id: 9, workerId: 4, projectId: null, date: "2026-06-01", status: "حاضر", checkIn: "09:00", checkOut: "17:00", hours: 8, overtimeHours: 0 },
  { id: 10, workerId: 4, projectId: null, date: "2026-06-02", status: "حاضر", checkIn: "09:00", checkOut: "17:00", hours: 8, overtimeHours: 0 },
  { id: 11, workerId: 4, projectId: null, date: "2026-06-03", status: "إجازة", checkIn: "", checkOut: "", hours: 0, overtimeHours: 0 },
];

// طلبات الإجازات.
export const seedLeaves: Leave[] = [
  { id: 1, workerId: 4, type: "سنوية", startDate: "2026-06-03", endDate: "2026-06-03", status: "مقبولة", reason: "ظرف عائلي" },
  { id: 2, workerId: 2, type: "مرضية", startDate: "2026-06-10", endDate: "2026-06-12", status: "مطلوبة", reason: "وعكة صحية" },
];

// مسيّرات الرواتب — تُولّد من الحضور داخل التطبيق (تبدأ فارغة).
export const seedPayroll: PayrollRun[] = [];

// أنواع المكوّنات المتاحة لكل نوع نظام (تُغذّي قائمة اختيار نوع المكوّن).
export const componentTypesBySystem: Record<SystemType, string[]> = {
  "تهوية وتكييف": ["فتحة تكييف", "دكت", "سحب دخان", "مروحة"],
  "شبكة إطفاء": ["محبس", "محبس دلتا", "خط مياه إطفاء", "مضخة", "رشاش (سبرنكلر)"],
  "إنذار حريق": ["شبكة إنذار", "حساس دخان", "لوحة تحكم"],
};

// أنظمة هندسية مركّبة على المشاريع.
export const seedSystems: ProjectSystem[] = [
  { id: 1, projectId: 1, type: "إنذار حريق", name: "نظام الإنذار المبكر — فيلا الياسمين", status: "جاري التركيب", notes: "تأسيس بالسقف" },
  { id: 2, projectId: 1, type: "تهوية وتكييف", name: "سحب الدخان والتهوية — فيلا الياسمين", status: "تصميم", notes: "" },
  { id: 3, projectId: 3, type: "شبكة إطفاء", name: "شبكة الرش الآلي — شقة الشيخ زايد", status: "مركّب", notes: "بانتظار الاختبار" },
];

// مكوّنات تفصيلية داخل الأنظمة.
export const seedComponents: SystemComponent[] = [
  { id: 1, systemId: 1, componentType: "لوحة تحكم", description: "لوحة إنذار عنونة 4 لوب", manufacturer: "Honeywell", model: "NFS2-3030", quantity: 1, unit: "عدد", location: "غرفة الكهرباء", installStatus: "مركّب", installDate: "2026-05-20" },
  { id: 2, systemId: 1, componentType: "حساس دخان", description: "حساس دخان ضوئي عنونة", manufacturer: "System Sensor", model: "SD-851", quantity: 24, unit: "عدد", location: "موزّع بالأدوار", installStatus: "بانتظار", installDate: "" },
  { id: 3, systemId: 3, componentType: "محبس دلتا", description: "محبس دلتا 4 بوصة", manufacturer: "Viking", model: "E-1", quantity: 2, unit: "عدد", location: "غرفة المضخات", installStatus: "مركّب", installDate: "2026-05-18" },
  { id: 4, systemId: 3, componentType: "رشاش (سبرنكلر)", description: "رشاش مائي معلّق 68°م", manufacturer: "Tyco", model: "TY323", quantity: 60, unit: "عدد", location: "كل الأسقف", installStatus: "تم اختباره", installDate: "2026-05-25" },
];

// فرق العمل (داخلية وتابعة لمقاولين).
export const seedTeams: WorkTeam[] = [
  { id: 1, name: "فريق التأسيس الكهربائي", subcontractorId: null, teamLead: "سيد مصطفى", trade: "كهرباء وتأسيس" },
  { id: 2, name: "فريق مواسير الإطفاء", subcontractorId: 1, teamLead: "أحمد فوزي", trade: "سباكة إطفاء" },
];

// تعيينات الفرق/العمال على المواقع.
export const seedAssignments: ProjectAssignment[] = [
  { id: 1, projectId: 1, teamId: 1, workerId: null, subcontractorId: null, roleOnSite: "تأسيس الإنذار بالسقف", startDate: "2026-05-05", endDate: "" },
  { id: 2, projectId: 3, teamId: 2, workerId: null, subcontractorId: 1, roleOnSite: "تركيب شبكة الرش", startDate: "2026-05-12", endDate: "" },
];
