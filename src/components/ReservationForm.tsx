import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { cn, convertToNormalCase } from "@/lib/utils";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Prisma } from "@prisma/client";
import { format } from "date-fns";
import {
  CalendarClock,
  CalendarIcon,
  Check,
  CheckCheck,
  Link as LinkIcon,
  Pencil,
  User2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Calendar } from "./ui/calendar";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Toggle } from "./ui/toggle";

const FormSchema = z.object({
  guestName: z.string(),
  guestEmail: z.string().email(),
  returningGuest: z.boolean().default(false),
  resItemId: z.string(),
  guestId: z.string().optional(),
  checkIn: z.date(),
  checkOut: z.date(),
});

type Reservation = Prisma.ReservationGetPayload<{
  include: {
    guest: true;
    invoice: true;
    room: true;
    reservationItem: true;
    orders: {
      include: {
        items: {
          include: {
            item: true;
          };
        };
      };
    };
  };
}>;

export default function ReservationForm({
  reservation,
}: {
  reservation: Reservation;
}) {
  const [disabled, setDisabled] = useState<boolean>(true);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      resItemId: reservation.reservationItem?.id,
    },
  });

  const {
    data: resItems,
    isLoading: isLoadingResItems,
    isError: isResItemsError,
  } = api.reservations.getReservationItems.useQuery(undefined, {
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast({
      title: "The data:",
      description: (
        <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  const status = reservation.status;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full shrink-0 space-y-6 md:w-1/2"
      >
        <div className="flex justify-between">
          <div className="flex items-center gap-10">
            {status === "CHECKED_IN" ? (
              <div className="flex items-center">
                <Check />
                <Label>{convertToNormalCase(reservation.status)}</Label>
              </div>
            ) : status === "CONFIRMED" ? (
              <div className="flex items-center">
                <CalendarClock />
                {convertToNormalCase(reservation.status)}
              </div>
            ) : status === "CHECKED_OUT" ? (
              <div className="flex items-center">
                <CheckCheck />
                <Label>{convertToNormalCase(reservation.status)}</Label>
              </div>
            ) : null}
            {status !== "CHECKED_OUT" && (
              <Button variant="outline">
                <Link
                  href={
                    status === "CHECKED_IN"
                      ? `/check-out/${reservation.id}`
                      : status === "CONFIRMED"
                      ? `/check-in/${reservation.id}`
                      : `/invoices/${reservation.invoice?.id || ""}`
                  }
                >
                  {status === "CHECKED_IN"
                    ? "Check Out"
                    : status === "CONFIRMED"
                    ? "Check In"
                    : ""}
                </Link>
              </Button>
            )}
          </div>

          <Toggle aria-label="Toggle edit">
            <Pencil onClick={() => setDisabled(!disabled)} />
          </Toggle>
        </div>
        <FormField
          control={form.control}
          name="guestName"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Guest Name</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input disabled={disabled} {...field} />
                    {reservation.guest?.id && (
                      <Link
                        className="px-3"
                        href={`/guests/${reservation.guest?.id}`}
                      >
                        <User2 />
                      </Link>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="resItemId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reservation Option</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <SelectTrigger disabled={disabled}>
                      <SelectValue placeholder="Select a verified email to display" />
                    </SelectTrigger>
                    <Link
                      className="px-3"
                      href={`/reservations/res-items/${
                        reservation.reservationItem?.id ?? ""
                      }`}
                    >
                      <LinkIcon />
                    </Link>
                  </div>
                </FormControl>
                <SelectContent>
                  {resItems &&
                    resItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.description}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormDescription>
                You can manage email addresses in your{" "}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="checkIn"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Check-In</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      disabled={disabled}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="checkOut"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Check-Out</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      disabled={disabled}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date.valueOf() <
                      new Date(form.getValues("checkIn")).setHours(0, 0, 0, 0)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                The check out date can be updated if the guest extends their
                stay.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4">
          <Button disabled={disabled} type="submit">
            Save
          </Button>
          <Button disabled={disabled} variant="destructive" type="reset">
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
