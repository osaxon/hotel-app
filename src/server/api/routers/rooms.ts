import { clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  privateProcedure,
} from "@/server/api/trpc";

import type { Reservation, Room, RoomType } from "@prisma/client";

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
      include: {
        reservations: true,
        roomType: true,
        images: true,
      },
    });
    if (!rooms) throw new TRPCError({ code: "NOT_FOUND" });
    console.log(rooms);
    return rooms;
  }),

  getAvailable: publicProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const rooms = await ctx.prisma.room.findMany({
        include: {
          roomType: true,
          reservations: {
            where: {
              checkIn: { lte: input.endDate },
              checkOut: { gte: input.startDate },
            },
          },
        },
      });

      const availableRooms = rooms.map((room) => ({
        ...room,
        isAvailable: room.reservations.length === 0,
      }));

      return availableRooms;
    }),

  getRoomTypes: publicProcedure.query(async ({ ctx }) => {
    const types = await ctx.prisma.roomType.findMany();
    return types;
  }),

  // create new room
  createRoom: publicProcedure
    .input(
      z.object({
        roomNumber: z.string(),
        roomName: z.string(),
        roomTypeId: z.string(),
        capacity: z.number(),
        images: z.array(
          z.object({
            fileUrl: z.string(),
            fileKey: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.prisma.room.create({
        data: {
          roomNumber: input.roomNumber,
          roomName: input.roomName,
          capacity: input.capacity,
          roomType: {
            connect: {
              id: input.roomTypeId,
            },
          },
          images: {
            createMany: {
              data: input.images,
            },
          },
        },
      });
      return room;
    }),
});
