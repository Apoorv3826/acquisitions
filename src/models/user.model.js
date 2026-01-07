import { pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('user'),

  created_at: timestamp('created_at', { withTimezone: true })
    .default(sql`now()`)
    .notNull(),

  updated_at: timestamp('updated_at', { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
});
