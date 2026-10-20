---
title: Pendahuluan
description: Apa itu Nutaraline, bagaimana gateway ini berada di antara aplikasi Anda dan penyedia hulu, serta manfaat yang diperoleh.
group: Memulai
groupOrder: 1
order: 1
updated: "2026-10-20"
---

> **Draf** — Konten contoh untuk versi demonstrasi.

Nutaraline adalah gateway inferensi. Anda mengirim satu format permintaan ke satu endpoint, lalu kami meneruskannya ke penyedia hulu, menormalkan respons, dan mencatat pemakaian pada kunci API Anda.

## Mengapa memerlukan gateway

Memanggil penyedia secara langsung berarti merawat integrasi terpisah untuk setiap vendor: header autentikasi berbeda, bentuk payload berbeda, format streaming berbeda, dan taksonomi galat yang berbeda. Gateway menyatukan seluruh permukaan tersebut.

| Tanpa gateway | Dengan Nutaraline |
|---|---|
| Satu SDK untuk setiap penyedia | Satu kontrak HTTP |
| Retry khusus per penyedia | Retry dan failover ditangani di hulu |
| Pemakaian tersebar di banyak dasbor | Satu catatan keuangan per kunci API |
| Tanpa pembatasan laju terpusat | Kuota dan kendali lonjakan terpusat |

## Siklus hidup permintaan

1. Anda mengirim permintaan ke `https://api.nutaraline.co.uk/v1/chat/completions`.
2. Kami mengautentikasi kunci API dan memeriksa saldo yang melekat padanya.
3. Nama model dipetakan ke penyedia hulu dan deployment terkait.
4. Permintaan diteruskan, baik secara streaming maupun buffered, lalu respons dinormalkan.
5. Jumlah token dan biaya dicatat pada catatan pemakaian.

Apabila penyedia hulu mengembalikan galat yang dapat diulang, gateway mengulang ke penyedia yang sama sebelum mempertimbangkan fallback yang memenuhi syarat.

### Yang dinormalkan

- Peran pesan dan blok konten
- Bentuk pemanggilan alat dan hasil alat
- Objek pemakaian (token masukan, keluaran, dan cache)
- Kode galat serta petunjuk pengulangan

### Yang tidak dinormalkan

Fitur khusus penyedia yang tidak memiliki padanan di tempat lain — misalnya alur unggah berkas milik satu vendor — hanya diteruskan apabila model tujuan mendukungnya. Jika tidak, permintaan ditolak, bukan dibiarkan kehilangan kolom secara diam-diam.

## Base URL

```bash
https://api.nutaraline.co.uk/v1
```

Seluruh endpoint memiliki versi. Perubahan yang merusak kompatibilitas dirilis di bawah awalan versi baru, sementara versi sebelumnya tetap tersedia sekurang-kurangnya enam bulan.

## Langkah berikutnya

- Baca [panduan cepat](/docs/quickstart) untuk mengirim permintaan pertama.
- Lihat [autentikasi](/docs/authentication) untuk penanganan kunci.
- Telusuri model yang tersedia sebelum menentukan model bawaan.

