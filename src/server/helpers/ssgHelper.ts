import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "@/server/api/root";
import { prisma, xprisma } from "@/server/db";
import superjson from "superjson";

export const generateSSGHelper = (userId: string) =>
  createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId, xprisma },
    transformer: superjson, // optional - adds superjson serialization
  });
