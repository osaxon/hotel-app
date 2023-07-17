import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
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
  Bed,
  CalendarClock,
  CalendarIcon,
  Check,
  CheckCheck,
  ChevronsUpDown,
  Pencil,
  Plus,
  User2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { LoadingPage } from "./loading";
import { Calendar } from "./ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";
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
  firstName: z.string(),
  surname: z.string(),
  invoiceId: z.string(),
  resItemId: z.string(),
  roomId: z.string().optional(),
  guestId: z.string().optional(),
  checkIn: z.date(),
  checkOut: z.date(),
});

const InvoiceFormSchema = z.object({
  guestId: z.string().optional(),
  firstName: z.string(),
  surname: z.string(),
  email: z.string(),
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
  const [selectedInvoice, setSelectedInvoice] = useState<string>("");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      firstName: reservation.firstName ?? "",
      surname: reservation.surname ?? "",
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      resItemId: reservation.reservationItem?.id,
      invoiceId: reservation.invoiceId ?? "",
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

  const {
    data: invoices,
    isLoading: isLoadingInvoices,
    isError: isInvoicesError,
  } = api.invoice.getOpen.useQuery();

  const { data: rooms, isLoading: isLoadingRooms } =
    api.rooms.getVacanctRooms.useQuery();

  const { mutate: updateReservation } = api.reservations.update.useMutation({
    onSuccess: (data) => {
      toast({
        title: "The data:",
        description: (
          <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
            <code className="text-white">{JSON.stringify(data, null, 2)}</code>
          </pre>
        ),
      });
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const payload = { id: reservation.id, ...data };
    updateReservation(payload);
    // toast({
    //   title: "The data:",
    //   description: (
    //     <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
    //       <code className="text-white">{JSON.stringify(payload, null, 2)}</code>
    //     </pre>
    //   ),
    // });
  }

  const status = reservation.status;

  if (isLoadingResItems || isLoadingInvoices) return <LoadingPage />;

  if (isResItemsError || isInvoicesError) {
    return <div>Error retrieving data.</div>;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full shrink-0 space-y-6 md:w-2/3"
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

        <div className="flex items-end justify-between gap-2">
          <div className="grid grow grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input disabled={disabled} {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="surname"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Surname</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input disabled={disabled} {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
          {reservation.guest?.id && (
            <Button variant="ghost">
              <Link href={`/accounts/${reservation.guest?.id}`}>
                <User2 className="h-10" />
              </Link>
            </Button>
          )}
        </div>
        <div className="flex items-end justify-between gap-2">
          <div className="grid grow grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="roomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a room for the guest" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rooms &&
                        rooms
                          .filter(
                            (room) =>
                              room.status === "VACANT" &&
                              room.roomType ===
                                reservation.reservationItem?.roomType
                          )
                          .map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              {room.roomNumber} - {room.roomName} -{" "}
                              {room.roomType}
                            </SelectItem>
                          ))}
                      {isLoadingRooms ?? (
                        <SelectItem value="LOADING">Loading...</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="resItemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reservation Option</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <SelectTrigger disabled={disabled}>
                          <SelectValue placeholder="Select a verified email to display" />
                        </SelectTrigger>
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button variant="ghost">
            <Link
              href={`/reservations/res-items/${
                reservation.reservationItem?.id ?? ""
              }`}
            >
              <Bed />
            </Link>
          </Button>
        </div>

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
                        "w-full pl-3 text-left font-normal md:w-1/3",
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
                        "w-full pl-3 text-left font-normal md:w-1/3",
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
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-end gap-2">
          <FormField
            control={form.control}
            name="invoiceId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Invoice</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-[200px] justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? invoices.find(
                              (invoice) => invoice.id === field.value
                            )?.invoiceNumber
                          : "Select Invoice"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search invoice by guest name..." />
                      <CommandEmpty>No invoice found.</CommandEmpty>
                      <CommandGroup>
                        {invoices.map((invoice) => {
                          return (
                            <CommandItem
                              value={invoice.id}
                              key={invoice.id}
                              onSelect={(value) => {
                                form.setValue("invoiceId", value);
                                setSelectedInvoice(value);
                              }}
                            >
                              {invoice.invoiceNumber} | {invoice.customerName}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <NewInvoiceDialog reservation={reservation} />
        </div>

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

function NewInvoiceDialog({ reservation }: { reservation: Reservation }) {
  const router = useRouter();
  const form = useForm<z.infer<typeof InvoiceFormSchema>>({
    resolver: zodResolver(InvoiceFormSchema),
    defaultValues: {
      guestId: reservation.guestId ?? "",
      firstName: reservation.firstName ?? "",
      surname: reservation.surname ?? "",
      email: reservation.email ?? "",
    },
  });

  const { mutate: addInvoice } = api.invoice.create.useMutation({
    onSuccess: () => void router.reload(),
  });

  function onSubmit(data: z.infer<typeof InvoiceFormSchema>) {
    addInvoice(data);
    toast({
      title: "The data:",
      description: (
        <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Plus />
        </Button>
      </DialogTrigger>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full shrink-0 space-y-6 md:w-2/3"
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New Invoice</DialogTitle>
              <DialogDescription>
                Set up a new Invoice to move the Reservation to.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name={`guestId`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GuestID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`firstName`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`surname`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Surname</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`email`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button onClick={form.handleSubmit(onSubmit)} type="submit">
                Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Form>
    </Dialog>
  );
}
