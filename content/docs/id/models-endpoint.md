---
title: Endpoint Model
description: Daftar seluruh model yang dapat diakses melalui gateway, beserta harga dan kapabilitasnya.
group: Referensi API
groupOrder: 3
order: 2
updated: "2026-10-20"
---

> **Draf** — Konten contoh untuk versi demonstrasi.

```http
GET /v1/models
```

Mengembalikan seluruh model yang dapat diakses oleh kunci API Anda. Respons bersifat berpaginasi.

## Contoh

```bash
curl https://api.nutaraline.co.uk/v1/models \
  -H "Authorization: Bearer sk-ntr-cafebabe00000000000000000000b"
```

```json
{
  "object": "list",
  "data": [
    {
      "id": "gpt-4o-mini",
      "provider": "openai",
      "context_window": 128000,
      "max_output": 16384,
      "pricing": { "input_per_1m": 0.15, "output_per_1m": 0.6, "currency": "USD" },
      "capabilities": ["vision", "tools", "json"],
      "status": "available"
    }
  ],
  "has_more": false
}
```

## Kolom

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | string | Slug yang digunakan sebagai `model` |
| `provider` | string | Vendor hulu |
| `context_window` | integer | Total token masuk dan keluar yang diterima model |
| `max_output` | integer | Batas atas token yang dihasilkan |
| `pricing.input_per_1m` | number | USD per satu juta token masukan |
| `pricing.output_per_1m` | number | USD per satu juta token keluaran |
| `capabilities` | string[] | Penanda fitur |
| `status` | string | `available`, `preview`, atau `deprecated` |

## Nilai kapabilitas

- `vision` — menerima blok gambar
- `tools` — mendukung pemanggilan fungsi
- `reasoning` — menampilkan langkah penalaran
- `long-context` — jendela konteks di atas 200 ribu token
- `json` — menghormati `response_format`

## Penyaringan

```http
GET /v1/models?provider=anthropic&capability=vision
```

Penyaringan digabungkan dengan logika AND. Nilai yang tidak dikenal akan mengembalikan daftar kosong, bukan galat, sehingga kesalahan penulisan tidak merusak antarmuka daftar.

## Catatan mengenai harga

Harga yang ditampilkan merupakan tarif daftar pada saat permintaan dibuat. Penyedia dapat mengubah tarif; gateway menagih sesuai tarif yang berlaku ketika permintaan dilayani, sehingga dapat berbeda dari katalog yang diambil sebelumnya.

