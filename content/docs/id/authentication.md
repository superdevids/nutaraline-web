---
title: Autentikasi
description: Format kunci API, cara pengirimannya, rotasi, dan pencabutannya.
group: Memulai
groupOrder: 1
order: 3
updated: "2026-10-20"
---

> **Draf** — Konten contoh untuk versi demonstrasi.

## Format kunci

Setiap kunci Nutaraline memiliki bentuk yang tetap:

```text
sk-ntr-<29 karakter heksadesimal, 0-9/a-f>
```

Awalan tersebut menandai kunci sebagai kredensial gateway, sehingga pemindai rahasia dapat mengenalinya apabila terjadi kebocoran.

## Pengiriman

Sertakan kunci pada header `Authorization` untuk setiap permintaan:

```bash
curl https://api.nutaraline.co.uk/v1/models \
  -H "Authorization: Bearer sk-ntr-cafebabe00000000000000000000b"
```

Jangan pernah mengirim kunci melalui query string. Query string tercatat pada log proksi, riwayat peramban, dan header referrer.

### Catatan mengenai autentikasi melalui query string

Sebagian penyedia menerima `?api_key=`. Kami tidak menerapkannya. Permintaan dengan kredensial pada query string ditolak dengan `invalid_request_error`, terlepas dari valid atau tidaknya kunci tersebut.

## Penyimpanan

| Lingkungan | Penyimpanan yang disarankan |
|---|---|
| Pengembangan lokal | `.env.local`, dikecualikan dari kontrol versi |
| Integrasi berkelanjutan | Penyimpanan rahasia terenkripsi |
| Runtime server | Variabel lingkungan atau secret manager |
| Peramban | Tidak pernah |

Apabila sebuah kunci perlu dijalankan di peramban, hentikan pendekatan tersebut — teruskan permintaan melalui backend Anda sendiri.

## Rotasi

Lakukan rotasi kunci secara berkala, dan segera setelah terdapat dugaan kebocoran.

1. Buat kunci pengganti.
2. Terapkan kunci baru pada layanan Anda.
3. Amati trafik pada kunci baru selama satu siklus deployment penuh.
4. Cabut kunci lama.

Pencabutan berlaku seketika. Permintaan yang telah terautentikasi dan sedang berjalan tetap diselesaikan; permintaan baru akan gagal.

## Saldo melekat pada kunci

Kunci bukan sekadar kredensial — kunci memiliki saldo. Pengisian saldo pada sebuah kunci hanya menambah saldo kunci tersebut.

> **Peringatan** — Pencabutan kunci tidak mengembalikan saldo yang tersisa. Pindahkan atau gunakan saldo terlebih dahulu sebelum melakukan rotasi apabila nilai saldo tersebut penting.

## Respons galat

| Status | Kode | Kondisi |
|---|---|---|
| 401 | `authentication_error` | Kunci tidak ada, format salah, atau telah dicabut |
| 402 | `insufficient_balance` | Kunci terautentikasi namun tidak memiliki saldo |
| 429 | `rate_limit_exceeded` | Kuota untuk jendela waktu saat ini telah habis |

