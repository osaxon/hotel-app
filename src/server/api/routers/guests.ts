import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";

export const guestsRouter = createTRPCRouter({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const guests = await ctx.prisma.guest.findMany({
      include: {
        reservations: {
          include: {
            room: true,
          },
        },
      },
    });
    return guests;
  }),
});
