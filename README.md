# nutaraline Web

Dashboard web untuk gateway AI **nutaraline** — satu kunci API untuk mengakses banyak model, dengan pemantauan pemakaian, katalog model, top up saldo, dan dokumentasi dalam satu tempat.

Dibangun dengan Next.js 16 (App Router, Turbopack), React 19, TypeScript, dan Tailwind CSS v4.

---

## Daftar isi

- [Fitur](#fitur)
- [Stack](#stack)
- [Mulai cepat](#mulai-cepat)
- [Konfigurasi environment](#konfigurasi-environment)
- [Struktur proyek](#struktur-proyek)
- [Route](#route)
- [Internasionalisasi](#internasionalisasi)
- [Pemakaian data](#pemakaian-data)
- [Skrip](#skrip)
- [Kualitas kode](#kualitas-kode)
- [Desain & tema](#desain--tema)
- [Dokumentasi tambahan](#dokumentasi-tambahan)

---

## Fitur

- **Monitoring realtime** — total sepanjang waktu, metrik langsung, tren pemakaian, peringkat model, log permintaan, dan status koneksi WebSocket.
- **Katalog model** — filter per penyedia dan kapabilitas, harga per 1 juta token, jendela konteks, pemakaian token pool.
- **Top up & saldo** — alur pembelian dengan QRIS, pelacakan saldo per kunci API, dan riwayat transaksi.
- **Dokumentasi** — konten Markdown dengan sidebar, table of contents, pencarian, dan navigasi antar-halaman.
- **Notifikasi** — daftar per kategori, status baca yang persisten, dan pengelompokan relatif waktu.
- **Dua bahasa** — Bahasa Indonesia (default) dan Inggris, tanpa prefix locale di URL.
- **Tema gelap** — satu palet hijau konsisten, kontras terjaga, dan menghormati `prefers-reduced-motion`.

## Stack

| Lapisan | Pilihan |
|---|---|
| Framework | Next.js 16.4.2 (App Router, Turbopack, Cache Components) |
| UI | React 19.3, Tailwind CSS v4, `lucide-react` |
| Grafik | Recharts 3 |
| Validasi | Zod 4 |
| Test | Vitest 5, Testing Library, happy-dom |
| Lint & tipe | ESLint 9 (`eslint-config-next`), TypeScript 5 |

## Mulai cepat

Prasyarat: Node.js versi saat ini (LTS terbaru) dan npm.

```bash
git clone https://github.com/superdevids/nutaraline-web.git
cd nutaraline-web
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
npm run dev
```

Buka <http://localhost:3000>. Karena aplikasi membaca `NEXT_PUBLIC_ENV` dari `.env.local`, file itu wajib ada sebelum `npm run dev`.

> Hanya satu instance `npm run dev` yang boleh berjalan. Jika port bentrok atau build `.next` terasa korup, hentikan semua proses Node dev, hapus folder `.next`, lalu jalankan ulang.

## Konfigurasi environment

Salin `.env.example` menjadi `.env.local` lalu sesuaikan. Semua variabel bersifat publik (`NEXT_PUBLIC_*`) karena dibaca di server maupun browser.

| Variabel | Contoh | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.nutaraline.co.uk/v1` | Base URL gateway untuk request HTTP |
| `NEXT_PUBLIC_WS_URL` | `wss://api.nutaraline.co.uk/ws` | Endpoint WebSocket untuk metrik realtime |
| `NEXT_PUBLIC_ENV` | `production` | `development` menampilkan banner/demo, `production` menyembunyikannya |

`NODE_ENV` tidak dipakai untuk gating fitur — gunakan `NEXT_PUBLIC_ENV`. Semua akses `process.env` terpusat di `lib/env.ts`.

## Struktur proyek

```
app/                 Route App Router, layout, dan tema global
  globals.css        Token tema, backdrop, tekstur, keyframes
components/
  layout/            Header, footer, navigasi bawah, panel kontak
  monitoring/        Kartu metrik, grafik, tabel, leaderboard
  models/            Katalog, filter, token pool
  balance/ topup/    Alur saldo dan pembelian
  docs/              Navigasi, TOC, renderer Markdown
  ui/                Primitif: Card, Button, Badge, Table, dekorasi
content/docs/        Konten dokumentasi per locale (en, id)
lib/
  api/               Klien gateway dan WebSocket
  dummy/             Data simulasi dan tipe domain
  i18n/              Kamus, tipe, resolusi locale
  markdown/          Pemuat konten dokumentasi
docs/                PRD dan catatan isu yang diketahui
tests/               Test Vitest untuk lib, komponen, dan i18n
```

## Route

| Route | Isi |
|---|---|
| `/` | Redirect ke `/monitoring` |
| `/monitoring` | KPI, tren pemakaian, peringkat model, log permintaan |
| `/models` | Katalog model dan token pool |
| `/topup` | Alur pembelian saldo dan paket |
| `/balance` | Saldo per kunci API dan riwayat |
| `/docs` | Dokumentasi |
| `/notification` | Pemberitahuan gateway |
| `/tos`, `/privacy` | Halaman legal |
| `/error/[code]` | Halaman error terkode (400, 401, 403, 404, 408, 429, 500, 502, 503) |
| lainnya | Halaman 404 kustom |

## Internasionalisasi

- Locale disimpan di cookie `nutaraline.locale`, **bukan** di URL.
- Kamus berbahasa Indonesia dan Inggris berada di `lib/i18n/id.ts` dan `lib/i18n/en.ts`, dengan tipe bersama di `lib/i18n/types.ts`.
- Paritas kunci antar-bahasa dijaga oleh test (`tests/lib/i18n.test.ts`); menambah kunci di satu bahasa tanpa pasangannya akan gagal build test.
- Baca locale di server lewat `getDictionary()` dari `lib/i18n/server.ts`.

## Pemakaian data

Fase ini berjalan dengan **data simulasi** di `lib/dummy/`. Angka, model, dan transaksi tidak berasal dari gateway sungguhan. Saat mengintegrasikan API nyata:

1. Ganti sumber data di `lib/dummy/` dengan pemanggilan `lib/api/`.
2. Biarkan bentuk tipe di `lib/dummy/types.ts` sebagai kontrak.
3. Atur `NEXT_PUBLIC_ENV=production` agar banner demo tidak tampil.

## Skrip

| Perintah | Kegunaan |
|---|---|
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi |
| `npm run start` | Menjalankan hasil build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Test sekali jalan |
| `npm run test:watch` | Test mode watch |

> Jalankan pemeriksaan secara **berurutan** (`typecheck` → `lint` → `test` → `build`). `next build` menulis ke `.next` dan tidak aman bila dijalankan paralel.

## Kualitas kode

- Typecheck wajib bersih dan lint tanpa galat sebelum commit.
- Test berada di `tests/` dan menutup logika non-visual: format, i18n, validasi kunci API, alur saldo, dan komponen kunci.
- Semua teks antarmuka diambil dari kamus; string hardcode di komponen dihindari.

## Desain & tema

- **Gelap saja**, palet hijau: `--accent #28ba30`, `--primary #39873d`, latar `--bg #0d110d`.
- Font Plus Jakarta Sans.
- Angka memakai pemisah titik dan `tabular-nums`.
- Token warna, radius, dan spacing didefinisikan di `app/globals.css` melalui `@theme`.
- Animasi dimatikan otomatis saat `prefers-reduced-motion: reduce`.

## Dokumentasi tambahan

- [`docs/PRD.md`](docs/PRD.md) — kebutuhan produk, information architecture, dan design system.
- [`docs/known-issues.md`](docs/known-issues.md) — isu yang diketahui beserta temuannya.
