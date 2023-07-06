import type { NextPage } from "next";
import { useRouter } from "next/router";

import CheckOutForm from "@/components/CheckOutForm";
import AdminLayout from "@/components/LayoutAdmin";
import { LoadingPage } from "@/components/loading";
import { api } from "@/utils/api";

const CheckOutPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const reservationId = id as string;

  const { data: reservation, isLoading } = api.reservations.getByID.useQuery({
    id: reservationId,
  });

  if (isLoading) return <LoadingPage />;
  if (!reservation) return <>No data found</>;

  return (
    <AdminLayout>
      <section className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Check Out</h2>
        </div>
        <div>
          <p>Complete check out for {reservation?.guest?.firstName}.</p>
        </div>
        <CheckOutForm reservationData={reservation} />
      </section>
    </AdminLayout>
  );
};

export default CheckOutPage;
