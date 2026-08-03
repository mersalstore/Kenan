/**
 * مصدر واحد لمفتاح توقيع التوكينات.
 *
 * كان المفتاح مكتوباً كقيمة احتياطية في ثلاثة ملفات، وهي قيمة منشورة في
 * المستودع — أي أن بإمكان أي شخص يقرأ الكود أن يزوّر توكين مدير. لذلك لا
 * قيمة احتياطية هنا: إن غاب المفتاح يتوقف السيرفر عند الإقلاع بدل أن يعمل
 * بحماية وهمية.
 */
function required(name: string): string {
  const value = process.env[name];

  if (!value || value.length < 32) {
    throw new Error(
      `${name} غير معرّف أو أقصر من 32 حرفاً. أضف مفتاحاً عشوائياً قوياً في ` +
        `apps/backend/.env.production قبل تشغيل السيرفر.`,
    );
  }

  return value;
}

export function jwtSecret(): string {
  return required("JWT_SECRET");
}

export function jwtRefreshSecret(): string {
  return required("JWT_REFRESH_SECRET");
}
