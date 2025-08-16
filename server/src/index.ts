import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import { 
  loginInputSchema,
  createUserInputSchema,
  createPuskesmasInputSchema,
  createEmployeeInputSchema,
  createAttendanceInputSchema,
  updateAttendanceInputSchema,
  getAttendanceByDateInputSchema,
  getAttendanceReportInputSchema
} from './schema';

// Import handlers
import { login, getCurrentUser } from './handlers/auth';
import { createUser, getAllUsers, getUserById } from './handlers/users';
import { createPuskesmas, getAllPuskesmas, getPuskesmasById } from './handlers/puskesmas';
import { createEmployee, getEmployeesByPuskesmas, getAllEmployees, getEmployeeById } from './handlers/employees';
import { 
  createAttendance, 
  updateAttendance, 
  getAttendanceByDate, 
  getAttendanceReport,
  getAttendanceByEmployee,
  getAttendanceByPuskesmas
} from './handlers/attendance';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Authentication
  login: publicProcedure
    .input(loginInputSchema)
    .mutation(({ input }) => login(input)),
  
  getCurrentUser: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(({ input }) => getCurrentUser(input.userId)),

  // User management
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => createUser(input)),
  
  getAllUsers: publicProcedure
    .query(() => getAllUsers()),
  
  getUserById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getUserById(input.id)),

  // Puskesmas management
  createPuskesmas: publicProcedure
    .input(createPuskesmasInputSchema)
    .mutation(({ input }) => createPuskesmas(input)),
  
  getAllPuskesmas: publicProcedure
    .query(() => getAllPuskesmas()),
  
  getPuskesmasById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getPuskesmasById(input.id)),

  // Employee management
  createEmployee: publicProcedure
    .input(createEmployeeInputSchema)
    .mutation(({ input }) => createEmployee(input)),
  
  getEmployeesByPuskesmas: publicProcedure
    .input(z.object({ puskesmasId: z.number() }))
    .query(({ input }) => getEmployeesByPuskesmas(input.puskesmasId)),
  
  getAllEmployees: publicProcedure
    .query(() => getAllEmployees()),
  
  getEmployeeById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getEmployeeById(input.id)),

  // Attendance management
  createAttendance: publicProcedure
    .input(createAttendanceInputSchema.extend({ 
      createdBy: z.number() 
    }))
    .mutation(({ input }) => {
      const { createdBy, ...attendanceInput } = input;
      return createAttendance(attendanceInput, createdBy);
    }),
  
  updateAttendance: publicProcedure
    .input(updateAttendanceInputSchema)
    .mutation(({ input }) => updateAttendance(input)),
  
  getAttendanceByDate: publicProcedure
    .input(getAttendanceByDateInputSchema)
    .query(({ input }) => getAttendanceByDate(input)),
  
  getAttendanceReport: publicProcedure
    .input(getAttendanceReportInputSchema)
    .query(({ input }) => getAttendanceReport(input)),
  
  getAttendanceByEmployee: publicProcedure
    .input(z.object({ 
      employeeId: z.number(),
      startDate: z.coerce.date(),
      endDate: z.coerce.date()
    }))
    .query(({ input }) => getAttendanceByEmployee(input.employeeId, input.startDate, input.endDate)),
  
  getAttendanceByPuskesmas: publicProcedure
    .input(z.object({ 
      puskesmasId: z.number(),
      startDate: z.coerce.date(),
      endDate: z.coerce.date()
    }))
    .query(({ input }) => getAttendanceByPuskesmas(input.puskesmasId, input.startDate, input.endDate)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
  console.log('Raja Ampat Health Office Attendance System API is ready!');
}

start();