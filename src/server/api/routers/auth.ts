import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import clerkClient from "@clerk/clerk-sdk-node";
import { env } from "@/env.mjs";

export const authRouter = createTRPCRouter({
  isUserAdmin: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await clerkClient.users.getUser(input.id);

      // Get list of admin members
      const members =
        await clerkClient.organizations.getOrganizationMembershipList({
          organizationId: env.CLERK_ADMIN_ORG,
        });

      const filteredMembers = members.map((mem) => {
        return {
          id: mem.publicUserData?.userId,
          name: mem.publicUserData?.firstName,
        };
      });

      const isAdmin = filteredMembers.some(
        (member) => member.id === ctx.userId
      );

      return isAdmin;
    }),
});
