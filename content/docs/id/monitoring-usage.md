---
title: Memantau Pemakaian
description: Membaca dasbor dengan benar, memahami atribusi biaya, dan menetapkan ambang batas yang berguna.
group: Panduan
groupOrder: 2
order: 1
updated: "2026-10-20"
---

> **Draf** — Konten contoh untuk versi demonstrasi.

Halaman pemantauan menjawab tiga pertanyaan: seberapa besar pemakaian Anda, berapa biayanya, dan apakah ada gangguan pada penyedia hulu.

## Membaca indikator utama

| Indikator | Definisi | Perhatikan |
|---|---|---|
| Permintaan | Panggilan yang mencapai penyedia | Penurunan mendadak umumnya menandakan galat pada sisi klien |
| Token | Token masukan dan keluaran yang ditagihkan | Porsi keluaran jauh lebih menentukan biaya dibanding masukan |
| Biaya | Tagihan tarif daftar pada rentang terpilih | Bandingkan dengan hari yang sama pada minggu sebelumnya |
| Tingkat galat | Kegagalan dibagi total permintaan | Tidak termasuk pengulangan yang akhirnya berhasil |

Setiap indikator menampilkan selisih terhadap jendela waktu sebelumnya dengan durasi yang sama. Tampilan 30 hari dibandingkan dengan 30 hari sebelumnya, bukan dengan bulan Agustus.

## Penyebab biaya berubah

Sebagian besar lonjakan biaya berasal dari salah satu kondisi berikut:

1. **System prompt yang semakin panjang.** System prompt yang panjang ditagihkan pada setiap permintaan. Manfaatkan cache apabila didukung.
2. **Beban kerja yang berat pada keluaran.** Token keluaran umumnya berbiaya tiga hingga lima kali token masukan. Model yang bertele-tele menjadi mahal.
3. **Banjir pengulangan.** Klien yang mengulang pada galat yang tidak dapat diulang akan melipatgandakan biaya tanpa hasil baru.
4. **Perpindahan model.** Sebuah beban kerja beralih ke model yang lebih besar tanpa disadari.

## Menetapkan ambang batas

Tetapkan peringatan saldo pada kisaran dua minggu ketahanan dengan laju pemakaian saat ini. Kehabisan saldo di tengah bulan lebih merugikan dibandingkan menerima surel peringatan.

> **Saran** — Perkiraan ketahanan dihitung dari pengeluaran tujuh hari terakhir. Lonjakan pekerjaan batch akan membuat perkiraan menjadi terlalu pesimistis.

## Kesehatan penyedia

Status kesehatan mencerminkan pemeriksaan sintetis ditambah tingkat galat trafik nyata pada jendela bergulir.

- **Normal** — latensi dan tingkat galat dalam batas wajar
- **Menurun** — latensi atau tingkat galat meningkat, memenuhi syarat failover
- **Gangguan** — pemeriksaan gagal secara konsisten

Grafik percikan menampilkan 24 sampel terakhir. Penyedia yang telah pulih tetap menampilkan penurunan pada grafik — grafik tersebut merekam riwayat, bukan status saat ini.

## Batasan atribusi

Pemakaian diatribusikan pada kunci API yang mengirim permintaan. Pada versi ini belum tersedia atribusi per pengguna akhir. Apabila diperlukan, sisipkan dimensi tersebut sendiri dan lakukan agregasi pada sisi klien.

