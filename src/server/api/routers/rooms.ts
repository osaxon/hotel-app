import { clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  privateProcedure,
} from "@/server/api/trpc";

import type { Reservation, Room } from "@prisma/client";

// Create a new ratelimiter, that allows 3 requests per 1 min
// const ratelimit = new Ratelimit({
//   redis: Redis.fromEnv(),
//   limiter: Ratelimit.slidingWindow(3, "1 m"),
//   analytics: true,
// });

export const roomsRouter = createTRPCRouter({
  // get all posts for feed
  getAll: publicProcedure.query(async ({ ctx }) => {
    const rooms = await ctx.prisma.room.findMany({
      take: 100,
      include: {
        reservations: true,
      },
    });
    console.log(rooms.length);
    return rooms;
  }),

  // create new room
  createRoom: publicProcedure
    .input(
      z.object({
        roomNumber: z.string(),
        roomName: z.string(),
        roomType: z.string(),
        capcity: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      //   const { success } = await ratelimit.limit("test");
      //   if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const room = await ctx.prisma.room.create({
        data: {
          roomNumber: input.roomNumber,
          capacity: 2,
        },
      });

      return room;
    }),
});
