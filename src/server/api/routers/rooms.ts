import { clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import {
  createTRPCRouter,
  publicProcedure,
  privateProcedure,
} from "@/server/api/trpc";
import { env } from "@/env.mjs";
import DataURIParser from "datauri/parser";
import { Reservation, Room, RoomType } from "@prisma/client";

interface CustomParams {
  folder: string;
  allowed_formats: string[];
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUD_NAME,
  api_key: env.CLOUD_API_KEY,
  api_secret: env.CLOUD_API_SECRET,
  secure: true,
});

// Create a storage engine for Multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "hotel_admin", // Specify the folder where the images will be uploaded
    resource_type: "auto",
    allowed_formats: ["jpg", "jpeg", "png"], // Specify the allowed image formats
  } as unknown as CustomParams,
});

// Create the Multer middleware
const upload = multer({ storage });

const parser = new DataURIParser();

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
