import { PaymentStatus, Prisma } from "@prisma/client";
import dayjs from "dayjs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

import { formatCurrency } from "@/lib/utils";
import { api } from "@/utils/api";
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
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="p-2">
          <p className="flex items-center gap-x-2 text-lg">
            អតិថិជន / Customer:{" "}
            <p className="text-lg">{invoice.customerName}</p>
          </p>
          <p className="flex flex-col gap-x-2 text-lg">
            sសយɖəន / Address:{" "}
            <div className="flex flex-col text-sm font-normal">
              {Object.values(address).map((val) => (
                <p key={val} className="text-sm">
                  {val}
                </p>
              ))}
            </div>
          </p>
        </div>

        <div className="p-2">
          <p className="flex items-center gap-x-2 text-lg">
            Invoice Number: <p className="text-lg">{invoice.invoiceNumber}</p>
          </p>
          <p className="flex items-center gap-x-2 text-lg">
            Date Created:{" "}
            <p className="text-lg">
              {dayjs(invoice.createdAt).format("Do MMM YYYY")}
            </p>
          </p>
          <p className="flex items-center gap-x-2 text-lg">
            Total USD:{" "}
            <p className="text-lg">
              {new Intl.NumberFormat("en-us", {
                style: "currency",
                currency: "USD",
              }).format(Number(invoice.totalUSD))}
            </p>
          </p>
          <p className="flex items-center gap-x-2 text-lg">
            Total KHR:{" "}
            {KHRRates?.rates.KHR && (
              <p className="text-lg">
                {formatCurrency({
                  amount: Number(invoice.totalUSD) * KHRRates?.rates.KHR,
                  currency: "KHR",
                })}
              </p>
            )}
          </p>
        </div>

        {/* <p className="text-lg font-semibold">Status</p>

        <Select
          onValueChange={(value) => setUpdatedStatus(value as PaymentStatus)}
          defaultValue={invoice.status}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" defaultValue={invoice.status} />
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
        </Select> */}
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
