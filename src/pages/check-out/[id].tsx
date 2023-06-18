import type { NextPage } from "next";
import { useRouter } from "next/router";

import AdminLayout from "@/components/LayoutAdmin";
import { api } from "@/utils/api";
import LoadingSpinner, { LoadingPage } from "@/components/loading";
import CheckOutForm from "@/components/CheckOutForm";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import dayjs from "dayjs";
import { Badge } from "@/components/ui/badge";
import { FileText, Download } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoiceTablePDF from "@/components/InvoiceTablePDF";
import { useState } from "react";

const CheckOutPage: NextPage = () => {
  const [showPDF, setShowPDF] = useState<boolean>(false);
  const router = useRouter();
  const { id } = router.query;

  const reservationId = id as string;

  const { data: reservation, isLoading } = api.reservations.getByID.useQuery(
    { id: reservationId },
    { staleTime: Infinity }
  );

  if (isLoading) return <LoadingPage />;
  if (!reservation) return <>No data found</>;

  const calculateTotal = () => {
    const subTotal = parseFloat(reservation.subTotalUSD?.toString() ?? "0");
    const ordersTotal = reservation.orders.reduce(
      (total, order) => total + parseFloat(order.subTotalUSD.toString()),
      0
    );
    return (subTotal + ordersTotal).toFixed(2);
  };

  const handleGeneratePDF = () => {
    setShowPDF(true);
  };

  return (
    <AdminLayout>
      {reservation.status === "CHECKED_IN" ? (
        <section className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Check Out</h2>
          </div>
          <div>
            <p>Complete check out for {reservation?.guest?.firstName}.</p>
          </div>
          <CheckOutForm reservationData={reservation} />
        </section>
      ) : (
        <section className="flex-auto space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Final bill</h2>
          </div>
          <div className="flex justify-between">
            <p>Includes stay and bar oders.</p>
            {showPDF ? (
              <PDFDownloadLink
                document={<InvoiceTablePDF reservation={reservation} />}
                fileName="checkout.pdf"
              >
                {({ loading }) =>
                  loading ? (
                    <LoadingSpinner size={48} />
                  ) : (
                    <Download size={48} />
                  )
                }
              </PDFDownloadLink>
            ) : (
              <>
                <FileText
                  className="cursor-pointer"
                  onClick={handleGeneratePDF}
                  size={48}
                />
              </>
            )}
          </div>

          <Table className="border">
            <TableCaption>Final bill</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">{reservation.id}</TableCell>
                <TableCell className="font-medium">
                  {dayjs(reservation.checkOut).diff(
                    dayjs(reservation.checkIn),
                    "day"
                  )}{" "}
                  x nights - Room {reservation.room?.roomNumber},{" "}
                  {reservation.room?.roomType}
                </TableCell>
                <TableCell>
                  <Badge>{reservation.paymentStatus}</Badge>
                </TableCell>
                <TableCell>
                  {dayjs(reservation.createdAt).format("DD/MM/YYYY")}
                </TableCell>
                <TableCell className="text-right">
                  ${reservation.subTotalUSD?.toString() ?? ""}
                </TableCell>
              </TableRow>
              {reservation &&
                reservation?.orders
                  .filter((order) => order.status === "UNPAID")
                  .map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell className="font-medium">
                        Bar drinks
                        {order.items.map((item) => (
                          <p
                            className="text-sm italic text-muted-foreground"
                            key={item.id}
                          >
                            {item.quantity}x {item?.item.name}
                          </p>
                        ))}
                      </TableCell>
                      <TableCell>
                        <Badge>{order.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {dayjs(order.createdAt).format("DD/MM/YYYY")}
                      </TableCell>
                      <TableCell className="text-right">
                        ${order.subTotalUSD.toString()}
                      </TableCell>
                    </TableRow>
                  ))}
              <TableRow>
                <TableCell className="font-bold">Total</TableCell>
                <TableCell className="font-medium"> -</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell className="text-right font-bold">
                  ${calculateTotal()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </section>
      )}
    </AdminLayout>
  );
};

export default CheckOutPage;
