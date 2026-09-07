// إعدادات Prisma CLI — لأوامر db push / generate / studio.
//
// الترتيب مقصود: dotenv لا يستبدل متغيراً محمّلاً مسبقاً، فيفوز أول ملف موجود.
//   1) .env بجذر المستودع → جهاز التطوير، ويشير إلى srv1803.hstgr.io
//   2) .env.production    → داخل استضافة Hostinger أثناء البناء، ويشير إلى localhost
// الرابط هنا يُستخدم لتوليد العميل فقط، أما التشغيل فيقرأ الإعدادات من prisma.service.ts
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
require("dotenv").config({ path: path.join(__dirname, ".env.production") });
const { defineConfig } = require("prisma/config");

// لا تضع بيانات اعتماد حساسة إضافية — هذا مسار محلي أثناء البناء
// لاحظ ترميز الرموز الخاصة في كلمة المرور داخل الرابط: @ = %40 و # = %23
const DB_URL =
  process.env.DATABASE_URL ||
  "mysql://u463801179_kanan_user:8dREB5qR7wmrWTiL@localhost:3306/u463801179_kanan_db";

module.exports = defineConfig({
  schema: path.join(__dirname, "prisma/schema.prisma"),
  datasource: {
    url: DB_URL,
  },
});

