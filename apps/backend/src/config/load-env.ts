import * as dotenv from "dotenv";
import * as path from "path";

let loaded = false;

/**
 * يحمّل متغيرات البيئة مرة واحدة فقط.
 *
 * الترتيب مهم: dotenv لا يستبدل المتغيرات الموجودة مسبقاً في process.env،
 * لذلك متغيرات الاستضافة (مثل PORT الذي تحدده Hostinger) تبقى هي الأولوية.
 *
 * appRoot يُحسب من __dirname لأن الكود يعمل من dist/ بعد البناء،
 * وليس من مجلد العمل الحالي الذي يختلف على السيرفر.
 */
export function loadEnv() {
  if (loaded) return;
  loaded = true;

  // distDir = مجلد الخرج المبني، appRoot = المجلد الذي يعلوه.
  // نبحث في dist أولاً لأن الاستضافة تنشر مجلد dist فقط، ولذلك ينسخ
  // سكربت البناء ملف .env.production بداخله (انظر package.json).
  const distDir = path.join(__dirname, "..");
  const appRoot = path.join(distDir, "..");

  for (const file of [
    path.join(distDir, ".env.production"),
    path.join(appRoot, ".env.production"),
    path.join(appRoot, ".env"),
    path.join(process.cwd(), ".env.production"),
    path.join(process.cwd(), ".env"),
    path.join(process.cwd(), "..", "..", ".env"),
  ]) {
    dotenv.config({ path: file });
  }
}
