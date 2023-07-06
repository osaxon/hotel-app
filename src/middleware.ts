import { redirectToSignIn, authMiddleware, clerkClient } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { env } from "./env.mjs";

async function isAdminCheck(userId: string) {
  const adminMembers =
    await clerkClient.organizations.getOrganizationMembershipList({
      organizationId: env.CLERK_ADMIN_ORG,
    });
  const filteredMembers = adminMembers.map((mem) => {
    return {
      id: mem.publicUserData?.userId,
      name: mem.publicUserData?.firstName,
    };
  });
  const isAdmin = filteredMembers.some((member) => member.id === userId);
  return isAdmin;
}

export default authMiddleware({
  async afterAuth(auth, req, evt) {
    // handle users who aren't authenticated
    console.info("Auth middleware");
    if (!auth.userId && !auth.isPublicRoute) {
      console.info("No user ID & private route.");
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    // Redirect after log in
    // Users in the Admin org will be redirected to the admin dashboard
    if (auth.userId && auth.isPublicRoute) {
      console.info("User is logged in and on public route");

      const isAdmin = await isAdminCheck(auth.userId);
      if (isAdmin) {
        console.info("User is admin group");
        const dashboard = new URL("/dashboard", req.url);
        return NextResponse.rewrite(dashboard);
      } else {
        console.info("User is not in admin group");
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return redirectToSignIn({ returnBackUrl: req.url });
      }
      // For guests...
      // TODO: IMPLEMENT GUEST LOG IN
    }
  },

  publicRoutes: ["/"],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
