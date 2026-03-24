# حكايا — منصة منشئ الروايات الذكي 📖

## نظرة عامة
منصة ذكية تتيح للمستخدمين إنشاء روايات مخصصة كاملة بالذكاء الاصطناعي (Claude API).

---

## 🚀 تشغيل الموقع

### الطريقة السريعة (محلياً)
```bash
# افتح ملف index.html مباشرةً في المتصفح
open index.html
```

### أو عبر سيرفر محلي
```bash
# Python
python -m http.server 8080

# أو Node.js
npx serve .
```

---

## 🔑 إعداد Claude API

1. اذهب إلى [console.anthropic.com](https://console.anthropic.com)
2. أنشئ حساباً مجانياً واحصل على مفتاح API
3. أدخل المفتاح في الخطوة الأخيرة من منشئ الروايات

**ملاحظة:** المفتاح يُخزّن محلياً في متصفحك فقط ولا يُرسل لأي خادم.

---

## 📁 هيكل الملفات

```
hikaya/
├── index.html      — الواجهة الرئيسية
├── styles.css      — التصميم الكامل
├── app.js          — منطق التطبيق + Claude API
└── README.md       — هذا الملف
```

---

## ✨ الميزات

| الميزة | الوصف |
|--------|-------|
| منشئ الروايات | ٤ خطوات تفصيلية لتخصيص كامل |
| ١٢ نوع روائي | من الأكشن إلى الفلسفية |
| أساليب متعددة | فصحى، عامية، مختصر، تفصيلي |
| شخصيات مخصصة | بناء الشخصيات وصفاتها |
| إضافات ذكية | حبكات فرعية، فلاش باك، منعطفات |
| نتيجة قابلة للتحرير | نسخ، تحميل، حفظ |
| مجتمع القراء | استعراض روايات الآخرين |

---

## 🎨 التصميم

- **لوحة الألوان:** تيل داكن × ذهبي كهرماني × برقواني
- **الخطوط:** Scheherazade New (عناوين) + Amiri (متن) + Cairo (واجهة)
- **الأسلوب:** Dark luxury بتفاصيل حركية راقية

---

## 🔧 التطوير المستقبلي

### الباكند المقترح (Node.js + Supabase)
```
backend/
├── server.js           — Express API
├── routes/
│   ├── auth.js         — Google OAuth
│   ├── novels.js       — CRUD الروايات
│   └── community.js    — المجتمع والتقييمات
├── models/
│   ├── User.js
│   └── Novel.js
└── services/
    └── claude.js       — Claude API wrapper
```

### قاعدة البيانات (Supabase/PostgreSQL)
```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Novels  
CREATE TABLE novels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  genres TEXT[],
  style TEXT,
  chap_count INT,
  is_public BOOLEAN DEFAULT FALSE,
  cover_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ratings
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  novel_id UUID REFERENCES novels(id),
  user_id UUID REFERENCES users(id),
  score INT CHECK (score BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(novel_id, user_id)
);
```

---

## 🛡️ الأمان

- مفاتيح API مشفرة في localStorage
- CORS مضبوط على الباكند
- Rate limiting على طلبات التوليد
- تصفية المحتوى قبل الإرسال لـ Claude

---

## 📱 التوافق

✅ Chrome/Edge | ✅ Firefox | ✅ Safari | ✅ Mobile

---

**صُنع بـ ❤️ لمحبي الأدب العربي**
