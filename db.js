const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'nofap.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  guildId TEXT NOT NULL,
  userId TEXT NOT NULL,
  username TEXT NOT NULL,
  streakStart INTEGER NOT NULL,
  relapseCount INTEGER NOT NULL DEFAULT 0,
  longestStreak INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (guildId, userId)
);

CREATE TABLE IF NOT EXISTS settings (
  guildId TEXT PRIMARY KEY,
  triggerChannelId TEXT,
  supportRoleId TEXT,
  welcomeChannelId TEXT,
  rulesChannelId TEXT,
  verifiedRoleId TEXT
);
`);

const settingsColumns = db.prepare("PRAGMA table_info(settings)").all().map(c => c.name);
if (!settingsColumns.includes('welcomeChannelId')) {
  db.exec('ALTER TABLE settings ADD COLUMN welcomeChannelId TEXT');
}
if (!settingsColumns.includes('rulesChannelId')) {
  db.exec('ALTER TABLE settings ADD COLUMN rulesChannelId TEXT');
}
if (!settingsColumns.includes('verifiedRoleId')) {
  db.exec('ALTER TABLE settings ADD COLUMN verifiedRoleId TEXT');
}


const DAY_MS = 24 * 60 * 60 * 1000;

// Penalti kumulatif sesuai desain: relapse ke-1 = -3 hari, relapse ke-2 = total -12 hari (3+9).
// Relapse ke-3 memicu reset total (ditangani terpisah di reportRelapse).
function penaltyFor(relapseCount) {
  if (relapseCount >= 2) return 12;
  if (relapseCount === 1) return 3;
  return 0;
}

function daysSince(timestampMs) {
  return Math.floor((Date.now() - timestampMs) / DAY_MS);
}

function ensureUser(guildId, userId, username) {
  const existing = db
    .prepare('SELECT * FROM users WHERE guildId = ? AND userId = ?')
    .get(guildId, userId);
  if (existing) {
    if (existing.username !== username) {
      db.prepare('UPDATE users SET username = ? WHERE guildId = ? AND userId = ?').run(
        username,
        guildId,
        userId
      );
    }
    return { ...existing, username };
  }
  const streakStart = Date.now();
  db.prepare(
    'INSERT INTO users (guildId, userId, username, streakStart, relapseCount, longestStreak) VALUES (?, ?, ?, ?, 0, 0)'
  ).run(guildId, userId, username, streakStart);
  return {
    guildId,
    userId,
    username,
    streakStart,
    relapseCount: 0,
    longestStreak: 0,
  };
}

function currentStreakDays(user) {
  const raw = daysSince(user.streakStart) - penaltyFor(user.relapseCount);
  return Math.max(0, raw);
}

function statusEmoji(streak) {
  if (streak >= 90) return '🏆 90+ hari';
  if (streak >= 60) return '💎 60+ hari';
  if (streak >= 30) return '🔥 30+ hari';
  if (streak >= 21) return '🧡 21+ hari';
  if (streak >= 14) return '💛 14+ hari';
  if (streak >= 7) return '💚 7+ hari';
  return '🌱 Mulai lagi';
}

// Lapor relapse. Mengembalikan { reset: boolean, relapseCount, currentStreak }
function reportRelapse(guildId, userId, username) {
  const user = ensureUser(guildId, userId, username);
  const streakBeforeReset = currentStreakDays(user);
  const newLongest = Math.max(user.longestStreak, streakBeforeReset);
  const newCount = user.relapseCount + 1;

  if (newCount >= 3) {
    // Relapse ke-3: reset total, mulai run baru dari nol.
    db.prepare(
      'UPDATE users SET streakStart = ?, relapseCount = 0, longestStreak = ? WHERE guildId = ? AND userId = ?'
    ).run(Date.now(), newLongest, guildId, userId);
    return { reset: true, relapseCount: 0, currentStreak: 0, longestStreak: newLongest };
  }

  db.prepare(
    'UPDATE users SET relapseCount = ?, longestStreak = ? WHERE guildId = ? AND userId = ?'
  ).run(newCount, newLongest, guildId, userId);
  const updated = { ...user, relapseCount: newCount };
  return {
    reset: false,
    relapseCount: newCount,
    currentStreak: currentStreakDays(updated),
    longestStreak: newLongest,
  };
}

function getLeaderboard(guildId) {
  const users = db.prepare('SELECT * FROM users WHERE guildId = ?').all(guildId);
  return users
    .map((u) => ({
      username: u.username,
      currentStreak: currentStreakDays(u),
      longestStreak: Math.max(u.longestStreak, currentStreakDays(u)),
      relapseCount: u.relapseCount,
    }))
    .sort((a, b) => b.currentStreak - a.currentStreak);
}

function getSettings(guildId) {
  return db.prepare('SELECT * FROM settings WHERE guildId = ?').get(guildId);
}

function setSettings(guildId, { triggerChannelId, supportRoleId, welcomeChannelId, rulesChannelId, verifiedRoleId }) {
  const existing = getSettings(guildId);
  if (existing) {
    db.prepare(
      'UPDATE settings SET triggerChannelId = COALESCE(?, triggerChannelId), supportRoleId = COALESCE(?, supportRoleId), welcomeChannelId = COALESCE(?, welcomeChannelId), rulesChannelId = COALESCE(?, rulesChannelId), verifiedRoleId = COALESCE(?, verifiedRoleId) WHERE guildId = ?'
    ).run(triggerChannelId ?? null, supportRoleId ?? null, welcomeChannelId ?? null, rulesChannelId ?? null, verifiedRoleId ?? null, guildId);
  } else {
    db.prepare(
      'INSERT INTO settings (guildId, triggerChannelId, supportRoleId, welcomeChannelId, rulesChannelId, verifiedRoleId) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(guildId, triggerChannelId ?? null, supportRoleId ?? null, welcomeChannelId ?? null, rulesChannelId ?? null, verifiedRoleId ?? null);
  }
}

module.exports = {
  ensureUser,
  currentStreakDays,
  statusEmoji,
  reportRelapse,
  getLeaderboard,
  getSettings,
  setSettings,
};
