// إضافة صلاحيات الأدوار الناقصة بدون مسح أي بيانات (idempotent — آمن لإعادة التشغيل)
// PROJECT_MANAGER كان بلا أي صفوف صلاحيات => كل محاولات التعديل كانت بترجع 403
import { PrismaClient, UserRole, Action } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });
dotenv.config({ path: path.join(process.cwd(), "apps", "backend", ".env") });

function connectionOptions() {
  const url = new URL(
    process.env.DATABASE_URL ??
      "mysql://root@localhost:3306/kanan",
  );

  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    connectionLimit: 5,
    connectTimeout: 10_000,
  };
}

const adapter = new PrismaMariaDb(connectionOptions());
const prisma = new PrismaClient({ adapter } as any);

const CRUD: Action[] = [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE];

const grants: Record<string, Record<string, Action[]>> = {
  [UserRole.PROJECT_MANAGER]: {
    projects: CRUD,
    stages: CRUD,
    systems: CRUD,
    deficiencies: CRUD,
    quotations: CRUD, // قفل التعديل بعد التعميد يُفرض في الخدمة نفسها
    contracts: CRUD,
    supplyOrders: CRUD,
    dailyReports: [Action.READ, Action.CREATE],
    reports: [Action.READ],
    media: CRUD,
    inventory: [Action.READ, Action.CREATE, Action.UPDATE],
    workers: CRUD,
    teams: CRUD,
    attendance: CRUD,
    leaves: CRUD,
    payroll: CRUD,
    maintenance: CRUD,
    finance: CRUD,
  },
  [UserRole.SITE_ENGINEER]: {
    dailyReports: [Action.READ, Action.CREATE],
    deficiencies: [Action.READ, Action.CREATE, Action.UPDATE],
    systems: [Action.READ, Action.CREATE, Action.UPDATE],
    supplyOrders: [Action.READ, Action.UPDATE], // استلام وتأكيد التوريد
    media: [Action.READ, Action.CREATE],
    workers: [Action.READ, Action.CREATE, Action.UPDATE],
    teams: [Action.READ, Action.CREATE, Action.UPDATE],
  },
  [UserRole.PROCUREMENT]: {
    quotations: [Action.READ, Action.CREATE, Action.UPDATE],
    contracts: [Action.READ, Action.CREATE, Action.UPDATE],
    supplyOrders: CRUD,
    projects: [Action.READ],
    reports: [Action.READ],
    inventory: CRUD,
    workers: [Action.READ],
    attendance: [Action.READ],
    leaves: [Action.READ],
    payroll: CRUD,
    finance: CRUD,
    maintenance: [Action.READ],
  },
};

async function main() {
  const rows: { role: UserRole; module: string; action: Action }[] = [];
  for (const [role, modules] of Object.entries(grants)) {
    for (const [mod, actions] of Object.entries(modules)) {
      for (const action of actions) {
        rows.push({ role: role as UserRole, module: mod, action });
      }
    }
  }

  const result = await prisma.rolePermission.createMany({
    data: rows,
    skipDuplicates: true,
  });

  console.log(`Inserted ${result.count} new permission row(s) out of ${rows.length} declared.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
