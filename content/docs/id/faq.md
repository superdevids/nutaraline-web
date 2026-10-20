---
title: FAQ
description: Jawaban ringkas untuk pertanyaan yang paling sering diajukan tentang gateway Nutaraline.
group: Panduan
groupOrder: 2
order: 2
toc: "false"
updated: "2026-10-20"
---

Pertanyaan yang paling sering diajukan seputar gateway Nutaraline. Jika jawaban yang Anda cari tidak ada di sini, lanjutkan ke [Pendahuluan](/docs/introduction) atau [Autentikasi](/docs/authentication).

## FAQ

### Bagaimana cara mendapatkan kunci API?

Buat akun, buka halaman **Saldo**, lalu periksa kunci API milik Anda. Kunci baru langsung aktif dan dapat dipakai untuk semua endpoint.

### Apa bentuk kunci API Nutaraline?

Setiap kunci berawalan `sk-ntr-` diikuti 29 karakter heksadesimal (0-9, a-f). Karakter terakhir adalah digit checksum: jika satu digit salah ketik atau hilang, kunci langsung ditolak sebelum menyentuh server.

### Bagaimana cara mengirim kunci API?

Sertakan kunci pada header `Authorization` dengan skema Bearer:

```bash
curl https://api.nutaraline.co.uk/v1/models \
  -H "Authorization: Bearer sk-ntr-cafebabe00000000000000000000b"
```

Kredensial pada query string sengaja tidak didukung.

### Model apa saja yang tersedia?

Daftar lengkap — beserta harga input/output per satu juta token, panjang konteks, dan kapabilitas — ada di halaman **Model**. Anda juga bisa mengambilnya secara programatis melalui endpoint `/v1/models`.

### Bagaimana cara memantau pemakaian dan biaya?

Halaman **Monitoring** merangkum indikator utama, tren permintaan, dan pemakaian per model. Detail per kunci ada di halaman **Saldo**: riwayat pemanggilan, pemakaian bulan berjalan, dan saldo tersisa.

### Apakah ada indikator realtime?

Ya. Indikator utama di Monitoring dan pool token di halaman Model diperbarui berkala melalui koneksi realtime (WebSocket), sehingga angka yang terlihat adalah kondisi berjalan, bukan snapshot basi.

### Apa yang terjadi saat pool token unlimited habis?

Pengguna berlanjut tanpa interupsi: model dengan pool yang habis otomatis menggunakan saldo utama Anda. Pool direset pukul 00.00 UTC+7 Asia/Jakarta.

### Dari mana Bonus Token Harian berasal?

Setiap hari Anda menerima kuota gratis: bonus per model (misal 20M untuk Deepseek V4.1 Flash) dan bonus gabungan 50M yang menanggung seluruh pemakaian model pilihan. Semuanya direset pukul 00.00 UTC+7 Asia/Jakarta.

### Apakah ada batas laju (rate limit)?

Ada kuota laju per kunci. Saat melewati batas, gateway mengembalikan `429` beserta header `Retry-After`; jeda sebelum mencoba lagi menghormati nilai tersebut.

### Bagaimana penanganan galat dan pengulangan?

Semua galat memakai format terstandar dengan kode yang dapat diperiksa (lihat halaman [Galat](/docs/errors)). Permintaan yang aman untuk diulang diproses idempoten, dan galat sementara dari penyedia hulu otomatis dicoba ulang atau dialihkan (failover) sebelum sampai ke Anda.

### Apakah streaming didukung?

Ya. Kirim `"stream": true` pada permintaan chat completions dan gateway akan meneruskan server-sent events dari penyedia hulu tanpa mengubah formatnya.

### Bisakah SDK OpenAI dipakai langsung?

Bisa. Karena format permintaan dan respons mengikuti konvensi OpenAI, cukup arahkan `base_url` SDK ke endpoint Nutaraline dan ganti kunci API — tanpa perubahan kode lain.

### Bagaimana cara mengisi saldo?

Buka halaman **Isi Saldo**, pilih nominal atau masukkan jumlah sendiri, lalu selesaikan pembayaran melalui Virtual Account. Saldo masuk otomatis setelah pembayaran terkonfirmasi, dan faktur dapat diunduh.

### Metode pembayaran apa yang didukung?

Virtual Account dan QRIS. Status pembayaran diverifikasi otomatis — cukup tekan "Saya sudah membayar" setelah transfer, dan kunci serta faktur tersaji di langkah terakhir.

### Apakah saldo kedaluwarsa?

Tidak. Saldo terpakai sampai habis. Paket unlimited memiliki durasi berlangganan tersendiri yang terlihat pada ringkasan akun di halaman Saldo.

### Apakah data percakapan saya digunakan untuk melatih model?

Tidak. Dasbor hanya mencatat metadata pemakaian — jumlah token, latensi, dan status — bukan isi permintaan maupun respons Anda.

### Bisakah kunci API dipasang langsung di browser atau aplikasi klien?

Jangan. Kunci yang berada di sisi klien dapat dibaca siapa saja; selalu panggil gateway dari backend Anda sendiri, lalu bentangkan hasilnya ke aplikasi klien.

### Bagaimana rotasi kunci dilakukan dengan aman?

Buat kunci pengganti, terapkan pada layanan, amati satu siklus penuh, lalu cabut kunci lama (lihat [Autentikasi](/docs/authentication)). Saldo melekat pada kunci — pindahkan sisa saldo sebelum pencabutan.

### Apa yang terjadi saat kunci dicabut?

Pencabutan berlaku seketika. Permintaan yang sedang berjalan tetap diselesaikan, permintaan baru langsung ditolak, dan sisa saldo tidak hangus — pindahkan saja ke kunci pengganti.
