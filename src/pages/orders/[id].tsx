import AdminLayout from "@/components/LayoutAdmin";
import OrderTable from "@/components/OrderTable";
import { LoadingPage } from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/utils/api";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { Receipt, Trash2 } from "lucide-react";
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
  const utils = api.useContext();

  const { mutate: updateStatus, status } = api.pos.updateStatus.useMutation({
    async onMutate({ id, status }) {
      // Cancel outgoing fetches
      await utils.pos.getOrderById.cancel({ id: orderId });

      // Snapshot current state
      const prevData = utils.pos.getOrderById.getData({
        id: orderId,
      });

      // Optimistically update
      utils.pos.getOrderById.setData({ id: orderId }, (prev) => {
        if (!prev) return prevData;
        return {
          ...prev,
          status: status,
        };
      });

      // return snapshot
      return { prevData };
    },
    async onSettled() {
      await utils.pos.getOrderById.invalidate({ id: orderId });
    },
  });

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
            <Badge
              variant="outline"
              className="inline-flex justify-center rounded-md"
            >
              {order.status}
            </Badge>
          </div>
          <div className="my-4 flex gap-4">
            <Button
              variant="ghost"
              className="flex items-center justify-center gap-1"
              onClick={() => updateStatus({ id: order.id, status: "PAID" })}
            >
              <Receipt />
              Mark as Paid
            </Button>
            <Button
              variant="ghost"
              className="flex items-center justify-center gap-1"
              onClick={() =>
                updateStatus({ id: order.id, status: "CANCELLED" })
              }
            >
              <Trash2 />
              Cancel Order
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
