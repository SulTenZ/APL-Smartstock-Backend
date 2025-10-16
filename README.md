# APL Shoes Smartstock - Backend

Backend API untuk aplikasi APL Shoes Smartstock, sebuah sistem manajemen inventaris cerdas yang dirancang khusus untuk toko sepatu.

## 📝 Deskripsi

Proyek ini menyediakan serangkaian *endpoint* API untuk mengelola berbagai aspek operasional toko, termasuk manajemen produk, stok, transaksi, pelanggan, dan laporan. Dibangun dengan Node.js, Express, dan Prisma, aplikasi ini menawarkan solusi yang kuat dan terukur untuk mengelola inventaris secara efisien.

## ✨ Fitur Utama

* **Manajemen Produk**: Mengelola data produk, termasuk informasi detail seperti merek, kategori, tipe, harga beli, harga jual, dan gambar.
* **Manajemen Stok**: Melacak stok untuk setiap ukuran produk, dengan fitur peringatan stok rendah dan habis secara otomatis.
* **Manajemen Transaksi**: Mencatat semua transaksi penjualan, menghitung keuntungan per transaksi, dan mengelola item-item dalam setiap transaksi.
* **Manajemen Pelanggan**: Menyimpan dan mengelola data pelanggan untuk keperluan transaksi dan analisis.
* **Laporan dan Analitik**: Menghasilkan laporan keuangan bulanan, melacak keuntungan dari waktu ke waktu, dan menganalisis produk serta merek yang paling menguntungkan.
* **Notifikasi Otomatis**: Mengirimkan notifikasi stok rendah dan stok habis secara otomatis untuk membantu menjaga ketersediaan produk.
* **Log Audit**: Mencatat semua perubahan penting pada data untuk tujuan keamanan dan pelacakan.

## 🛠️ Teknologi yang Digunakan

* **Backend**: Node.js, Express.js
* **Database**: PostgreSQL
* **ORM**: Prisma
* **Autentikasi**: JWT (JSON Web Tokens), Bcrypt
* **Image Upload**: Cloudinary, Multer
* **Notifikasi**: OneSignal
* **Email**: Nodemailer
