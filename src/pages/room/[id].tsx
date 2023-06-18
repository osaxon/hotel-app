import type { GetStaticProps, NextPage, GetStaticPaths } from "next";
import { ParsedUrlQuery } from "querystring";
import { MainNav } from "@/components/MainNav";
import { UserNav } from "@/components/UserNav";
import { api } from "@/utils/api";
import { LoadingPage } from "@/components/loading";
import { generateSSGHelper } from "@/server/helpers/ssgHelper";
import AdminLayout from "@/components/LayoutAdmin";
import type { Room } from "@prisma/client";

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

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("No id");

  await ssg.rooms.getById.prefetch({ id });

  return {
    props: {
      trcpState: ssg.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default SingleRoomAdminPage;
