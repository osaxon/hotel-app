import AdminLayout from "@/components/LayoutAdmin";
import ReservationForm from "@/components/ReservationForm";
import { LoadingPage } from "@/components/loading";
import { api } from "@/utils/api";
import { Prisma } from "@prisma/client";
import type { NextPage } from "next";
import { useRouter } from "next/router";

const ReservationPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const resId = id as string;

  const { data: reservation, isLoading } = api.reservations.getByID.useQuery({
    id: resId,
  });

  if (isLoading) return <LoadingPage />;
  if (!reservation) return <>No data found</>;

  return (
    <AdminLayout>
      <section className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Reservation Details
          </h2>
        </div>
        <section>
          <ReservationForm
            reservation={
              reservation as Prisma.ReservationGetPayload<{
                include: {
                  guest: true;
                  room: true;
                  invoice: true;
                  reservationItem: true;
                  orders: {
                    include: {
                      items: {
                        include: {
                          item: true;
                        };
                      };
                    };
                  };
                };
              }>
            }
          />
        </section>
      </section>
    </AdminLayout>
  );
};

export default ReservationPage;
