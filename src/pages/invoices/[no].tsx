import Invoice from "@/components/Invoice";
import AdminLayout from "@/components/LayoutAdmin";
import { LoadingPage } from "@/components/loading";
import { api } from "@/utils/api";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import type { NextPage } from "next";
import { useRouter } from "next/router";

dayjs.extend(advancedFormat);

const InvoicePage: NextPage = () => {
  const router = useRouter();
  const { no } = router.query;

  const invoiceNumber = no as string;

  if (!invoiceNumber) return <>No invoice number</>;

  const { data: invoice, isLoading } = api.pos.getInvoiceByNumber.useQuery(
    { invoiceNumber: invoiceNumber },
    { staleTime: Infinity }
  );

  if (isLoading) return <LoadingPage />;
  if (!invoice) return <>No data found</>;

  return (
    <AdminLayout>
      <section className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Invoice</h2>
        </div>
        <div>
          <p>Current Invoice for {invoice?.customerName}.</p>
        </div>
        <section className="flex flex-col items-start">
          <div className="grid grid-cols-2 gap-x-3">
            <p className="text-lg font-semibold">Name</p>
            <p className="text-lg font-semibold">{invoice.customerName}</p>
            <p className="text-lg font-semibold">Invoice Nuber</p>
            <p className="text-lg font-semibold">{invoice.invoiceNumber}</p>
            <p className="text-lg font-semibold">Date Created</p>
            <p className="text-lg font-semibold">
              {dayjs(invoice.createdAt).format("Do MMM YYYY")}
            </p>
          </div>
          <div className="my-4">
            <h3 className="font-bold">Items:</h3>
          </div>
          <div className="w-2/3">
            {invoice && <Invoice invoice={invoice} />}
          </div>
        </section>
      </section>
    </AdminLayout>
  );
};

export default InvoicePage;
