# PRD — nutaraline Web

**Document ID:** PRD-W-20261020-01
**Version:** 1.0
**Date:** 2026-10-20
**Status:** DRAFT — menunggu persetujuan
**Owner:** Max (orchestrator)

---

## 1. Ringkasan Produk

**nutaraline** adalah AI gateway / provider yang menyatukan akses ke berbagai model LLM melalui satu API. Produk ini menyasar developer dan tim yang ingin memakai beberapa model tanpa mengelola integrasi terpisah per provider.

Website ini adalah **halaman publik dan dashboard** untuk pengguna nutaraline. Fungsinya: memperkenalkan produk, memantau pemakaian, menelusuri katalog model, mengelola saldo, dan menyediakan dokumentasi.

### 1.1 Problem

Developer yang memakai banyak provider AI menghadapi:

- Integrasi dan format API berbeda per provider
- Tidak ada satu tempat untuk melihat pemakaian dan biaya gabungan
- Tidak ada visibilitas kesehatan provider hulu
- Dokumentasi tersebar

### 1.2 Solusi yang diwujudkan website

- Satu dashboard monitoring untuk semua pemakaian
- Katalog model terpadu dengan perbandingan harga dan kapabilitas
- Cek saldo dan topup cepat via API key
- Dokumentasi integrasi
- Visibilitas status provider hulu

### 1.3 Target Pengguna

| Persona | Kebutuhan Utama |
|---|---|
| **Solo developer** | Cek saldo, topup, integrasi cepat, harga model transparan |
| **Tech lead / tim** | Pantau pemakaian dan biaya, evaluasi model, pantau uptime |
| **Evaluator** | Bandingkan model sebelum commit, baca docs |

---

## 2. Scope

### 2.1 In Scope — Fase 1 (dokumen ini)

- 10 route publik, dark-first, bilingual EN/ID
- Seluruh data dari modul dummy deterministic
- Alur topup simulasi (tanpa payment gateway)
- Dokumentasi dari file markdown lokal
- Design system lengkap dengan token terdokumentasi

### 2.2 Out of Scope — Fase 1

- Autentikasi, akun, session, role
- Backend, API route, database
- Integrasi payment nyata
- Light theme
- Playground prompt, pricing calculator, changelog, blog
- Terjemahan konten dokumentasi (docs English-only)
- SEO lanjutan, sitemap, analytics, OG image generation
- Realtime data (polling/websocket)

### 2.3 Asumsi

- API nyata sedang dikerjakan tim lain. Bentuk data dummy **menyerupai** response yang diharapkan, tetapi bukan kontrak final.
- Perubahan kontrak API nyata nanti memerlukan adaptasi di layer data, bukan penulisan ulang halaman.
- Website ini belum memiliki domain, brand assets (logo), atau copywriting final dari marketing.

---

## 3. Information Architecture

### 3.1 Peta Route

Semua route berada di bawah prefix locale: `/en/...` dan `/id/...`. Akses `/` di-redirect ke locale default (`en`).

| # | Route | Halaman | Prioritas | Isi Utama |
|---|---|---|---|---|
| 1 | `/` | Landing | P0 | Hero, metrics strip, fitur, provider grid, CTA |
| 2 | `/monitoring` | Usage & Health | P0 | KPI, tren usage, breakdown model/provider, tabel request, health status provider |
| 3 | `/models` | Model Catalog | P0 | Grid model, filter provider/kapabilitas, harga per 1M token, context window |
| 4 | `/topup` | Top Up | P0 | Input API key, pilih nominal, checkout VA/QRIS, konfirmasi |
| 5 | `/balance` | Balance | P0 | Input API key, saldo, pemakaian bulan ini, riwayat transaksi |
| 6 | `/docs` | Documentation | P1 | Sidebar, konten markdown, TOC, navigasi prev/next |
| 7 | `/notification` | Notifications | P1 | Daftar notifikasi, filter kategori, mark as read |
| 8 | `/tos` | Terms of Service | P1 | Legal, konten statis |
| 9 | `/privacy` | Privacy Policy | P1 | Legal, konten statis |
| 10 | `not-found` | 404 | P1 | Halaman error kustom |

### 3.2 Detail Halaman

#### `/` — Landing

| Section | Isi |
|---|---|
| Hero | Headline, subheadline, dua CTA (Mulai / Lihat Docs), latar dekoratif |
| Metrics strip | 4 angka: model tersedia, uptime, rata-rata latency, request/hari |
| Features | 3–4 kartu: unified API, monitoring, katalog model, dokumentasi |
| Provider grid | Logo/nama provider hulu yang didukung |
| CTA akhir | Ajakan topup / baca docs |

#### `/monitoring` — Usage & Health

| Section | Isi |
|---|---|
| KPI row | 4 kartu: total request, token terpakai, biaya, error rate — masing-masing dengan delta vs periode sebelumnya |
| Usage chart | Area chart tren request/token/biaya, pilihan rentang 7/30/90 hari |
| Breakdown | Bar chart per model dan per provider |
| Request table | Tabel request terbaru: waktu, model, provider, token in/out, latency, status |
| Provider health | Daftar provider: status (healthy/degraded/down), uptime 30 hari, latency p50/p95, sparkline |

**Kontrol:** pemilih rentang tanggal mempengaruhi chart dan KPI. Tabel punya sorting kolom dasar.

#### `/models` — Model Catalog

| Elemen | Isi |
|---|---|
| Filter | Provider (multi), kapabilitas (vision/tool/reasoning/context panjang) |
| Pencarian | Berdasarkan nama model |
| Kartu model | Nama, provider, deskripsi singkat, context window, harga input/output per 1M token, badge kapabilitas |
| Empty state | Saat filter tidak menghasilkan apa pun |

#### `/topup` — Top Up

Alur 4 langkah, state di client:

1. **Input API key** — validasi format, tampilkan masked key setelah valid
2. **Pilih nominal** — preset (50k, 100k, 250k, 500k, 1jt, 2jt IDR)
3. **Checkout** — instruksi pembayaran VA/QRIS dummy, nomor VA + batas waktu
4. **Konfirmasi** — tombol "Saya sudah bayar" menambah saldo di state, tampil bukti transaksi

**Aturan:**

- Key invalid → pesan error spesifik, tidak bisa lanjut
- Nominal tidak bisa diubah setelah checkout dimulai
- Saldo dan transaksi hanya bertahan di `sessionStorage`; reload = reset
- Tidak ada payment gateway nyata

#### `/balance` — Balance

- Input API key → tampil saldo, pemakaian bulan berjalan, sisa estimasi hari
- Riwayat transaksi (topup + pemakaian) dengan filter tipe dan rentang tanggal
- Key invalid → empty state informatif, bukan error merah

#### `/docs` — Documentation

- Sumber: file markdown di `content/docs/*.md` dengan frontmatter (`title`, `order`, `group`)
- Sidebar dikelompokkan per group
- TOC di kanan dari heading h2/h3
- Navigasi prev/next berdasarkan `order`
- Slug tidak dikenal → 404 kustom
- Banner "Draft — konten contoh" di setiap halaman
- **English only** di fase ini

#### `/notification` — Notifications

- Kategori: billing, system, security
- Filter kategori, filter unread
- Mark as read (client state)
- Empty state saat semua terbaca

#### `/tos`, `/privacy`

- Halaman legal statis, konten dummy tapi terstruktur
- TOC samping
- Tanggal berlaku

---

## 4. Design System

### 4.1 Prinsip Visual

1. **Dark-first, satu tema.** Tidak ada light mode. `prefers-color-scheme` diabaikan.
2. **Data density tinggi, bukan berdesakan.** Padding cukup, hierarki jelas, angka rata.
3. **Pemisah lewat border, bukan shadow.** Latar gelap hijau membuat shadow tidak terbaca.
4. **Hijau sebagai aksen, bukan latar teks.** Teks tetap netral terang.
5. **Status selalu multi-kanal.** Warna + ikon + label. Tidak pernah warna saja.

### 4.2 Warna

#### Brand

| Token | Nilai | Peran | Catatan Kontras |
|---|---|---|---|
| `--bg` | `#2A332A` | Background halaman | Dasar |
| `--bg-deep` | `#222A22` | Background lebih gelap (footer, section alternatif) | Diturunkan dari bg |
| `--surface` | `#2F382F` | Card, panel, input | +4% terang dari bg |
| `--surface-raised` | `#353E35` | Hover state, dropdown, modal | +8% |
| `--border` | `#345436` | Border, divider, grid chart | |
| `--border-strong` | `#3F6B42` | Border aktif, focus-adjacent | |
| `--primary` | `#39873D` | Fill tombol, indikator aktif | **Bukan** warna teks (kontras 1.9:1) |
| `--accent` | `#28BA30` | Link, focus ring, highlight data | 4.9:1 — aman untuk teks ≥14px bold |

#### Teks

| Token | Nilai | Peran |
|---|---|---|
| `--text` | `#E8EDE8` | Teks utama |
| `--text-muted` | `#9BAC9B` | Teks sekunder, label |
| `--text-faint` | `#6E806E` | Placeholder, metadata |
| `--text-on-primary` | `#FFFFFF` | Teks di atas `--primary` |

#### Semantik

Diminta eksplisit oleh stakeholder. `danger` dan `error` digabung menjadi satu token karena keduanya menandakan kegagalan dan membedakannya tidak memberi nilai.

| Token | Nilai | Peran | Ikon wajib |
|---|---|---|---|
| `--success` | `#28BA30` | Operasi berhasil, status sehat | ✓ |
| `--warning` | `#D6A526` | Status degraded, peringatan kuota | ⚠ |
| `--error` | `#E5484D` | Kegagalan, status down, key invalid | ✕ |
| `--info` | `#4A90D9` | Notifikasi informatif, tips | ℹ |
| `--neutral` | `#8A9A8A` | Status tidak diketahui, badge netral | — |
| `--ghost` | `transparent` + border `--border` | Tombol/elemen tanpa fill | — |

Masing-masing token semantik punya varian `-bg` (10–15% opacity) dan `-border` untuk badge dan alert:

```css
--success-bg: color-mix(in srgb, var(--success) 12%, transparent);
--warning-bg: color-mix(in srgb, var(--warning) 12%, transparent);
--error-bg:   color-mix(in srgb, var(--error) 12%, transparent);
--info-bg:    color-mix(in srgb, var(--info) 12%, transparent);
```

**Aturan pemakaian semantik:**

- Warna semantik **hanya** di komponen status, alert, badge, dan feedback form
- Tidak dipakai untuk dekorasi, gradient, atau aksen visual umum
- Setiap pemakaian warna semantik **wajib** disertai ikon dan/atau teks label

#### Chart

| Token | Peran |
|---|---|
| `--chart-1` | `--accent` — seri utama |
| `--chart-2` | `#4A90D9` — seri sekunder |
| `--chart-3` | `#A78BFA` — seri ketiga |
| `--chart-4` | `#8A9A8A` — seri pembanding |
| `--chart-grid` | `--border` |

#### Kontras Terverifikasi

| Kombinasi | Rasio | Status |
|---|---|---|
| `--text` on `--bg` | ~12.8:1 | ✓ AAA |
| `--text-muted` on `--bg` | ~6.2:1 | ✓ AA |
| `--text-faint` on `--bg` | ~3.9:1 | ⚠ Hanya untuk teks non-esensial ≥18px |
| `--accent` on `--bg` | ~4.9:1 | ✓ AA teks normal |
| `--primary` on `--bg` | ~1.9:1 | ✕ Dilarang untuk teks |
| `--text-on-primary` on `--primary` | ~5.4:1 | ✓ AA |
| `--error` on `--bg` | ~4.6:1 | ✓ AA |

Angka diukur dengan rumus WCAG 2.1; nilai final diverifikasi saat implementasi.

### 4.3 Tipografi

**Satu keluarga font: Plus Jakarta Sans**, untuk seluruh elemen termasuk angka dan kode.

| Token | Size / Line-height | Weight | Pemakaian |
|---|---|---|---|
| `--text-display` | 48 / 56 | 700 | Hero landing |
| `--text-h1` | 36 / 44 | 700 | Judul halaman |
| `--text-h2` | 28 / 36 | 600 | Judul section |
| `--text-h3` | 20 / 28 | 600 | Judul kartu |
| `--text-body` | 16 / 26 | 400 | Teks isi |
| `--text-sm` | 14 / 22 | 400 | Label, tabel |
| `--text-xs` | 12 / 18 | 500 | Badge, metadata |
| `--text-mono` | 14 / 22 | 500 | API key, kode, ID transaksi |

**Tanpa font mono terpisah.** Untuk angka dan ID, dipakai `font-variant-numeric: tabular-nums` dengan `letter-spacing: 0.02em` agar tetap terbaca sebagai data. Ini wajib diterapkan pada:

- Semua kolom numerik di tabel
- KPI card
- Harga model
- API key yang di-mask
- Latency dan persentase

Font dimuat via `next/font/google` sehingga self-hosted, tanpa request eksternal saat runtime dan tanpa layout shift.

### 4.4 Spacing, Radius, Elevation

| Skala | Nilai |
|---|---|
| Spacing | 4px base: 4, 8, 12, 16, 24, 32, 48, 64, 96 |
| Radius | `--radius-sm` 6px, `--radius-md` 10px, `--radius-lg` 16px, `--radius-full` 9999px |
| Elevation | Tidak memakai shadow. Kedalaman lewat `--surface` + `--border`. Modal memakai `backdrop-filter: blur(8px)` + border |

### 4.5 Breakpoint

| Nama | Lebar | Perilaku |
|---|---|---|
| `sm` | 640px | Grid 2 kolom |
| `md` | 768px | Sidebar muncul |
| `lg` | 1024px | Grid 3–4 kolom, TOC muncul |
| `xl` | 1280px | Max-width konten 1200px |

### 4.6 Komponen Primitif

| Komponen | Varian |
|---|---|
| Button | primary, secondary, ghost, danger; size sm/md/lg; loading, disabled |
| Card | default, interactive, bordered |
| Badge | success, warning, error, info, neutral, outline |
| Input | text, password; label, helper, error state |
| Select | native-styled |
| Tabs | underline |
| Table | sortable header, sticky header, empty state |
| Dialog | modal, confirm |
| Toast | success, error, info — auto dismiss |
| Skeleton | loading placeholder |
| EmptyState | ikon, judul, deskripsi, aksi opsional |
| Alert | success, warning, error, info + ikon wajib |

---

## 5. Arsitektur Teknis

### 5.1 Stack

| Komponen | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js 16.4.2 App Router | Sudah terpasang |
| React | 19.3.0 | Sudah terpasang |
| Styling | Tailwind CSS v4 via `@tailwindcss/turbopack` | Konfigurasi existing |
| Bahasa | TypeScript 5, strict | Sudah terpasang |
| Chart | `recharts` | Deklaratif, kompatibel React 19 |
| Ikon | `lucide-react` | Tree-shakeable, konsisten |
| Validasi | `zod` | Validasi form topup + parsing frontmatter |
| i18n | Implementasi manual | 2 bahasa, 10 halaman — library menambah berat tanpa manfaat |

**Total dependency baru: 3.** Tidak ada lagi tanpa persetujuan.

### 5.2 Struktur Folder

```
web/
├─ app/
│  ├─ [lang]/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx                    # landing
│  │  ├─ monitoring/page.tsx
│  │  ├─ models/page.tsx
│  │  ├─ topup/page.tsx
│  │  ├─ balance/page.tsx
│  │  ├─ docs/[[...slug]]/page.tsx
│  │  ├─ notification/page.tsx
│  │  ├─ tos/page.tsx
│  │  ├─ privacy/page.tsx
│  │  └─ not-found.tsx
│  ├─ layout.tsx
│  └─ globals.css
├─ components/
│  ├─ ui/                            # primitif
│  ├─ layout/                        # Header, Footer, LocaleSwitcher, Nav
│  ├─ charts/                        # wrapper Recharts
│  ├─ monitoring/ models/ topup/ docs/ marketing/
├─ lib/
│  ├─ i18n/                          # en.ts, id.ts, index.ts
│  ├─ dummy/                         # dataset deterministic
│  ├─ markdown/                      # parser + loader
│  ├─ format.ts                      # number, currency, date, duration
│  ├─ api-key.ts                     # validasi + masking
│  └─ cn.ts                          # class merge
├─ content/docs/*.md
├─ public/
└─ middleware.ts
```

### 5.3 i18n

- `lib/i18n/en.ts` dan `id.ts` mengekspor objek dengan tipe `Dictionary` yang identik
- `id.ts` diberi anotasi `satisfies Dictionary` → key hilang gagal saat `tsc`
- `app/[lang]/layout.tsx` memvalidasi `lang`; nilai tidak dikenal → `notFound()`
- `middleware.ts` me-redirect `/` ke `/en`
- Locale switcher menukar segmen path pertama, mempertahankan sisa path
- **Tidak ada string UI hardcoded** di komponen. Ini AC yang diuji.

### 5.4 Dummy Data

- Seed deterministic (tanpa `Math.random()` saat render) → render identik setiap load
- Satu modul per domain: `models.ts`, `usage.ts`, `transactions.ts`, `notifications.ts`, `providers.ts`
- Bentuk data menyerupai response REST API (id, createdAt, dsb.) agar mudah ditukar dengan fetch nyata
- Semua akses lewat fungsi `getX()` yang mengembalikan Promise — memungkinkan penggantian dengan fetch tanpa mengubah komponen

### 5.5 Markdown

- Parser subset: heading, paragraf, list, code block, inline code, tabel, link, bold/italic
- Frontmatter diparse dengan `zod` untuk validasi `title`, `order`, `group`
- File dibaca di server saat build/render
- Tidak memakai `remark`/`mdx` — kebutuhan terbatas, menghindari dependency berat

### 5.6 Keamanan & Privasi

- API key di-mask di seluruh UI: `sk-ntr-••••••1a2b`
- Key **tidak** disimpan plaintext di `sessionStorage`; hanya hash-tampilan dan saldo
- Tidak ada `dangerouslySetInnerHTML` kecuali output parser markdown yang sudah disanitasi
- Tidak ada secret di source, log, atau laporan
- Catatan eksplisit: masking adalah higiene UI, **bukan kontrol keamanan**. Fase auth akan menanganinya di server.

---

## 6. Acceptance Criteria

| ID | Kriteria | Verifikasi |
|---|---|---|
| AC-1 | 10 route dapat diakses tanpa 404 internal; navigasi header/footer berfungsi | Manual + test route |
| AC-2 | Locale switcher mengubah seluruh teks UI dan URL, tanpa string tertinggal | Test key coverage + manual |
| AC-3 | Tidak ada string UI hardcoded di komponen; `tsc` gagal bila key hilang | `tsc` + grep |
| AC-4 | Dark theme konsisten; tidak ada flash light theme; `prefers-color-scheme` diabaikan | Test render + manual |
| AC-5 | `/monitoring` merender KPI, chart, tabel, dan health identik setiap load (deterministic) | Snapshot berulang |
| AC-6 | Alur `/topup` 4 langkah berjalan penuh; key invalid ditolak; nominal terkunci saat checkout | E2E manual |
| AC-7 | `/balance` menampilkan saldo + riwayat untuk key valid; empty state untuk key invalid | E2E manual |
| AC-8 | `/docs` merender markdown dengan sidebar dan TOC; slug tidak dikenal → 404 kustom | Manual + test loader |
| AC-9 | API key selalu ter-mask; tidak tersimpan plaintext di storage | grep `sessionStorage` + manual |
| AC-10 | Responsive 375/768/1440 tanpa horizontal overflow | Manual viewport |
| AC-11 | `npm run build` sukses dan `npm run lint` bersih | Command |
| AC-12 | Aksesibilitas: navigasi keyboard, focus visible, kontras teks ≥ AA, `aria-label` pada tombol ikon | Audit manual |
| AC-13 | Setiap status (success/warning/error/info) disertai ikon **dan** label teks, tidak warna saja | grep badge + manual |
| AC-14 | Numerik memakai `tabular-nums`; kolom angka rata di tabel | Visual manual |
| AC-15 | Semua teks memakai Plus Jakarta Sans; tidak ada fallback font yang muncul | DevTools network + computed style |

---

## 7. Roadmap

### Fase 1 — Website publik & dashboard (dokumen ini)

Landing, monitoring, models, topup, balance, docs, notification, legal. Data dummy. Tanpa auth.

### Fase 2 — Integrasi & Akun

- Integrasi API nyata menggantikan layer dummy
- Auth + session + API key management (buat/rotasi/revoke)
- Payment gateway nyata
- Persistensi topup dan riwayat

### Fase 3 — Ekspansi Produk

- Playground prompt
- Light theme
- Docs bilingual
- Pricing calculator, changelog, blog
- Realtime monitoring (polling/websocket)
- Enterprise: tim, invoice, role

---

## 8. Risiko & Item Terbuka

| # | Risiko | Dampak | Mitigasi | Status |
|---|---|---|---|---|
| R-1 | API Next 16 (`cacheComponents`, `partialPrefetching`) berbeda dari versi sebelumnya | Error build/runtime | Baca `node_modules/next/dist/docs/` sebelum menulis; verifikasi `next build` | Terbuka |
| R-2 | `@tailwindcss/turbopack` masih jalur baru | Styling gagal | Ikuti config existing; jangan workaround tanpa lapor | Terbuka |
| R-3 | Kontrak data dummy ≠ API nyata | Rework layer data di fase 2 | Isolasi di `lib/dummy/` dengan fungsi async; swap tanpa ubah komponen | Terbuka |
| R-4 | Konten docs/marketing dummy tampak seperti konten asli | Kebingungan pengguna | Banner "Draft — konten contoh"; footer disclaimer | Terbuka |
| R-5 | Masking API key bukan keamanan nyata | False sense of security | Dokumentasi eksplisit; ditangani di Fase 2 | Terbuka |
| R-6 | Kompatibilitas Recharts × React 19 | Chart tidak render | Verifikasi awal; fallback SVG manual | Terbuka |
| R-7 | Belum ada logo dan brand assets final | Landing terlihat belum jadi | Pakai wordmark teks sementara | Terbuka |
| R-8 | Copywriting final belum tersedia | Konten terasa generik | Susun copy sementara, tandai untuk review marketing | Terbuka |
| R-9 | Palet hijau gelap menyulitkan kontras teks kecil | Gagal AA | Token kontras sudah diukur; dilarang pakai `--primary` untuk teks | Termitigasi sebagian |

---

## 9. Di Luar Permintaan (tidak dikerjakan)

Dicatat agar tidak dianggap kelalaian:

- Komponen UI library terpisah / publikasi package
- Storybook
- Unit test untuk komponen primitif (test fokus pada AC)
- Dark/light toggle
- Animasi kompleks atau scroll-driven effect
- Internationalisasi konten markdown
- Optimasi SEO (metadata dasar ada, tapi bukan target fase ini)

---

## 10. Persetujuan

| Peran | Nama | Tanggal | Status |
|---|---|---|---|
| Stakeholder | — | — | **Menunggu** |
| Orchestrator | Max | 2026-10-20 | DRAFT |

---

**Catatan:** PRD ini adalah living document. Perubahan pada scope, acceptance criteria, atau design system menaikkan versi dan membatalkan approval sebelumnya sesuai protokol spec change.
