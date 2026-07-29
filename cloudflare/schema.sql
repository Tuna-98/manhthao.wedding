-- Bảng lưu lời chúc (Sổ lưu bút)
CREATE TABLE IF NOT EXISTS wishes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT    NOT NULL,
  fullname   TEXT    NOT NULL,
  comment    TEXT    NOT NULL,
  approved   INTEGER NOT NULL DEFAULT 1,   -- 1 = hiện luôn, 0 = chờ duyệt
  created_at TEXT    NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_wishes_slug ON wishes (slug, approved, id DESC);

-- Bảng lưu xác nhận tham dự
CREATE TABLE IF NOT EXISTS rsvp (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  slug             TEXT    NOT NULL,
  guest_name       TEXT    NOT NULL,
  will_attend      INTEGER NOT NULL,
  event_type       TEXT,
  event_name       TEXT,
  message          TEXT,
  number_of_guests INTEGER NOT NULL DEFAULT 1,
  payload          TEXT,                    -- toàn bộ dữ liệu gốc dạng JSON
  created_at       TEXT    NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rsvp_slug ON rsvp (slug, id DESC);
