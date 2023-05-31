import { exampleRouter } from "@/server/api/routers/example";
import { roomsRouter } from "./routers/rooms";
import { reservationsRouter } from "./routers/reservations";
import { createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  rooms: roomsRouter,
  reservations: reservationsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
