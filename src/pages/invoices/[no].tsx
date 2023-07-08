import InvoiceSummary from "@/components/InvoiceSummary";
import AdminLayout from "@/components/LayoutAdmin";
import { LoadingPage } from "@/components/loading";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { generateSSGHelper } from "@/server/helpers/ssgHelper";
import { api } from "@/utils/api";
import { buildClerkProps, getAuth } from "@clerk/nextjs/server";
import { PaymentStatus } from "@prisma/client";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";

dayjs.extend(advancedFormat);

const InvoicePage: NextPage = () => {
  const router = useRouter();
  const [updatedStatus, setUpdatedStatus] = useState<PaymentStatus>();

  const { no } = router.query;
  const invoiceNumber = no as string;

  const { data: invoice, isLoading } = api.pos.getInvoiceByNumber.useQuery(
    {
      invoiceNumber: invoiceNumber,
    },
    {
      enabled: invoiceNumber !== null,
    }
  );

  const { data: KHRRates } = api.pos.currencyConversion.useQuery(
    {
      fromCurrency: "USD",
      toCurrency: "KHR",
      amount: Number(invoice?.totalUSD),
    },
    {
      enabled: invoice !== null && invoice !== undefined,
    }
  );

  const { mutate: updateStatus } = api.pos.updateInvoiceStatus.useMutation();

  if (isLoading) return <LoadingPage />;
  if (!invoice) return <>No data found</>;

  const handleUpdateStatus = () => {
    updateStatus({ id: invoice.id, status: "PAID" });
  };

  return (
    <AdminLayout>
      <section className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Invoice</h2>
        </div>
        <div>
          <p>Current Invoice for {invoice?.customerName}.</p>
        </div>
        <div className="my-4 flex gap-4">
          <Button
            className="bg-green-600"
            size="sm"
            onClick={handleUpdateStatus}
          >
            Mark as Paid
          </Button>
        </div>

        <section className="flex flex-col items-start">
          <div className="grid grid-cols-2 items-center gap-x-2 space-y-2">
            <p className="text-lg font-semibold">Name</p>
            <p className="text-lg font-semibold">{invoice.customerName}</p>
            <p className="text-lg font-semibold">Invoice Nuber</p>
            <p className="text-lg font-semibold">{invoice.invoiceNumber}</p>
            <p className="text-lg font-semibold">Date Created</p>
            <p className="text-lg font-semibold">
              {dayjs(invoice.createdAt).format("Do MMM YYYY")}
            </p>
            <p className="text-lg font-semibold">Total USD</p>
            <p className="text-lg font-semibold">
              {new Intl.NumberFormat("en-us", {
                style: "currency",
                currency: "USD",
              }).format(Number(invoice.totalUSD))}
            </p>
            <p className="text-lg font-semibold">Total KHR</p>
            {KHRRates?.rates.KHR && (
              <p className="text-lg font-semibold">
                {formatCurrency({
                  amount: Number(invoice.totalUSD) * KHRRates?.rates.KHR,
                  currency: "KHR",
                })}
              </p>
            )}

            <p className="text-lg font-semibold">Status</p>

            <Select
              onValueChange={(value) =>
                setUpdatedStatus(value as PaymentStatus)
              }
              defaultValue={invoice.status}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue
                  placeholder="Status"
                  defaultValue={invoice.status}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  {Object.values(PaymentStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="my-4">
            <h3 className="font-bold">Items:</h3>
          </div>
          <div>{invoice && <InvoiceSummary invoice={invoice} />}</div>
        </section>
      </section>
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { userId } = getAuth(ctx.req);
  const {
    query: { no },
  } = ctx;
  const ssg = generateSSGHelper(userId ?? "");

  if (no) {
    await ssg.pos.getInvoiceByNumber.prefetch({ invoiceNumber: no as string });
  }

  return {
    props: {
      ...buildClerkProps(ctx.req),
      trcpState: ssg.dehydrate(),
    },
  };
};

export default InvoicePage;
