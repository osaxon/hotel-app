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
import { Input } from "@/components/ui/input";
import { cn, convertToNormalCase } from "@/lib/utils";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReservationStatus } from "@prisma/client";
import { format } from "date-fns";
import {
  CalendarIcon,
  ChevronsUpDown,
  MinusCircle,
  PlusCircle,
} from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

import Link from "next/link";
import { Switch } from "./ui/switch";
import { ToastAction } from "./ui/toast";
import { toast } from "./ui/use-toast";

const FormSchema = z.object({
  returningGuest: z.boolean().default(false),
  guestId: z.string().optional(),
  firstName: z.string(),
  surname: z.string(),
  email: z.string(),
  reservations: z.array(
    z.object({
      // Define the properties of each object in the array
      firstName: z.string(),
      surname: z.string(),
      email: z.string(),
      reservationItemId: z.string(),
      checkIn: z.date(),
      checkOut: z.date(),
      subTotalUSD: z
        .string()
        .refine((value) => !isNaN(parseFloat(value)), {
          message: "Total must be a valid number.",
          path: ["subTotalUSD"],
        })
        .transform((value) => parseFloat(value)),
      status: z.nativeEnum(ReservationStatus),
    })
  ),
});

export default function NewInvoiceForm() {
  const [runGuestQuery, setRunGuestQuery] = useState<boolean>(false);
  const [selectedGuest, setSelectedGuest] = useState<string>("");

  const {
    data: resItems,
    isLoading: isLoadingResItems,
    isError: isResItemsError,
  } = api.reservations.getReservationItems.useQuery(undefined, {
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  const {
    data: guests,
    isLoading: isLoadingGuests,
    isError: isGuestsError,
  } = api.guests.getAll.useQuery();

  const { data: guestData } = api.guests.getById.useQuery(
    {
      id: selectedGuest,
    },
    {
      enabled: runGuestQuery,
      onSuccess: (data) => {
        form.setValue("firstName", data?.firstName ?? "");
        form.setValue("email", data?.email ?? "");
        form.setValue("surname", data?.surname ?? "");
      },
    }
  );

  const { mutate: addInvoice } = api.invoice.create.useMutation({
    onSuccess: (data) => {
      //   toast({
      //     title: "The data:",
      //     description: (
      //       <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
      //         <code className="text-white">{JSON.stringify(data, null, 2)}</code>
      //       </pre>
      //     ),
      //   });
      toast({
        title: `Invoice created.`,
        description: `IN${data.invoiceNumber}.`,
        action: (
          <ToastAction altText="go to invoice">
            <Link href={`/invoices/${data.invoiceNumber}`}>View</Link>
          </ToastAction>
        ),
      });
    },
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onSubmit",
  });

  const returnGuest = form.watch("returningGuest");
  const reservations = form.watch("reservations");

  const {
    fields: reservationFields,
    append: appendReservation,
    prepend: prependReservation,
    remove: removeReservation,
    swap: swapReservation,
    move: moveReservation,
    insert: insertReservation,
  } = useFieldArray({
    control: form.control,
    name: "reservations", // unique name for your Field Array
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    addInvoice(data);
    // toast({
    //   title: "The data:",
    //   description: (
    //     <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
    //       <code className="text-white">{JSON.stringify(data, null, 2)}</code>
    //     </pre>
    //   ),
    // });
  }

  if (isLoadingGuests || isLoadingGuests || isLoadingResItems)
    return <LoadingPage />;

  if (isGuestsError || isResItemsError) {
    return <div>Error retrieving data.</div>;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-6 md:w-2/3"
      >
        <section className="space-y-4 rounded-md border p-4">
          <div>
            <h3 className="font-semibold">Customer Info</h3>
          </div>
          <FormField
            control={form.control}
            name="returningGuest"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Return Guest</FormLabel>
                  <FormDescription>
                    Lookup data for a previous Guest.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {returnGuest ? (
            <FormField
              control={form.control}
              name="guestId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Guest</FormLabel>
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
                            ? guests.find((guest) => guest.id === field.value)
                                ?.fullName
                            : "Select Guest"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search guest..." />
                        <CommandEmpty>No guest found.</CommandEmpty>
                        <CommandGroup>
                          {guests.map((guest) => {
                            const fullName = `${guest.firstName} ${guest.surname}`;
                            return (
                              <CommandItem
                                value={guest.id}
                                key={guest.id}
                                onSelect={(value) => {
                                  form.setValue("guestId", value);
                                  setSelectedGuest(value);
                                  setRunGuestQuery(true);
                                }}
                              >
                                {guest.fullName}
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
          ) : null}
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
        </section>

        <section className="space-y-4 rounded-md border p-4">
          <div>
            <h3 className="font-semibold">Reservations</h3>
          </div>

          {reservationFields.map((field, index) => (
            <div key={field.id} className="space-y-4 rounded-md border p-4">
              <div>
                <h3 className="border-b font-semibold">
                  Reservation {index + 1}
                </h3>
              </div>
              <FormField
                control={form.control}
                name={`reservations.${index}.reservationItemId`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Options</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select the reservation option." />
                        </SelectTrigger>
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
              <FormField
                control={form.control}
                name={`reservations.${index}.checkIn`}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Check-In</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
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
                name={`reservations.${index}.checkOut`}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Check-Out</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
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
                            new Date(
                              form.getValues("reservations")[0]?.checkIn ??
                                new Date()
                            ).setHours(0, 0, 0, 0)
                          }
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
                name={`reservations.${index}.subTotalUSD`}
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Sub-total USD</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name={`reservations.${index}.status`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      defaultValue={ReservationStatus.CONFIRMED}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ReservationStatus).map((status) => (
                          <SelectItem
                            className="uppercase"
                            key={status}
                            value={status}
                          >
                            {convertToNormalCase(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="destructive"
                  className="flex items-center justify-center gap-2"
                  onClick={() => removeReservation(index)}
                >
                  <MinusCircle className="shrink-0" />
                  <span>Remove</span>
                </Button>
              </div>
            </div>
          ))}
          <Button
            onClick={() => {
              appendReservation({
                firstName: form.getValues("reservations")[0]?.firstName ?? "",
                surname: form.getValues("reservations")[0]?.surname ?? "",
                email: form.getValues("reservations")[0]?.email ?? "",
                reservationItemId: "",
                checkIn: form.watch("reservations")[0]?.checkIn ?? new Date(),
                checkOut: form.watch("reservations")[0]?.checkOut ?? new Date(),
                subTotalUSD: 0,
                status: ReservationStatus.CONFIRMED,
              });
              if (reservations && reservations.length) {
                form.setFocus(
                  `reservations.${reservations.length - 1}.reservationItemId`
                );
              } else {
                form.setFocus(`reservations.0.status`);
              }
            }}
            variant="secondary"
            className="flex gap-2"
            type="button"
          >
            <PlusCircle className="shrink-0" />
            Add Reservation
          </Button>
        </section>

        {/* <section className="space-y-4 rounded-md border p-4">
          <div>
            <h3 className="font-semibold">Orders</h3>
          </div>

          {orderFields.map((field, index) => (
            <section key={field.id} className="space-y-4 rounded-md border p-4">
              <div>
                <h3 className="border-b font-semibold">Order {index + 1}</h3>
              </div>
              <FormField
                control={form.control}
                name={`orders.${index}.isHappyHour`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Use Happy Hour Price</FormLabel>
                      <FormDescription>
                        If left blank, happy hour price will be determined by
                        the current time.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="destructive"
                  className="flex items-center justify-center gap-2"
                  onClick={() => removeOrder(index)}
                >
                  <MinusCircle className="shrink-0" />
                  <span>Remove</span>
                </Button>
              </div>
            </section>
          ))}
          <Button
            onClick={() =>
              appendOrder({
                items: [],
                isHappyHour: false,
              })
            }
            className="flex gap-2"
            variant="secondary"
            type="button"
          >
            <PlusCircle className="shrink-0" />
            Add Order
          </Button>
        </section> */}

        <Button className="flex gap-2" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
}
