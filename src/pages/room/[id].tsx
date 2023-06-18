import type { GetStaticProps, NextPage } from "next";
import { api } from "@/utils/api";
import { LoadingPage } from "@/components/loading";
import { generateSSGHelper } from "@/server/helpers/ssgHelper";
import AdminLayout from "@/components/LayoutAdmin";

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
