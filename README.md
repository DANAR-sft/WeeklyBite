**Weekly Meal Planner**

Deskripsi singkat: Aplikasi web Next.js untuk merencanakan menu mingguan, mengelola bahan belanja, dan menyiapkan langkah masak. Proyek ini menggunakan Supabase untuk autentikasi dan penyimpanan data.

**Fitur**

- **Perencanaan**: Buat dan kelola rencana makan mingguan.
- **Grocery list**: Kelola daftar belanja berdasarkan rencana.
- **Prep plan**: Atur langkah-langkah persiapan masakan.
- **Swap meals**: Tukar/mutasi item rencana makan.

**Tech Stack**

- **Framework**: Next.js (App Router)
- **Backend-as-DB**: Supabase
- **Bahasa**: TypeScript

**Quick Start**

1. Prasyarat:
   - Node.js (LTS)
   - Yarn atau npm
   - Akun Supabase (untuk database + auth)

2. Clone repo dan install:

```bash
git clone <repo-url>
cd weekly-meal-planner
npm install
# atau
# yarn
```

3. Salin environment file dan isi variabel yang diperlukan:

```bash
cp .env.example .env.local
```

Isi setidaknya:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (hanya untuk tugas admin/dev jika diperlukan)

4. Jalankan development server:

```bash
npm run dev
# atau
# yarn dev
```

5. Akses di `http://localhost:3000`.

**Environment & Supabase**

- Pastikan proyek Supabase memiliki skema yang sesuai dengan migrasi di folder [supabase/](supabase/).
- File migrasi utama: [supabase/migrations/20260205_create_meal_planner_tables.sql](supabase/migrations/20260205_create_meal_planner_tables.sql)
- Jika menggunakan Supabase CLI, jalankan migrasi sesuai dokumentasi Supabase.

**API Routes**

- Auth: [app/api/auth/route.ts](app/api/auth/route.ts)
- Grocery: [app/api/grocery/route.ts](app/api/grocery/route.ts)
- Meal plan: [app/api/meal-plan/route.ts](app/api/meal-plan/route.ts)
- Prep plan: [app/api/prep-plan/route.ts](app/api/prep-plan/route.ts)
- Swap meal: [app/api/swap-meal/route.ts](app/api/swap-meal/route.ts)

Catatan: API route implementations ada di folder `app/api/*` dan menggunakan helper/service di `services/`.

**Services**

- Implementasi logika akses data ada di folder [services/](services/), mis. `grocery-service.ts`, `meal-service.ts`, `prep-service.ts`, `swap-service.ts`, `auth-service.ts`.

**Folder penting**

- `app/` — entry Next.js, route & UI pages (lihat [app/plan/prep/page.tsx](app/plan/prep/page.tsx) sebagai contoh halaman).
- `services/` — lapisan akses data ke Supabase.
- `supabase/` — konfigurasi dan migrasi DB.
- `src/components/` — komponen UI.

**Scripts**

- Periksa `package.json` untuk perintah yang tersedia seperti `dev`, `build`, `start`, `lint`, dsb.

**Testing & Linting**

- Jalankan test atau lint sesuai konfigurasi proyek (cek `package.json`).

**Contributing**

- Buka issue untuk bug atau fitur baru.
- Buat branch fitur: `feature/<nama>` lalu buat PR ke `main`.

**License**

- Tambahkan lisensi sesuai kebutuhan (mis. MIT). Jika belum ada, tambahkan file `LICENSE`.

**Selanjutnya (opsional)**

- Tambahkan badge CI, coverage, dan status deploy ke README.
- Tambahkan contoh `.env.example` jika belum tersedia.
  This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

Generate by GPT-5-mini
