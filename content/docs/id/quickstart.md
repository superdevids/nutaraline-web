---
title: Panduan Cepat
description: Buat kunci API, kirim permintaan pertama, dan baca responsnya dalam waktu kurang dari lima menit.
group: Memulai
groupOrder: 1
order: 2
updated: "2026-10-20"
---

> **Draf** — Konten contoh untuk versi demonstrasi.

Panduan ini membawa Anda dari nol hingga mendapatkan respons chat completion yang berhasil.

## Buat kunci API

Kunci API dibuat pada halaman Saldo. Bentuk kunci adalah sebagai berikut:

```text
sk-ntr-cafebabe00000000000000000000b
```

Perlakukan kunci ini seperti kata sandi. Kunci tersebut merupakan satu-satunya kredensial yang diterima oleh gateway.

> **Catatan** — Kunci di atas merupakan contoh dokumentasi dan tidak akan berhasil diautentikasi.

## Kirim permintaan

```bash
curl https://api.nutaraline.co.uk/v1/chat/completions \
  -H "Authorization: Bearer sk-ntr-cafebabe00000000000000000000b" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      { "role": "user", "content": "Jelaskan basis data vektor dalam dua kalimat." }
    ]
  }'
```

Respons yang berhasil memiliki bentuk sebagai berikut:

```json
{
  "id": "chatcmpl_01HX",
  "model": "gpt-4o-mini",
  "choices": [
    {
      "index": 0,
      "message": { "role": "assistant", "content": "..." },
      "finish_reason": "stop"
    }
  ],
  "usage": { "prompt_tokens": 18, "completion_tokens": 42, "total_tokens": 60 }
}
```

## Lakukan streaming respons

Tambahkan `"stream": true` untuk menerima server-sent events. Setiap event merupakan delta JSON:

| Kolom | Makna |
|---|---|
| `choices[0].delta.content` | Potongan teks baru |
| `choices[0].finish_reason` | Hanya terisi pada potongan terakhir |
| `usage` | Tersedia pada potongan terakhir apabila diaktifkan |

## Periksa biaya

Buka halaman Saldo dan periksa kunci API Anda. Catatan keuangan menampilkan biaya permintaan yang dihitung dari token masukan dan keluaran sesuai tarif model yang dipublikasikan.

```text
masukan  = 18 token × $0,15 / 1J  = $0,0000027
keluaran = 42 token × $0,60 / 1J  = $0,0000252
```

Biaya diakumulasikan sebelum mengurangi saldo, sehingga kesalahan pembulatan pada permintaan tunggal tidak terakumulasi.

## Kesalahan umum pada percobaan pertama

- Mengirim `Authorization` tanpa awalan `Bearer `.
- Menggunakan slug model dari penyedia lain sementara base URL mengarah ke penyedia tersebut.
- Lupa menyertakan `Content-Type: application/json`.
- Menggunakan kembali kunci API yang telah dicabut setelah rotasi.

