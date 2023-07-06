import AdminLayout from "@/components/LayoutAdmin";
import OrderTable from "@/components/OrderTable";
import LoadingSpinner, { LoadingPage } from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/utils/api";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

dayjs.extend(advancedFormat);

const SingleOrderPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const orderId = id as string;

  if (!orderId) return <>Invalid Order ID</>;

  const { data: order, isLoading } = api.pos.getOrderById.useQuery({
    id: orderId,
  });
  const { mutate: markAsPaid, status } = api.pos.markOrderAsPaid.useMutation();

  if (isLoading) return <LoadingPage />;
  if (!order) return <>No data found</>;

  return (
    <AdminLayout>
      <section className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Order</h2>
        </div>
        <div>
          <p>Order for {order.name}.</p>
        </div>
        <section className="flex flex-col items-start">
          <div className="grid grid-cols-2 gap-x-3">
            <p className="text-lg font-semibold">Name</p>
            <p className="text-lg font-semibold">{order.name}</p>
            <p className="text-lg font-semibold">Invoice Number</p>
            <Link
              href={`/invoices/${order.invoice?.invoiceNumber ?? ""}`}
              className="text-lg font-semibold underline"
            >
              IN{order.invoice?.invoiceNumber}
            </Link>
            <p className="text-lg font-semibold">Date Created</p>
            <p className="text-lg font-semibold">
              {dayjs(order.createdAt).format("Do MMM YYYY")}
            </p>
            <p className="text-lg font-semibold">Order Sub-Total</p>
            <p className="text-lg font-semibold">
              {new Intl.NumberFormat("en-us", {
                style: "currency",
                currency: "USD",
              }).format(Number(order.subTotalUSD))}
            </p>
            <p className="text-lg font-semibold">Status</p>
            <Badge className="inline-flex justify-center">{order.status}</Badge>
          </div>
          <div className="my-4 flex gap-4">
            <Button
              className="flex items-center justify-center"
              onClick={() => markAsPaid({ id: order.id })}
            >
              {status === "loading" ? <LoadingSpinner /> : "Mark as Paid"}
            </Button>
            {order.guest?.type === "STAFF" && (
              <Button
                variant="outline"
                disabled={Number(order.guest.availableCredits) <= 0}
              >
                Use Credits
              </Button>
            )}
          </div>
          <div className="my-4">
            <h3 className="font-bold">Items:</h3>
          </div>
          <div className="w-2/3">{order && <OrderTable order={order} />}</div>
        </section>
      </section>
    </AdminLayout>
  );
};

export default SingleOrderPage;
