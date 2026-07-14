# KENAN Management System

موقع عربي وهوية تشغيل داخلية لإدارة مشاريع التشطيبات والتركيبات وأنظمة الأمن والكاميرات.

## التشغيل

```bash
npm install
npm run dev
```

أمر `npm run dev` يشغل:

- API على `http://127.0.0.1:8787`
- واجهة Vite على `http://127.0.0.1:5173`

## البناء

```bash
npm run build
```

## تشغيل الإنتاج المحلي

```bash
npm run build
npm start
```

## الوحدات الحالية

- موقع تعريفي خارجي للشركة قبل تسجيل الدخول.
- تسجيل دخول Google مع تحقق من Google ID Token على السيرفر.
- لوحة تحكم بالمشاريع، التنبيهات، الربح، وحضور العمال.
- إدارة العملاء مع إضافة عميل وبحث سريع.
- إدارة المشاريع مع إنشاء مشروع ومراحل تنفيذ افتراضية.
- متابعة مراحل التنفيذ وتغيير حالة كل مرحلة.
- إدارة العمال والحضور والتوزيع.
- المخزن وصرف الخامات للمشاريع.
- الحسابات والفواتير والمصروفات.
- العقود والضمانات.
- التقارير مع تصدير CSV وطباعة PDF من المتصفح.
- شاشة صلاحيات مبدئية للأدوار.

## Google OAuth

السيرفر يقرأ `client_id` من ملف `client_secret_*.json` الموجود في جذر المشروع، ولا يرسل `client_secret` للمتصفح.

في Google Cloud Console أضف هذه القيم في **Authorized JavaScript origins**:

- `https://kenan4saftey.com`
- `http://127.0.0.1:5173` للتجربة المحلية
- `http://localhost:5173` لو ستفتح الموقع بهذا العنوان

النسخة الحالية تستخدم Google popup mode، لذلك لا تحتاج redirect URI محليًا.

الحساب الإداري الافتراضي هو:

```text
kenansafety.sec@gmail.com
```

إذا لم تضبط `ALLOWED_GOOGLE_EMAILS` فسيتم رفض أي حساب غير هذا الحساب. يمكن إضافة حسابات أخرى لاحقًا عبر:

```bash
ALLOWED_GOOGLE_EMAILS=admin@example.com,engineer@example.com
ALLOWED_GOOGLE_DOMAIN=example.com
```

## البيانات

النسخة الحالية تستخدم بيانات تشغيل محلية محفوظة في `localStorage` للعرض والتجربة. ملف قاعدة البيانات المقترح موجود في:

`database/schema.sql`
