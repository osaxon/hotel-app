import { PaymentStatus, Prisma } from "@prisma/client";
import dayjs from "dayjs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

import { formatCurrency } from "@/lib/utils";
import { api } from "@/utils/api";
import Link from "next/link";
import { useState } from "react";

type GuestAddress = {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

export function InvoiceDetailsCard({
  invoice,
}: {
  invoice: Prisma.InvoiceGetPayload<{ include: { guest: true } }>;
}) {
  const [updatedStatus, setUpdatedStatus] = useState<PaymentStatus>();

  const address: GuestAddress | null = invoice.guest?.address as GuestAddress;

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
  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle> ឦន្វៃចេ / Invoice</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="p-2">
          <p className="flex items-center gap-x-2 text-lg">
            អតិថិជន / Customer:{" "}
            <Link
              href={`/accounts/${invoice.guestId as string}`}
              className="text-lg"
            >
              {invoice.customerName}
            </Link>
          </p>
          <p className="flex flex-col gap-x-2 text-lg">
            sសយɖəន / Address:{" "}
            <div className="flex flex-col text-sm font-normal">
              {address &&
                Object.values(address).map((val) => (
                  <p key={val} className="text-sm">
                    {val}
                  </p>
                ))}
            </div>
          </p>
        </div>

        <div className="p-2">
          <p className="flex items-center gap-x-2 text-lg">
            Invoice Number: <p className="text-lg">{invoice.invoiceNumber!}</p>
          </p>
          <p className="flex items-center gap-x-2 text-lg">
            Date Created:{" "}
            <p className="text-lg">
              {dayjs(invoice.createdAt).format("Do MMM YYYY")}
            </p>
          </p>
          {/* <p className="flex items-center gap-x-2 text-lg">
            Total USD:{" "}
            <p className="text-lg">
              {new Intl.NumberFormat("en-us", {
                style: "currency",
                currency: "USD",
              }).format(Number(invoice.totalUSD))}
            </p>
          </p> */}
          <p className="flex items-center gap-x-2 text-lg">
            Total USD:{" "}
            <p className="text-lg">
              {new Intl.NumberFormat("en-us", {
                style: "currency",
                currency: "USD",
              }).format(Number(invoice.remainingBalanceUSD))}
            </p>
          </p>
          {/* <p className="flex items-center gap-x-2 text-lg">
            Total KHR:{" "}
            {KHRRates?.rates.KHR && (
              <p className="text-lg">
                {formatCurrency({
                  amount: Number(invoice.totalUSD) * KHRRates?.rates.KHR,
                  currency: "KHR",
                })}
              </p>
            )}
          </p> */}
          <p className="flex items-center gap-x-2 text-lg">
            Total KHR:{" "}
            {KHRRates?.rates.KHR && (
              <p className="text-lg">
                {formatCurrency({
                  amount:
                    Number(invoice.remainingBalanceUSD) * KHRRates?.rates.KHR,
                  currency: "KHR",
                })}
              </p>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
