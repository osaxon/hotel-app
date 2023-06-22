import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "@/server/api/root";
import { prisma } from "@/server/db";
import superjson from "superjson";

export const generateSSGHelper = (userId: string) =>
  createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId },
    transformer: superjson, // optional - adds superjson serialization
  });
