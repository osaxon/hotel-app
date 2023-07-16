import GuestAccountForm from "@/components/GuestAccountForm";
import AdminLayout from "@/components/LayoutAdmin";
import { LoadingPage } from "@/components/loading";
import { api } from "@/utils/api";
import { Prisma } from "@prisma/client";
import type { NextPage } from "next";
import { useRouter } from "next/router";

const GuestAccountPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const guestId = id as string;

  const { data: guest, isLoading } = api.guests.getById.useQuery(
    {
      id: guestId,
    },
    { enabled: guestId !== null && guestId !== undefined }
  );

  if (isLoading) return <LoadingPage />;
  if (!guest) return <>No data found</>;

  return (
    <AdminLayout>
      <section className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Item Details</h2>
        </div>
        <section>
          <GuestAccountForm
            guest={
              guest as Prisma.GuestGetPayload<{
                include: {
                  invoices: {
                    include: {
                      orders: {
                        include: { items: { include: { item: true } } };
                      };
                      reservations: {
                        include: { reservationItem: true; room: true };
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

export default GuestAccountPage;
