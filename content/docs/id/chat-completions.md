---
title: Chat Completions
description: Endpoint utama. Format pesan, parameter sampling, pemanggilan alat, dan streaming.
group: Referensi API
groupOrder: 3
order: 1
updated: "2026-10-20"
---

> **Draf** — Konten contoh untuk versi demonstrasi.

```http
POST /v1/chat/completions
```

## Isi permintaan

| Kolom | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `model` | string | ya | Slug model dari katalog |
| `messages` | array | ya | Riwayat percakapan, terlama lebih dahulu |
| `stream` | boolean | tidak | Bawaan `false` |
| `temperature` | number | tidak | 0–2, bawaan 1 |
| `top_p` | number | tidak | 0–1 |
| `max_tokens` | integer | tidak | Dibatasi oleh keluaran maksimum model |
| `tools` | array | tidak | Definisi fungsi |
| `tool_choice` | string \| object | tidak | `auto`, `none`, atau nama alat tertentu |
| `response_format` | object | tidak | `{"type":"json_object"}` pada model yang mendukung |

## Pesan

Setiap pesan memiliki `role` dan `content`. Isi pesan dapat berupa string atau larik blok.

```json
{
  "role": "user",
  "content": [
    { "type": "text", "text": "Apa isi gambar ini?" },
    { "type": "image_url", "image_url": { "url": "https://example.com/chart.png" } }
  ]
}
```

### Peran yang didukung

- `system` — instruksi yang berlaku untuk seluruh percakapan
- `user` — masukan dari pengguna akhir
- `assistant` — keluaran model sebelumnya, termasuk pemanggilan alat
- `tool` — hasil dari pemanggilan alat

## Parameter sampling

`temperature` dan `top_p` saling memengaruhi. Ubah salah satu, bukan keduanya. Pola yang umum digunakan:

```json
{ "temperature": 0.2 }
```

untuk ekstraksi dan klasifikasi, serta nilai bawaan untuk penggunaan percakapan.

## Pemanggilan alat

Definisikan alat, kemudian tangani pemanggilannya:

```json
{
  "tools": [{
    "type": "function",
    "function": {
      "name": "get_weather",
      "description": "Cuaca terkini untuk sebuah kota",
      "parameters": {
        "type": "object",
        "properties": { "city": { "type": "string" } },
        "required": ["city"]
      }
    }
  }]
}
```

Apabila model mengembalikan `finish_reason: "tool_calls"`, jalankan fungsi tersebut pada sisi Anda dan kirimkan hasilnya kembali dalam pesan dengan `role: "tool"`.

## Streaming

Dengan `stream: true`, respons berupa rangkaian baris `data:` yang diakhiri oleh `data: [DONE]`. Lakukan penguraian secara inkremental — jangan menunggu seluruh isi respons.

### Galat di tengah streaming

Galat yang terjadi setelah potongan pertama diterima akan dikirim sebagai event berisi objek `error`, bukan sebagai status HTTP. Pengurai Anda wajib menanganinya.

## Bentuk respons

```json
{
  "id": "chatcmpl_01HX",
  "object": "chat.completion",
  "created": 1761000000,
  "model": "claude-3-5-sonnet",
  "choices": [
    { "index": 0, "message": { "role": "assistant", "content": "..." }, "finish_reason": "stop" }
  ],
  "usage": {
    "prompt_tokens": 120,
    "completion_tokens": 340,
    "total_tokens": 460
  }
}
```

## Alasan berhenti

| Nilai | Makna |
|---|---|
| `stop` | Pesan selesai secara alami |
| `length` | Mencapai batas `max_tokens` |
| `tool_calls` | Model meminta alat dijalankan |
| `content_filter` | Diblokir oleh kebijakan keamanan penyedia |

