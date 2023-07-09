import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/utils/api";
import { Prisma, ReservationStatus } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import {
  ArrowUpDown,
  CalendarClock,
  Check,
  CheckCheck,
  MoreHorizontal,
  Receipt,
} from "lucide-react";
import Link from "next/link";
import DataTable from "./DataTable";
import { LoadingPage } from "./loading";
import { Button } from "./ui/button";

export const columns: ColumnDef<
  Prisma.ReservationGetPayload<{
    include: { invoice: true; reservationItem: true };
  }>
>[] = [
  {
    accessorKey: "id",
    header: () => <div className="">Reservation ID</div>,
    cell: ({ row }) => {
      const reservationID: string = row.getValue("id");
      return (
        <Link
          href={`/reservations/${reservationID}`}
          className="w-10 uppercase underline"
        >
          ...{reservationID.slice(-8)}
        </Link>
      );
    },
  },

  {
    accessorKey: "checkIn",
    cell: ({ row }) => {
      return <div>{dayjs(row.getValue("checkIn")).format("ddd MMM YY")}</div>;
    },
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Check-In
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "checkOut",
    cell: ({ row }) => {
      return <div>{dayjs(row.getValue("checkOut")).format("ddd MMM YY")}</div>;
    },
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Check-Out
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "guestName",
    header: "Name",
  },
  {
    accessorKey: "guestEmail",
    header: "Email",
  },
  {
    accessorKey: "reservationItem.description",
    header: "Option",
    cell: ({ row }) => {
      const resItemId: string = row.original.reservationItem?.id || "";
      const resItemDesc: string =
        row.original.reservationItem?.description || "";

      return (
        <Link href={`/res-item/${resItemId}`}>
          <Button>{resItemDesc}</Button>
        </Link>
      );
    },
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status: ReservationStatus = row.getValue("status");
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="cursor-auto">
              {status === "CHECKED_IN" ? (
                <>
                  <Check className="text-cyan-600" />
                  <TooltipContent>
                    <p>Checked In</p>
                  </TooltipContent>
                </>
              ) : status === "CONFIRMED" ? (
                <>
                  <CalendarClock />
                  <TooltipContent>
                    <p>Booking Confirmed</p>
                  </TooltipContent>
                </>
              ) : status === "FINAL_BILL" ? (
                <>
                  <Receipt className="text-green-600" />
                  <TooltipContent>
                    <p>Final Bill Ready</p>
                  </TooltipContent>
                </>
              ) : status === "CHECKED_OUT" ? (
                <>
                  <CheckCheck />
                  <TooltipContent>
                    <p>Checked Out</p>
                  </TooltipContent>
                </>
              ) : null}
            </TooltipTrigger>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const status = row.getValue("status");
      const id: string = row.getValue("id");
      const invoiceNumber: string = row.original.invoice?.invoiceNumber ?? "";

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {status == "CONFIRMED" && (
              <DropdownMenuItem>
                <Link href={`/check-in/${id}`}>Check In Guest</Link>
              </DropdownMenuItem>
            )}
            {status !== "CONFIRMED" && (
              <>
                <DropdownMenuItem>
                  <Link href={`/check-out/${id}`}>Check Out</Link>
                </DropdownMenuItem>
                {invoiceNumber && (
                  <DropdownMenuItem>
                    <Link href={`/invoices/${invoiceNumber}`}>
                      View Invoice
                    </Link>
                  </DropdownMenuItem>
                )}
              </>
            )}
            <DropdownMenuItem>View Order Details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function ReservationsTable() {
  const { data: reservations, isLoading } =
    api.reservations.getActiveReservations.useQuery();

  if (isLoading) return <LoadingPage />;
  if (!reservations) return null;

  return (
    <DataTable
      filterColumn="guestName"
      filterPlaceholder="Filter name"
      data={reservations}
      columns={columns}
    />
  );
}
