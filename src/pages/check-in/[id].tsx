import type { NextPage } from "next";
import { useRouter } from "next/router";
import CheckInForm from "@/components/CheckInForm";
import AdminLayout from "@/components/LayoutAdmin";
import { api } from "@/utils/api";
import { LoadingPage } from "@/components/loading";

const CheckInPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const reservationId = id as string;

  const { data: reservation, isLoading } = api.reservations.getByID.useQuery(
    { id: reservationId },
    { staleTime: Infinity }
  );

  if (isLoading) return <LoadingPage />;
  if (!reservation) return <>No data found</>;

  return (
    <AdminLayout>
      <section className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Check In</h2>
        </div>
        <div>
          <p>Complete this check in form for {reservation?.customerName}.</p>
        </div>
        <section>
          <CheckInForm reservationData={reservation} />
        </section>
      </section>
    </AdminLayout>
  );
};

export default CheckInPage;
