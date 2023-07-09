import { CompanyDetailsCard } from "@/components/CompanyDetailsCard";
import { InvoiceDetailsCard } from "@/components/InvoiceDetailsCard";
import InvoiceSummary from "@/components/InvoiceSummary";
import AdminLayout from "@/components/LayoutAdmin";
import { LoadingPage } from "@/components/loading";
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

  if (isLoading) return <LoadingPage />;
  if (!invoice) return <>No data found</>;

  return (
    <AdminLayout>
      <section className="flex-1 space-y-4 p-8 pt-6">
        <CompanyDetailsCard />
        <InvoiceDetailsCard invoice={invoice} />

        <div className="my-4">
          <h3 className="font-bold">Items:</h3>
        </div>
        <div>{invoice && <InvoiceSummary invoice={invoice} />}</div>
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
