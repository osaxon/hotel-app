import InfoBanner from "@/components/InfoBanner";
import AdminLayout from "@/components/LayoutAdmin";
import ResItemForm from "@/components/ResItemForm";
import { LoadingPage } from "@/components/loading";
import { api } from "@/utils/api";
import type { NextPage } from "next";
import { useRouter } from "next/router";

const ReservationPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const resItemId = id as string;

  const { data: resItem, isLoading } = api.reservations.getResItemById.useQuery(
    {
      id: resItemId,
    }
  );

  if (isLoading) return <LoadingPage />;
  if (!resItem) return <>No data found</>;

  return (
    <AdminLayout>
      <section className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Reservation Option
          </h2>
        </div>
        <InfoBanner text="The Reservation Option is a combination of room class, variants and board options. Each Reservation has an option which is displayed on the Invoice." />
        <section>
          <ResItemForm resItem={resItem} />
        </section>
      </section>
    </AdminLayout>
  );
};

export default ReservationPage;
