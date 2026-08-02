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

// لا تضع بيانات اعتماد في هذا الملف — فهو متتبَّع في Git.
// لاحظ ترميز الرموز الخاصة في كلمة المرور داخل الرابط: @ = %40 و # = %23
const DB_URL = process.env.DATABASE_URL;

if (!DB_URL) {
  throw new Error(
    "DATABASE_URL غير معرّف. أضفه في ملف .env بجذر المستودع قبل تشغيل أوامر Prisma.",
  );
}

module.exports = defineConfig({
  schema: path.join(__dirname, "prisma/schema.prisma"),
  datasource: {
    url: DB_URL,
  },
});
