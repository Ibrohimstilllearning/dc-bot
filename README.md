# NoFap Streak Bot

Bot Discord buat streak nofap bareng teman, dengan sistem penalti bertingkat dan trigger report.

## Fitur

- `/streak` — lihat streak kamu saat ini
- `/relapse` — lapor relapse (penalti: relapse ke-1 = -3 hari, ke-2 = -12 hari total, ke-3 = reset total)
- `/trigger [catatan]` — lapor kalau lagi kena godaan, notif ke channel & role bantuan
- `/leaderboard` — ranking streak semua member di server
- `/rules` — tampilkan peraturan server
- `/setup` — (admin) atur channel, role, welcome message, & rules

Data disimpan lokal pakai SQLite (`nofap.db`), jadi nggak butuh database eksternal.

## 1. Buat Bot di Discord Developer Portal

1. Buka https://discord.com/developers/applications, klik **New Application**, kasih nama.
2. Masuk ke tab **Bot** (sidebar kiri) > klik **Reset Token** > copy token-nya. Ini isi `DISCORD_TOKEN`.
3. Masih di tab **Bot**, aktifkan **Server Members Intent** (wajib untuk pesan welcome).
4. Ke tab **General Information**, copy **Application ID**. Ini isi `CLIENT_ID`.
5. Ke tab **OAuth2 > URL Generator**: centang scope `bot` dan `applications.commands`. Di Bot Permissions centang `Send Messages`, `Embed Links`, `Mention Everyone` (buat mention role bantuan), `Use Slash Commands`, dan `Manage Roles` (wajib untuk fitur Rules Gate).
6. Copy link yang muncul di bawah, buka di browser, pilih server kamu, klik Authorize.

## 2. Setup Project

```bash
cd nofap-bot
npm install
cp .env.example .env
```

Isi `.env` dengan `DISCORD_TOKEN`, `CLIENT_ID`, dan opsional `GUILD_ID` (Server ID kamu, biar command langsung muncul pas testing — klik kanan nama server di Discord, perlu Developer Mode aktif dulu di Settings > Advanced).

## 3. Daftarkan Slash Command & Jalankan

```bash
npm run deploy
npm start
```

Kalau `GUILD_ID` diisi, command langsung muncul di server itu. Kalau kosong, command didaftarkan global (bisa butuh sampai 1 jam buat muncul, tapi jalan di semua server yang invite bot ini).

## 4. Setelah Online

Di server Discord kamu, jalankan (sebagai admin):

```
/setup channel:#trigger-alert role:@Accountability welcome_channel:#welcome rules_channel:#rules verified_role:@Verified
```

Ini bikin `/trigger` otomatis kirim ke channel itu dan mention role tersebut, mengirim pesan sambutan otomatis ke `#welcome`, dan command `/rules` terarah ke `#rules`. Selain itu, tombol "✅ Saya Setuju" di pesan rules akan otomatis memberikan role `@Verified`.

## 5. Langkah Manual Admin (Setup Rules Gate)

Fitur penguncian channel (Rules Gate) wajib diselesaikan dari pengaturan Discord:

1. **Buat role "Verified"**: Server Settings > Roles > Create Role, kasih nama "Verified". **PENTING**: Posisinya di list Roles HARUS di bawah role bot kamu (drag posisinya). Kalau posisi role bot lebih rendah, bot akan gagal memberikan role tersebut.
2. **Kunci tiap channel selain #welcome dan #rules**: klik kanan channel (misal `#general`) > Edit Channel > Permissions > klik `@everyone` > set "View Channel" ke **Deny** (silang merah).
3. **Buka akses buat role Verified**: masih di channel yang sama > Permissions > Add role "Verified" > set "View Channel" ke **Allow** (centang hijau).
4. **Ulangi langkah 2-3 untuk semua channel** yang mau dikunci (voice channel, dll) — KECUALI `#welcome` dan `#rules`, biarkan tetap kebuka default buat `@everyone`.
5. **Test**: minta teman join, cek dia cuma bisa lihat `#welcome` dan `#rules`. Klik "✅ Saya Setuju" di `#rules`, channel lain langsung kebuka.

## 6. Deploy ke Hosting Gratis 24/7

Supaya bot tetap online walau laptop kamu mati, upload project ini ke hosting bot Discord gratis (contoh: panel.fps.ms atau bot-hosting.net):

1. Daftar akun di hosting pilihan kamu.
2. Upload semua file di folder ini (**kecuali** `node_modules/` dan `.env` — jangan pernah upload token secara publik).
3. Di panel hosting, isi Environment Variables dengan isi `.env` kamu (`DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID`).
4. Set start command: `npm install && npm run deploy && npm start`
5. Jalankan/Start bot dari panel. Bot akan online 24/7 walau laptop kamu mati.

## Catatan

- Rekor terpanjang (`longestStreak`) otomatis tersimpan tiap kali relapse dicatat, jadi nggak hilang walau streak reset.
- Kalau mau ubah angka penalti (-3/-9) atau threshold reset (3x), edit fungsi `penaltyFor()` dan logika di `reportRelapse()` di file `db.js`.
