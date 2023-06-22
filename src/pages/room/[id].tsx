import AdminLayout from "@/components/LayoutAdmin";
import { LoadingPage } from "@/components/loading";
import { generateSSGHelper } from "@/server/helpers/ssgHelper";
import clerkClient from "@clerk/clerk-sdk-node";
import { getAuth } from "@clerk/nextjs/server";

import { api } from "@/utils/api";
import type { GetServerSideProps, NextPage } from "next";

const SingleRoomAdminPage: NextPage<{ id: string }> = ({ id }) => {
  const { data, isLoading } = api.rooms.getById.useQuery({
    id,
  });

  if (isLoading) return <LoadingPage />;

  if (!data) return <div>404</div>;

  return (
    <AdminLayout>
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Room Administration
          </h2>
        </div>
      </main>
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { userId } = getAuth(ctx.req);

  const ssg = generateSSGHelper(userId ?? "");

  // Get list of admin members
  const members = await clerkClient.organizations.getOrganizationMembershipList(
    {
      organizationId: "org_2QShJyauTOgh6ieAcugtZLY5j9c",
    }
  );

  const filteredMembers = members.map((mem) => {
    return {
      id: mem.publicUserData?.userId,
      name: mem.publicUserData?.firstName,
    };
  });

  const isAdmin = filteredMembers.some((member) => member.id === userId);

  if (!isAdmin) {
    return {
      redirect: {
        destination: "/", // Redirect to a non-admin page
        permanent: false,
      },
    };
  }

  const id = ctx.params?.id;

  if (typeof id !== "string") throw new Error("No id");

  await ssg.rooms.getById.prefetch({ id });

  return {
    props: {
      trcpState: ssg.dehydrate(),
      id,
    },
  };
};

export default SingleRoomAdminPage;
