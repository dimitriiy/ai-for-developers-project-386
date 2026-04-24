import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

export type AppDatabase = Database<sqlite3.Database, sqlite3.Statement>;

export const initDb = async (): Promise<AppDatabase> => {
  const db = await open({
    filename: ':memory:',
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS event_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      duration INTEGER NOT NULL CHECK(duration > 0)
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      event_type_id TEXT NOT NULL REFERENCES event_types(id),
      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_bookings_time ON bookings(start_time, end_time);
  `);

  return db;
};
