# Tish Klinika CRM

Tish klinikalari uchun bemorlar boshqaruv tizimi — MVP (1-bosqich). To'liq
texnik topshiriq: [`Tish_Klinika_CRM_TZ.md`](./Tish_Klinika_CRM_TZ.md).

## Stek

React 19 · TypeScript · Vite · TailwindCSS v4 · Shadcn/UI · React Query ·
Zustand · React Hook Form + Zod · Supabase (Postgres, Auth, Edge Functions,
RLS) · Telegraf.js.

## Loyihani ishga tushirish

```bash
npm install
cp .env.example .env   # .env ichiga Supabase URL/key qo'yish
npm run dev
```

`.env` qiymatlari Supabase loyiha sozlamalaridan olinadi (Project Settings →
API). Bu loyiha uchun Supabase project ref: `gjllrgqxgyxzuvxtbjbe`.

## Papka strukturasi

Feature-based (`app/`, `pages/`, `widgets/`, `features/`, `entities/`,
`shared/`) — shadcn komponentlari an'anaviy joyida (`src/components/ui`,
`src/lib/utils`) qoladi, chunki shadcn CLI shu joyni kutadi.

## Supabase

- Migratsiyalar `mcp__claude_ai_Supabase__apply_migration` orqali qo'llanilgan
  (lokal `supabase/migrations` papkasi yo'q — sxema to'g'ridan-to'g'ri
  loyihada). Sxemani qayta ko'rish uchun Supabase Dashboard → Database →
  Migrations.
- TypeScript turlari: `src/shared/types/database.ts` — sxema o'zgarganda
  qayta generatsiya qilish kerak.
- Edge Functions: `signup-clinic`, `create-staff`, `telegram-webhook`,
  `telegram-set-webhook`, `send-appointment-reminders`,
  `send-recall-reminders`.
- Cron: `send-appointment-reminders` har soatda, `send-recall-reminders` har
  kuni (pg_cron orqali, `cron.job` jadvalida ko'rinadi).

### Qo'lda bajariladigan Supabase sozlamalari (ixtiyoriy, kod orqali
o'rnatib bo'lmaydi)

1. **JWT custom claims hook** — Authentication → Hooks →
   "Customize Access Token (JWT) Claims hook" → `public.custom_access_token_hook`
   ni tanlang. RLS bunga bog'liq emas (allaqachon ishlaydi), lekin
   `role`/`clinic_id` JWT ichida bo'lishini xohlasangiz yoqing.
2. **Leaked password protection** — Authentication → Policies → yoqish
   tavsiya etiladi (HaveIBeenPwned tekshiruvi).

## Telegram bot

Klinika Egasi `/settings/bot` sahifasida @BotFather'dan olingan tokenni
kiritadi — tizim avtomatik tekshiradi (`getMe`) va webhook'ni o'rnatadi
(`setWebhook`, path: `/telegram-webhook/<clinic_id>`).

**Diqqat:** Botni sinashda faqat o'zingizga tegishli, yangi yaratilgan test
bot tokenidan foydalaning. Brauzer avtomatik to'ldirish (autofill/parol
menejeri) token maydoniga tasodifiy qiymat qo'yib yubormasligi uchun
formani qo'lda to'ldiring va yuborishdan oldin tekshiring.

## Rollar

| Rol | Kirish huquqi |
|---|---|
| `superadmin` | Platforma darajasida: barcha klinikalarni (kompaniyalarni) ko'radi, yangi klinika yaratadi, klinikalarni faol/nofaol qiladi, filiallarni ko'radi/boshqaradi. **Bemorlar, navbatlar, to'lovlar va tibbiy ma'lumotlarga kirish huquqi yo'q** — bu ataylab shunday: tibbiy ma'lumotlar har doim faqat o'z klinikasi doirasida qoladi. `clinic_id` yo'q (NULL). |
| `owner` (Klinika Egasi) | O'z klinikasi doirasida hammasi: bemorlar, navbatlar, xizmatlar, filiallar, xodimlar, bot, moliyaviy hisobotlar |
| `admin` (Administrator) | Bemorlar (tibbiy tarixsiz), navbatlar, to'lovlar — xizmatlar/filiallar/xodimlar/bot sozlamalarisiz |
| `doctor` (Shifokor) | Faqat o'ziga biriktirilgan bemorlar/navbatlar, davolash rejalari — to'lovlarsiz |

**Klinikalar endi o'zi ro'yxatdan o'ta olmaydi** — faqat superadmin "Kompaniyalar"
sahifasida yangi klinika (+ uning egasi hisobi) yaratadi. Bu ShoeClean
ERP'dagi companies/branches modeliga mos.

## Filiallar (branches)

Har bir klinika bir nechta filialga ega bo'lishi mumkin (`branches` jadvali).
Klinika egasi o'z filiallarini `/branches` sahifasida, superadmin esa
"Kompaniyalar" sahifasida istalgan klinikaning filiallarini boshqaradi.
`appointments.branch_id` va `users.branch_id` ustunlari mavjud (ixtiyoriy) —
navbat/xodimni muayyan filialga bog'lash uchun asos qo'yilgan, lekin
navbat yaratish formasida filial tanlash hali qo'shilmagan (keyingi qadam).

## Keyingi bosqich (hali qurilmagan)

Tish jadvali (odontogram), rentgen yuklash (Supabase Storage + signed URL),
komissiya hisoblash, SMS integratsiyasi, navbat/xodim formalarida filial
tanlovi — TZ 11-bo'limiga qarang.
