import ItemForm from "@/components/ItemForm";
import AdminLayout from "@/components/LayoutAdmin";
import { LoadingPage } from "@/components/loading";
import { api } from "@/utils/api";
import { Prisma } from "@prisma/client";
import type { NextPage } from "next";
import { useRouter } from "next/router";

const SingleItemPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const itemId = id as string;

  const { data: item, isLoading } = api.pos.getItemById.useQuery({
    id: itemId,
  });

  if (isLoading) return <LoadingPage />;
  if (!item) return <>No data found</>;

  return (
    <AdminLayout>
      <section className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Item Details</h2>
        </div>
        <section>
          <ItemForm
            item={
              item as Prisma.ItemGetPayload<{
                include: { ingredients: { include: { ingredient: true } } };
              }>
            }
          />
        </section>
      </section>
    </AdminLayout>
  );
};

export default SingleItemPage;
