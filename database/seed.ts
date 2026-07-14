import { PrismaClient, UserRole, ProjectStatus, StageStatus, AttendanceStatus, LeaveType, LeaveStatus, PayrollStatus, QuotationStatus, TemplateType, InvoiceStatus, DeficiencySeverity, DeficiencyStatus, SystemType, SystemStatus, ComponentInstallStatus, MaintenanceContractFrequency, MaintenanceContractStatus, VisitStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("Seeding Kanan database...");

  // 1. Clear existing data in reverse relation order
  await prisma.auditLog.deleteMany();
  await prisma.maintenanceVisit.deleteMany();
  await prisma.maintenanceContract.deleteMany();
  await prisma.systemComponent.deleteMany();
  await prisma.projectSystem.deleteMany();
  await prisma.siteDeficiency.deleteMany();
  await prisma.projectMaterial.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.contractTemplate.deleteMany();
  await prisma.paymentTerm.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.quotationItem.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.payrollRun.deleteMany();
  await prisma.leave.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.projectAssignment.deleteMany();
  await prisma.contractor.deleteMany();
  await prisma.worker.deleteMany();
  await prisma.projectStageHistory.deleteMany();
  await prisma.projectStage.deleteMany();
  await prisma.userProjectPermission.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Default Users
  // Admin accounts
  const admin = await prisma.user.create({
    data: {
      name: "الإدارة العامة",
      email: "kenansafety.sec@gmail.com",
      passwordHash: "$2b$10$tlWtBWuYzlaeU43AjZCMzODAhgYQ9IpVlKnLzubim2ezy5bfPdqO2", // bcrypt hash for '123456'
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const engineer = await prisma.user.create({
    data: {
      name: "م. كريم عادل",
      email: "engineer@kenan.com",
      passwordHash: "$2b$10$tlWtBWuYzlaeU43AjZCMzODAhgYQ9IpVlKnLzubim2ezy5bfPdqO2", // '123456'
      role: UserRole.SITE_ENGINEER,
      isActive: true,
    },
  });

  const pm = await prisma.user.create({
    data: {
      name: "مدير المشاريع",
      email: "pm@kenan.com",
      passwordHash: "$2b$10$tlWtBWuYzlaeU43AjZCMzODAhgYQ9IpVlKnLzubim2ezy5bfPdqO2",
      role: UserRole.PROJECT_MANAGER,
      isActive: true,
    },
  });

  const accountant = await prisma.user.create({
    data: {
      name: "محاسب الشركة",
      email: "accountant@kenan.com",
      passwordHash: "$2b$10$tlWtBWuYzlaeU43AjZCMzODAhgYQ9IpVlKnLzubim2ezy5bfPdqO2",
      role: UserRole.PROCUREMENT,
      isActive: true,
    },
  });

  console.log("Users seeded successfully.");

  // 3. Seed Role Permissions
  // Admin permissions (read/write all)
  const modules = ["clients", "projects", "stages", "workers", "teams", "attendance", "leaves", "payroll", "inventory", "finance", "contracts", "maintenance", "quotations", "reports", "settings", "audit"];
  for (const mod of modules) {
    for (const action of ["CREATE", "READ", "UPDATE", "DELETE"]) {
      await prisma.rolePermission.create({
        data: {
          role: UserRole.ADMIN,
          module: mod,
          action: action as any,
        },
      });
    }
  }

  // Site Engineer permissions
  const engModules = {
    projects: ["READ", "UPDATE"],
    stages: ["READ", "CREATE", "UPDATE"],
    attendance: ["READ", "CREATE", "UPDATE"],
    leaves: ["READ", "CREATE"],
    inventory: ["READ"],
  };
  for (const [mod, actions] of Object.entries(engModules)) {
    for (const action of actions) {
      await prisma.rolePermission.create({
        data: {
          role: UserRole.SITE_ENGINEER,
          module: mod,
          action: action as any,
        },
      });
    }
  }

  console.log("Permissions seeded successfully.");

  // 4. Seed Clients
  const client1 = await prisma.client.create({
    data: {
      name: "أحمد الشامي",
      phone: "01001234567",
      address: "التجمع الخامس، القاهرة",
      type: "مالك وحدة",
      notes: "يفضل المتابعة عبر واتساب",
      sector: "خاص",
      city: "القاهرة",
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: "شركة المدار",
      phone: "01119876543",
      address: "مدينة نصر، القاهرة",
      type: "شركة",
      notes: "تركيبات كاميرات وشبكات",
      sector: "خاص",
      city: "القاهرة",
      commercialRegister: "7050404537",
      taxId: "313072607300003",
    },
  });

  console.log("Clients seeded successfully.");

  // 5. Seed Projects
  const project1 = await prisma.project.create({
    data: {
      name: "فيلا الياسمين",
      type: "نظام إنذار حريق",
      clientId: client1.id,
      address: "التجمع الخامس",
      startDate: new Date("2026-05-01"),
      endDate: new Date("2026-06-15"),
      status: ProjectStatus.IN_PROGRESS,
      engineerId: engineer.id,
      budget: 850000,
      progress: 58,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "فرع المدار الرئيسي",
      type: "كاميرات مراقبة وشبكات",
      clientId: client2.id,
      address: "مدينة نصر",
      startDate: new Date("2026-04-22"),
      endDate: new Date("2026-05-28"),
      status: ProjectStatus.DELAYED,
      engineerId: engineer.id,
      budget: 240000,
      progress: 72,
    },
  });

  console.log("Projects seeded successfully.");

  // 6. Seed Project Permissions (Site access for Karim)
  await prisma.userProjectPermission.create({
    data: {
      userId: engineer.id,
      projectId: project1.id,
    },
  });

  await prisma.userProjectPermission.create({
    data: {
      userId: engineer.id,
      projectId: project2.id,
    },
  });

  // 7. Seed Project Stages
  const stages = [
    { name: "المعاينة", status: StageStatus.DONE, notes: "تم اعتماد المقاسات" },
    { name: "التأسيس", status: StageStatus.DONE, notes: "تم تأسيس الكهرباء والسباكة" },
    { name: "التركيب", status: StageStatus.DOING, notes: "تركيب وحدات الإضاءة" },
    { name: "الاختبار", status: StageStatus.TODO, notes: "" },
    { name: "التسليم", status: StageStatus.TODO, notes: "" },
  ];

  for (const st of stages) {
    await prisma.projectStage.create({
      data: {
        projectId: project1.id,
        name: st.name,
        status: st.status,
        notes: st.notes,
        color: "#e11d48",
      },
    });
  }

  console.log("Project Stages seeded successfully.");

  // 8. Seed Workers and Contractors
  const worker1 = await prisma.worker.create({
    data: {
      name: "سيد مصطفى",
      specialty: "كهربائي",
      phone: "01005550101",
      dailyRate: 450,
      nationalId: "29001011200011",
      employmentType: "يومي",
      monthlySalary: 0,
      isActive: true,
    },
  });

  const worker2 = await prisma.worker.create({
    data: {
      name: "أحمد فوزي",
      specialty: "فني كاميرات",
      phone: "01104440202",
      dailyRate: 500,
      nationalId: "28805052200022",
      employmentType: "يومي",
      monthlySalary: 0,
      isActive: true,
    },
  });

  const contractor1 = await prisma.contractor.create({
    data: {
      name: "مؤسسة إعمار النخبة للمقاولات",
      phone: "0555123456",
      specialty: "أعمال التكسير والحفر",
      company: "مؤسسة إعمار النخبة",
      address: "الرياض، حي السلي",
      notes: "مقاول باطن لأعمال الحفر والشبكات الأرضية",
    },
  });

  console.log("Workers and Contractors seeded.");

  // 9. Assign Workers/Contractors to project
  await prisma.projectAssignment.create({
    data: {
      projectId: project1.id,
      workerId: worker1.id,
      roleOnSite: "تأسيس الإنذار بالسقف",
      startDate: new Date("2026-05-05"),
    },
  });

  await prisma.projectAssignment.create({
    data: {
      projectId: project1.id,
      contractorId: contractor1.id,
      roleOnSite: "أعمال التكسير والشبكة الأرضية",
      startDate: new Date("2026-05-10"),
    },
  });

  // 10. Seed Inventory
  const items = [
    { name: "مضخة حريق كهربائية 350 ج/د", brand: "TOSY", quantity: 5, unit: "مجموعة", purchasePrice: 12000, salePrice: 15000, supplier: "TOSY Pumps", minQuantity: 1 },
    { name: "مواسير البولي ايثيلين HDPE 4 بوصة", brand: "ALMONIF", quantity: 250, unit: "متر طولي", purchasePrice: 45, salePrice: 60, supplier: "المنيف للمواسير", minQuantity: 50 },
    { name: "رشاش مياه سفلي 0.5 بوصة", brand: "TYCO أمريكي", quantity: 500, unit: "حبة", purchasePrice: 180, salePrice: 250, supplier: "تايكو للسلامة", minQuantity: 100 },
  ];

  for (const it of items) {
    await prisma.inventoryItem.create({
      data: {
        name: it.name,
        brand: it.brand,
        quantity: it.quantity,
        unit: it.unit,
        purchasePrice: it.purchasePrice,
        salePrice: it.salePrice,
        supplier: it.supplier,
        receivedAt: new Date("2026-05-10"),
        minQuantity: it.minQuantity,
      },
    });
  }

  // 11. Seed Contract Templates
  const templates = [
    { type: TemplateType.TERMS, content: "الشروط العامة للتعاقد: يلتزم الطرف الأول بالتوريد والتركيب والطرف الثاني بسداد الدفعات." },
    { type: TemplateType.CONDITIONS, content: "شروط التنفيذ والتركيب: تتم الأعمال وفق الكود الوطني للأمن والسلامة وتوجيهات الدفاع المدني." },
    { type: TemplateType.SAFETY, content: "إجراءات السلامة: يلتزم الطرف الأول بتأمين العمالة ومستلزمات الحماية الشخصية بموقع العمل." },
    { type: TemplateType.PAYMENTS, content: "جدول الدفعات الافتراضي: 50% مقدم، 25% تركيب، 25% تسليم." },
  ];

  for (const t of templates) {
    await prisma.contractTemplate.create({
      data: {
        type: t.type,
        content: t.content,
      },
    });
  }

  // 12. Seed Quotations
  const quotation1 = await prisma.quotation.create({
    data: {
      number: "QT-2026-001",
      clientId: client1.id,
      date: new Date("2026-05-10"),
      validUntil: new Date("2026-06-10"),
      status: QuotationStatus.APPROVED,
      value: 25415,
      taxPercent: 15,
      currency: "SAR",
      notes: "الأسعار تشمل التوريد والتركيب والضمان سنتين",
    },
  });

  await prisma.quotationItem.create({
    data: {
      quotationId: quotation1.id,
      name: "توريد وتركيب شبكة مواسير إطفاء حريق 2 بوصة",
      brand: "ALMONIF",
      qty: 45,
      price: 120,
      total: 5400,
    },
  });

  await prisma.quotationItem.create({
    data: {
      quotationId: quotation1.id,
      name: "مضخة حريق معتمدة من الدفاع المدني",
      brand: "TOSY",
      qty: 1,
      price: 14500,
      total: 14500,
    },
  });

  console.log("Quotations seeded.");

  // 13. Seed Contracts
  const contract1 = await prisma.contract.create({
    data: {
      projectId: project1.id,
      clientId: client1.id,
      value: 850000,
      currency: "SAR",
      startDate: new Date("2026-05-01"),
      endDate: new Date("2026-06-15"),
      warranty: "سنتين",
      clauses: "تشطيبات وتمديدات كاملة لشبكة الإطفاء",
      specs: ["مضخة حريق TOSY", "مواسير HDPE الجزيرة SCH 40"],
    },
  });

  await prisma.paymentTerm.create({
    data: {
      contractId: contract1.id,
      label: "دفعة مقدم عند توقيع العقد",
      percent: 50,
    },
  });

  await prisma.paymentTerm.create({
    data: {
      contractId: contract1.id,
      label: "دفعة عند بدء أعمال التركيب",
      percent: 50,
    },
  });

  // 14. Seed Invoices & Expenses
  await prisma.invoice.create({
    data: {
      projectId: project1.id,
      number: "INV-2026-001",
      amount: 320000,
      status: InvoiceStatus.PAID,
      dueDate: new Date("2026-05-15"),
      paidAt: new Date("2026-05-05"),
    },
  });

  await prisma.expense.create({
    data: {
      projectId: project1.id,
      type: "خامات",
      amount: 185000,
      description: "شراء وتوريد صمامات وخطوط مواسير",
      date: new Date("2026-05-06"),
    },
  });

  // 15. Seed Site Deficiencies
  await prisma.siteDeficiency.create({
    data: {
      projectId: project1.id,
      raisedById: engineer.id,
      description: "حساس دخان غير مثبت في غرفة الكهرباء بالدور الأرضي",
      severity: DeficiencySeverity.HIGH,
      status: DeficiencyStatus.OPEN,
      raisedDate: new Date("2026-06-10"),
    },
  });

  // 16. Seed Technical Systems
  const sys1 = await prisma.projectSystem.create({
    data: {
      projectId: project1.id,
      type: SystemType.FIRE_ALARM,
      name: "نظام الإنذار المبكر - فيلا الياسمين",
      status: SystemStatus.INSTALLING,
      notes: "تأسيس بالسقف",
    },
  });

  await prisma.systemComponent.create({
    data: {
      systemId: sys1.id,
      componentType: "لوحة تحكم",
      description: "لوحة إنذار عنونة 4 لوب",
      manufacturer: "Honeywell",
      model: "NFS2-3030",
      quantity: 1,
      unit: "عدد",
      location: "غرفة الكهرباء",
      installStatus: ComponentInstallStatus.INSTALLED,
      installDate: new Date("2026-05-20"),
    },
  });

  // 17. Seed Maintenance Contracts
  const mainC = await prisma.maintenanceContract.create({
    data: {
      contractNumber: "MNT-2026-001",
      clientId: client2.id,
      projectId: project2.id,
      value: 36000,
      currency: "SAR",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      frequency: MaintenanceContractFrequency.MONTHLY,
      status: MaintenanceContractStatus.ACTIVE,
    },
  });

  await prisma.maintenanceVisit.create({
    data: {
      contractId: mainC.id,
      scheduledDate: new Date("2026-01-01"),
      completedDate: new Date("2026-01-03"),
      status: VisitStatus.DONE,
      performedBy: "م. كريم عادل",
      notes: "فحص دوري - سليم",
    },
  });

  // 18. Seed Attendance & Leaves
  await prisma.attendanceRecord.create({
    data: {
      workerId: worker1.id,
      projectId: project1.id,
      date: new Date("2026-06-01"),
      status: AttendanceStatus.PRESENT,
      checkIn: "08:00",
      checkOut: "16:00",
      hours: 8,
      overtimeHours: 1,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
