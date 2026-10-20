---
title: Galat
description: Taksonomi galat, semantik pengulangan, dan cara menangani kegagalan sebagian.
group: Referensi API
groupOrder: 3
order: 3
updated: "2026-10-20"
---

> **Draf** — Konten contoh untuk versi demonstrasi.

Seluruh galat menggunakan satu amplop yang sama:

```json
{
  "error": {
    "type": "invalid_request_error",
    "code": "missing_model",
    "message": "Kolom 'model' wajib diisi.",
    "request_id": "req_01HX"
  }
}
```

Selalu catat `request_id`. Hanya dengan penanda inilah dukungan dapat melacak permintaan tertentu.

## Jenis galat

| Jenis | HTTP | Dapat diulang |
|---|---|---|
| `invalid_request_error` | 400 | Tidak |
| `authentication_error` | 401 | Tidak |
| `insufficient_balance` | 402 | Tidak — isi saldo terlebih dahulu |
| `not_found_error` | 404 | Tidak |
| `rate_limit_exceeded` | 429 | Ya, dengan jeda bertingkat |
| `upstream_error` | 502 | Ya |
| `timeout_error` | 504 | Ya |
| `internal_error` | 500 | Kadang-kadang |

## Strategi pengulangan

Ulangi hanya pada 429, 502, 504, dan 500. Gunakan jeda eksponensial dengan jitter:

```text
jeda = min(batas, dasar * 2^percobaan) * (0.5 + acak())
```

`dasar` yang disarankan adalah 500 ms, `batas` 20 detik, dan `percobaan` maksimum 4.

> **Peringatan** — Jangan mengulang `402`. Kunci tidak memiliki saldo; pengulangan hanya menghabiskan waktu tanpa mengubah hasil.

## Kegagalan sebagian pada streaming

Completion yang panjang dapat gagal di tengah streaming. Klien menerima beberapa potongan, kemudian event galat. Tidak ada mekanisme melanjutkan otomatis: teks sebagian menjadi tanggung jawab Anda, namun token yang telah dihasilkan oleh model tetap ditagihkan.

## Perilaku failover

Ketika penyedia hulu mengalami penurunan layanan, gateway dapat mengulang ke penyedia lain yang menyediakan keluarga model yang sama. Failover dilewati apabila:

- Permintaan menggunakan parameter khusus penyedia
- Model hanya memiliki satu deployment
- Pemanggil menonaktifkan failover

## Idempotensi

`POST /v1/chat/completions` tidak bersifat idempoten. Apabila terjadi timeout setelah model mulai menghasilkan, pengulangan akan menagihkan completion kedua. Sertakan header `Idempotency-Key` apabila biaya tersebut perlu dihindari.

