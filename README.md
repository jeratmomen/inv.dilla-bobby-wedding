# Source Undangan Dilla & Bobby

Paket mandiri untuk GitHub + Cloudflare Workers (bukan Pages statis). Source lengkap, 3 foto pengguna, font, ilustrasi, Muara yang telah dipotong 13 detik, cerita lengkap, dashboard, RSVP, dan migrasi SQL disertakan. Node.js 22.13+ diperlukan.

## 1. GitHub
Ekstrak ZIP. Upload ISI folder ini ke root repository GitHub, sehingga package.json dan wrangler.jsonc langsung berada di root. Jangan upload ZIP sebagai satu file. Pilih repository private bila source dan foto tidak ingin terlihat umum. node_modules, kredensial, dan database aktif tidak disertakan.

## 2. Cloudflare database
Di komputer, buka terminal dalam folder source:

```sh
npm ci
npx wrangler login
npx wrangler d1 create dilla-bobby-wedding
```
Salin database_id hasil perintah ke wrangler.jsonc menggantikan UUID nol. Binding harus tetap DB. Terapkan tabel:

```sh
npx wrangler d1 migrations apply DB --remote
```
Alternatif: buat D1 lewat dashboard Cloudflare dan jalankan SQL dari drizzle/0000_black_nightmare.sql di D1 Console. Database baru dimulai kosong; tamu dan RSVP dari hosting lama tidak otomatis berpindah. Ekspor daftar tamu lama dahulu dari dashboard jika sudah diisi.

## 3. Deploy Worker
Ubah SITE_ORIGIN pada wrangler.jsonc menjadi alamat Worker milikmu (tanpa slash akhir). Ini digunakan untuk membuat link tamu. Lalu:

```sh
npm run build
npm run deploy
npx wrangler secret put OWNER_USERNAME
npx wrangler secret put OWNER_PASSWORD
```
Isi username ASCII, misalnya bobby, dan password panjang acak. Secrets juga bisa ditambahkan pada Worker > Settings > Variables and Secrets. Jangan tulis password di GitHub. Sebelum secrets diisi, dashboard sengaja tertutup; undangan publik tetap dapat dibuka.

Buka /owner. Browser akan meminta username/password melalui dialog login. Login ini menggantikan login ChatGPT dan kode aktivasi pada hosting lama. Browser dapat mengingat login Basic; untuk keluar tutup semua jendela sesi browser atau gunakan jendela privat untuk pengelolaan owner. Semua API owner juga memeriksa password; header identitas ChatGPT tidak digunakan.

## 4. Hubungkan GitHub untuk deploy berikutnya
Pada Cloudflare Workers & Pages, sambungkan repository melalui Workers Builds. Root directory: root repo; Build command: npm run build; Deploy command: npx wrangler deploy. Pakai Node 22.13+ (misalnya 22.16.0). Pastikan nama Worker sama dengan name pada wrangler.jsonc, database sudah dimigrasi, dan secrets owner sudah disimpan. Commit perubahan konfigurasi ke GitHub. Setelah itu setiap push dapat membangun versi baru.

## 5. Pemakaian
/ adalah undangan. /owner untuk tambah tamu dan buat link, pantau RSVP, salin CSV/TSV untuk spreadsheet. Google Sheets belum tersinkron otomatis; tidak ada integrasi Google yang disertakan. Nama tamu muncul dari parameter to, dan id menghubungkannya ke RSVP.

## File penting
- app/hand-invitation.tsx: isi dan interaksi undangan, cerita lengkap.
- app/handdrawn.css: desain, font, animasi.
- app/invitation-assets.ts dan public/: foto, ilustrasi, font, musik.
- app/owner/ dan app/api/: dashboard dan API.
- lib/server.ts dan worker/index.ts: autentikasi owner, database, link.
- wrangler.jsonc: nama Worker, database, alamat website.

Source paket ini disesuaikan khusus Cloudflare tanpa mengubah website ChatGPT yang sedang aktif. Build lokal diverifikasi; deployment ke akun Cloudflare milikmu belum dilakukan. Source tidak mencakup isi database produksi atau secret hosting lama.

Referensi konfigurasi resmi: https://developers.cloudflare.com/workers/wrangler/configuration/
D1: https://developers.cloudflare.com/workers/wrangler/commands/d1/
