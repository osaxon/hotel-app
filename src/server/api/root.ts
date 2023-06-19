import { roomsRouter } from "./routers/rooms";
import { reservationsRouter } from "./routers/reservations";
import { posRouter } from "./routers/pos";
import { guestsRouter } from "./routers/guests";
import { createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  rooms: roomsRouter,
  reservations: reservationsRouter,
  pos: posRouter,
  guests: guestsRouter,
  markAsPaid: posRouter.markAsPaid,
});

// export type definition of API
export type AppRouter = typeof appRouter;
