import { serial, text, pgTable, timestamp, integer, boolean, pgEnum, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enum definitions for PostgreSQL
export const userRoleEnum = pgEnum('user_role', ['puskesmas', 'admin']);
export const attendanceStatusEnum = pgEnum('attendance_status', ['hadir', 'izin', 'sakit', 'cuti', 'alpa']);

// Puskesmas table
export const puskesmasTable = pgTable('puskesmas', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address'),
  phone: text('phone'),
  head_name: text('head_name'), // Nama Kepala Puskesmas
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull(),
  puskesmas_id: integer('puskesmas_id').references(() => puskesmasTable.id),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Employees table
export const employeesTable = pgTable('employees', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  nip: text('nip'), // Nomor Induk Pegawai
  position: text('position'),
  puskesmas_id: integer('puskesmas_id').notNull().references(() => puskesmasTable.id),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Attendance table
export const attendanceTable = pgTable('attendance', {
  id: serial('id').primaryKey(),
  employee_id: integer('employee_id').notNull().references(() => employeesTable.id),
  date: date('date').notNull(),
  clock_in: text('clock_in'), // Store as HH:mm format
  clock_out: text('clock_out'), // Store as HH:mm format
  status: attendanceStatusEnum('status').notNull(),
  notes: text('notes'), // Keterangan
  created_by: integer('created_by').notNull().references(() => usersTable.id),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const puskesmasRelations = relations(puskesmasTable, ({ many }) => ({
  users: many(usersTable),
  employees: many(employeesTable),
}));

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  puskesmas: one(puskesmasTable, {
    fields: [usersTable.puskesmas_id],
    references: [puskesmasTable.id],
  }),
  created_attendances: many(attendanceTable, { relationName: 'created_by_relation' }),
}));

export const employeesRelations = relations(employeesTable, ({ one, many }) => ({
  puskesmas: one(puskesmasTable, {
    fields: [employeesTable.puskesmas_id],
    references: [puskesmasTable.id],
  }),
  attendances: many(attendanceTable),
}));

export const attendanceRelations = relations(attendanceTable, ({ one }) => ({
  employee: one(employeesTable, {
    fields: [attendanceTable.employee_id],
    references: [employeesTable.id],
  }),
  created_by_user: one(usersTable, {
    fields: [attendanceTable.created_by],
    references: [usersTable.id],
    relationName: 'created_by_relation',
  }),
}));

// TypeScript types for the table schemas
export type Puskesmas = typeof puskesmasTable.$inferSelect;
export type NewPuskesmas = typeof puskesmasTable.$inferInsert;

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

export type Employee = typeof employeesTable.$inferSelect;
export type NewEmployee = typeof employeesTable.$inferInsert;

export type Attendance = typeof attendanceTable.$inferSelect;
export type NewAttendance = typeof attendanceTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = {
  puskesmas: puskesmasTable,
  users: usersTable,
  employees: employeesTable,
  attendance: attendanceTable,
};