# منصة المذكرة البيداغوجية 📚

**تطبيق تعليمي متقدم لإعداد وتوليد المذكرات البيداغوجية** لمادة علوم الطبيعة والحياة لجميع مستويات التعليم المتوسط (1AM, 2AM, 3AM, 4AM).

![TypeScript](https://img.shields.io/badge/TypeScript-95.5%25-blue)
![React](https://img.shields.io/badge/React-19.0-61dafb)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFA500)
![Vite](https://img.shields.io/badge/Vite-6.2-646cff)

---

## 🎯 الميزات الرئيسية

✅ **إنشاء المذكرات البيداغوجية**: إنشاء مذكرات تفاعلية كاملة حسب معايير المناهج الوطنية

✅ **التصدير إلى Word**: تحويل المذكرات إلى ملفات Word (.docx) جاهزة للطباعة

✅ **إدارة المحتوى**: تنظيم الأنشطة والموارد والأهداف التعليمية

✅ **التخزين السحابي**: حفظ آمن للبيانات على Firebase

✅ **واجهة عربية**: دعم كامل للغة العربية (RTL)

✅ **مصادقة آمنة**: نظام تسجيل الدخول مع Firebase Authentication

---

## 📋 المتطلبات

- **Node.js** ≥ 18.0
- **npm** ≥ 9.0 أو **yarn** ≥ 1.22
- **حساب Firebase** (اختياري للإنتاج)
- متصفح حديث يدعم ES2022

---

## 🚀 البدء السريع

### 1. استنساخ المستودع
```bash
git clone https://github.com/Snv05/mizaniyati5.git
cd mizaniyati5
```

### 2. تثبيت المعتمديات
```bash
npm install
# أو
yarn install
```

### 3. إعداد متغيرات البيئة
```bash
# نسخ ملف المثال
cp .env.example .env.local

# تحرير الملف وإدراج مفاتيح Firebase الخاصة بك
nano .env.local
```

**متغيرات البيئة المطلوبة:**
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_DATABASE_ID=your_database_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
```

### 4. تشغيل خادم التطوير
```bash
npm run dev
```

التطبيق سيكون متاحاً على: `http://localhost:3000`

---

## 🏗️ بنية المشروع

```
mizaniyati-3/
├── src/
│   ├── main.tsx                 # نقطة الدخول الرئيسية
│   ├── App.tsx                  # المكون الرئيسي
│   ├── components/              # مكونات React المعاد استخدامها
│   ├── pages/                   # صفحات التطبيق
│   ├── services/                # خدمات Firebase والـ API
│   ├── data/                    # بيانات الدروس والمناهج
│   ├── types/                   # تعريفات TypeScript
│   └── styles/                  # أنماط Tailwind CSS
│
├── public/                      # ملفات ثابتة
├── firestore.rules              # قوانين أمان Firestore
├── firebase-blueprint.json      # مخطط قاعدة البيانات
├── vite.config.ts               # إعدادات Vite
├── tsconfig.json                # إعدادات TypeScript
├── tailwind.config.ts           # إعدادات Tailwind
├── package.json                 # المعتمديات والـ scripts
└── README.md                    # هذا الملف
```

---

## 📦 المعتمديات الرئيسية

| المكتبة | الإصدار | الوصف |
|---------|---------|-------|
| `react` | 19.0 | مكتبة واجهات المستخدم |
| `vite` | 6.2 | أداة البناء السريعة |
| `firebase` | 12.18 | خدمات قاعدة البيانات والمصادقة |
| `docx` | 9.7 | توليد ملفات Word |
| `tailwindcss` | 4.1 | إطار عمل CSS |
| `@google/genai` | 2.4 | API Google Gemini (AI) |
| `lucide-react` | 0.546 | مكتبة أيقونات |
| `motion` | 12.23 | رسوم متحركة |

---

## 🔧 أوامر البناء والتطوير

```bash
# تشغيل خادم التطوير
npm run dev

# البناء للإنتاج
npm run build

# معاينة الإنتاج محلياً
npm run preview

# التحقق من أخطاء TypeScript
npm run lint

# تنظيف المخرجات
npm run clean
```

---

## 🔐 الأمان وقوانين Firestore

### قوانين الأمان المطبقة:

✅ **المصادقة المطلوبة**: جميع العمليات تتطلب دخول المستخدم

✅ **عزل البيانات**: كل مستخدم يرى بيانته فقط

✅ **التحقق من الملكية**: تحديث وحذف البيانات متاح للمالك فقط

### تفعيل قوانين Firestore:

```bash
# تثبيت Firebase CLI
npm install -g firebase-tools

# تسجيل الدخول
firebase login

# نشر القوانين
firebase deploy --only firestore:rules
```

---

## 🧪 الاختبار

### تشغيل اختبارات قوانين Firestore:

```bash
npm run test:firestore
```

### التحقق من صحة البيانات:

```bash
# التحقق من بيانات السنة الأولى
npx ts-node validate_1am.ts

# التحقق من بيانات السنة الثالثة
npx ts-node validate_3am.ts

# التحقق من المقاطع (maqati)
npx ts-node check_maqati.ts
```

---

## 📊 هيكل بيانات Firestore

```
users/{userId}/
├── data/{docId}              # بيانات المستخدم العام
├── config/{docId}            # إعدادات المستخدم
├── distributions/{docId}     # توزيع المحتوى السنوي
└── dailyLogs/{docId}         # سجل الدروس اليومية
```

---

## 🚨 استكشاف الأخطاء

### المشكلة: التطبيق لا يتصل بـ Firebase

**الحل:**
1. تحقق من متغيرات البيئة في `.env.local`
2. تأكد م�� صحة مفاتيح Firebase
3. افتح وحدة تحكم المتصفح للبحث عن رسائل الخطأ

### المشكلة: رسالة خطأ "قيمة غير معرّفة"

**الحل:**
```bash
# امسح node_modules وأعد التثبيت
rm -rf node_modules package-lock.json
npm install
```

### المشكلة: تنسيق الكلمات العربية غير صحيح

**الحل:**
تأكد من أن المتصفح يدعم Unicode بشكل صحيح:
```html
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<html lang="ar" dir="rtl">
```

---

## 📚 الموارد والتوثيق

- [توثيق Firebase](https://firebase.google.com/docs)
- [توثيق React](https://react.dev)
- [توثيق Vite](https://vitejs.dev)
- [مكتبة docx](https://docx.js.org/)
- [Tailwind CSS](https://tailwindcss.com)

---

## 🤝 المساهمة

نرحب بمساهماتك! إذا وجدت خطأً أو لديك اقتراح:

1. اشتق فرعاً من المستودع
2. قم بإنشاء فرع ميزة (`git checkout -b feature/amazing-feature`)
3. انشر التغييرات (`git commit -m 'Add amazing feature'`)
4. ادفع إلى الفرع (`git push origin feature/amazing-feature`)
5. افتح طلب دمج (Pull Request)

---

## 📝 الترخيص

هذا المشروع مرخص تحت [MIT License](LICENSE)

---

## 👨‍💻 المؤلف

**Snv05** - [GitHub Profile](https://github.com/Snv05)

---

## 📞 الدعم والتواصل

إذا واجهت مشاكل أو لديك أسئلة:

- 🐛 [افتح issue على GitHub](https://github.com/Snv05/mizaniyati-3/issues)
- 📧 تواصل عبر البريد الإلكتروني
- 💬 استخدم Discussions على GitHub

---

## 🎓 ملاحظات للمعلمين

هذا التطبيق مصمم خصيصاً لمعلمي علوم الطبيعة والحياة في المدارس الجزائرية. يتبع معايير المناهج الوطنية ويوفر أدوات فعالة لإعداد الدروس والأنشطة التعليمية.

---

**آخر تحديث:** 29 أغسطس 2026  
**الإصدار:** 1.0.0  
**الحالة:** ✅ قيد التطوير النشط
