import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const roomsRouter = createTRPCRouter({
  // get all posts for feed
  getAll: publicProcedure.query(async ({ ctx }) => {
    const rooms = await ctx.prisma.room.findMany({
      include: {
        reservations: true,
        images: true,
      },
    });
    if (!rooms) throw new TRPCError({ code: "NOT_FOUND" });
    console.log(rooms);
    return rooms;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const room = await ctx.prisma.room.findUnique({
        where: {
          id: input.id,
        },
      });
      return room;
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

  getVacanctRooms: publicProcedure.query(async ({ ctx }) => {
    const rooms = await ctx.prisma.room.findMany({
      where: {
        status: "VACANT",
      },
    });
    return rooms;
  }),

  // create new room
  createRoom: publicProcedure
    .input(
      z.object({
        roomNumber: z.string(),
        roomName: z.string(),
        capacity: z.number(),
        image: z.any(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Upload the image to Cloudinary

      const room = await ctx.prisma.room.create({
        data: {
          roomNumber: input.roomNumber,
          roomName: input.roomName,
          capacity: input.capacity,
        },
      });
      return room;
    }),
});
