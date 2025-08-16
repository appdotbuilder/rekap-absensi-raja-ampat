import { z } from 'zod';

// Enum definitions
export const userRoleEnum = z.enum(['puskesmas', 'admin']);
export const attendanceStatusEnum = z.enum(['hadir', 'izin', 'sakit', 'cuti', 'alpa']);

// User schema
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  password_hash: z.string(),
  role: userRoleEnum,
  puskesmas_id: z.number().nullable(), // Only for puskesmas users
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Puskesmas schema
export const puskesmasSchema = z.object({
  id: z.number(),
  name: z.string(),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  head_name: z.string().nullable(), // Nama Kepala Puskesmas
  created_at: z.coerce.date()
});

export type Puskesmas = z.infer<typeof puskesmasSchema>;

// Employee schema
export const employeeSchema = z.object({
  id: z.number(),
  name: z.string(),
  nip: z.string().nullable(), // Nomor Induk Pegawai
  position: z.string().nullable(),
  puskesmas_id: z.number(),
  is_active: z.boolean(),
  created_at: z.coerce.date()
});

export type Employee = z.infer<typeof employeeSchema>;

// Attendance schema
export const attendanceSchema = z.object({
  id: z.number(),
  employee_id: z.number(),
  date: z.coerce.date(),
  clock_in: z.string().nullable(), // Format HH:mm
  clock_out: z.string().nullable(), // Format HH:mm
  status: attendanceStatusEnum,
  notes: z.string().nullable(), // Keterangan
  created_by: z.number(), // User ID who created this record
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Attendance = z.infer<typeof attendanceSchema>;

// Input schemas for authentication
export const loginInputSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

export type LoginInput = z.infer<typeof loginInputSchema>;

// Input schemas for creating users
export const createUserInputSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6),
  role: userRoleEnum,
  puskesmas_id: z.number().nullable()
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

// Input schemas for creating puskesmas
export const createPuskesmasInputSchema = z.object({
  name: z.string().min(1),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  head_name: z.string().nullable()
});

export type CreatePuskesmasInput = z.infer<typeof createPuskesmasInputSchema>;

// Input schemas for creating employees
export const createEmployeeInputSchema = z.object({
  name: z.string().min(1),
  nip: z.string().nullable(),
  position: z.string().nullable(),
  puskesmas_id: z.number(),
  is_active: z.boolean().default(true)
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeInputSchema>;

// Input schemas for attendance
export const createAttendanceInputSchema = z.object({
  employee_id: z.number(),
  date: z.coerce.date(),
  clock_in: z.string().nullable(),
  clock_out: z.string().nullable(),
  status: attendanceStatusEnum,
  notes: z.string().nullable()
});

export type CreateAttendanceInput = z.infer<typeof createAttendanceInputSchema>;

export const updateAttendanceInputSchema = z.object({
  id: z.number(),
  clock_in: z.string().nullable().optional(),
  clock_out: z.string().nullable().optional(),
  status: attendanceStatusEnum.optional(),
  notes: z.string().nullable().optional()
});

export type UpdateAttendanceInput = z.infer<typeof updateAttendanceInputSchema>;

// Query schemas
export const getAttendanceByDateInputSchema = z.object({
  puskesmas_id: z.number().optional(),
  date: z.coerce.date(),
  employee_id: z.number().optional()
});

export type GetAttendanceByDateInput = z.infer<typeof getAttendanceByDateInputSchema>;

export const getAttendanceReportInputSchema = z.object({
  puskesmas_id: z.number().optional(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  sort_by: z.enum(['date', 'completion_time']).default('date')
});

export type GetAttendanceReportInput = z.infer<typeof getAttendanceReportInputSchema>;

// Response schemas with relations
export const employeeWithPuskesmasSchema = employeeSchema.extend({
  puskesmas: puskesmasSchema
});

export type EmployeeWithPuskesmas = z.infer<typeof employeeWithPuskesmasSchema>;

export const attendanceWithRelationsSchema = attendanceSchema.extend({
  employee: employeeSchema,
  puskesmas: puskesmasSchema,
  created_by_user: userSchema
});

export type AttendanceWithRelations = z.infer<typeof attendanceWithRelationsSchema>;

export const attendanceReportSchema = z.object({
  puskesmas: puskesmasSchema,
  attendances: z.array(attendanceWithRelationsSchema),
  report_date: z.coerce.date(),
  completion_time: z.coerce.date().nullable()
});

export type AttendanceReport = z.infer<typeof attendanceReportSchema>;