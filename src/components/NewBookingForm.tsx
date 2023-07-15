import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn, formatCurrency, getDurationOfStay } from "@/lib/utils";
import { useReservationStore } from "@/store/reservationStore";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReservationItem } from "@prisma/client";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { LoadingPage } from "./loading";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "./ui/use-toast";

const FormSchema = z.object({
  firstName: z.string(),
  surname: z.string(),
  email: z.string().email(),
  returningGuest: z.boolean().default(false),
  addToInvoice: z.boolean().default(false),
  invoiceId: z.string().optional(),
  resItemId: z.string(),
  guestId: z.string().optional(),
  checkIn: z.date(),
  checkOut: z.date(),
  subTotalUSD: z
    .string()
    .refine((value) => !isNaN(parseFloat(value)), {
      message: "Total must be a valid number.",
      path: ["subTotalUSD"],
    })
    .transform((value) => parseFloat(value)),
});

export default function NewBookingForm() {
  const [runGuestQuery, setRunGuestQuery] = useState<boolean>(false);
  const [runInvoiceQuery, setRunInvoiceQuery] = useState<boolean>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<string>("");
  const [selectedGuest, setSelectedGuest] = useState<string>("");
  const reservationSummary: ReservationItem | undefined = useReservationStore(
    (state) => state.reservationItem
  );
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const toggle = useReservationStore((state) => state.toggleResItem);
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      returningGuest: false,
    },
  });
  const resItemId = form.watch("resItemId");
  const checkIn = form.watch("checkIn");
  const checkOut = form.watch("checkOut");
  const addToInvoice = form.watch("addToInvoice");
  const returnGuest = form.watch("returningGuest");
  const invoiceId = form.watch("invoiceId");

  const {
    data: guests,
    isLoading: isLoadingGuests,
    isError: isGuestsError,
  } = api.guests.getAll.useQuery();

  const {
    data: invoices,
    isLoading: isLoadingInvoices,
    isError: isInvoicesError,
  } = api.invoice.getOpen.useQuery();

  const {
    data: resItems,
    isLoading: isLoadingResItems,
    isError: isResItemsError,
  } = api.reservations.getReservationItems.useQuery(undefined, {
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  const { mutate: createReservation } =
    api.reservations.createReservation.useMutation({
      onSuccess: (data) => {
        form.reset(),
          void router.replace("/"),
          toast({
            title: "New Reservation",
            description: (
              <div className="flex justify-between">
                <Check />
                <p>Reservation added</p>
              </div>
            ),
            action: <Link href={`/check-in/${data.id}`}>Check-In</Link>,
          });
      },
    });

  // Disabled by default. Query runs if invoice is selected.
  // Form fields then populated with response
  const { data: invoiceData } = api.invoice.getById.useQuery(
    {
      id: selectedInvoice,
    },
    {
      enabled: runInvoiceQuery,
      onSuccess: (data) => {
        form.setValue("firstName", data?.guest?.firstName ?? "");
        form.setValue("surname", data?.guest?.surname ?? "");
        form.setValue("email", data?.guest?.email ?? "");
      },
    }
  );

  // Disabled by default. Query runs if a returning guest is selected.
  // Form fields then populated with response
  const { data: guestData } = api.guests.getById.useQuery(
    {
      id: selectedGuest,
    },
    {
      enabled: runGuestQuery,
      onSuccess: (data) => {
        form.setValue("firstName", data?.firstName ?? "");
        form.setValue("surname", data?.surname ?? "");
        form.setValue("email", data?.email ?? "");
      },
    }
  );

  useEffect(() => {
    if (!resItemId) {
      return;
    }
    const itemObject: ReservationItem | undefined = resItems?.find(
      (item) => item.id === resItemId
    );
    if (!itemObject) {
      return;
    }
    toggle(itemObject);
  }, [resItemId, resItems, toggle]);

  useEffect(() => {
    if (checkIn && checkOut) {
      const durationInDays = getDurationOfStay(checkIn, checkOut);
      setDuration(durationInDays);
    } else {
      setDuration(undefined); // Reset duration if checkIn or checkOut is not set
    }
  }, [checkIn, checkOut]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    createReservation(data);
  }

  if (
    isLoadingGuests ||
    isLoadingGuests ||
    isLoadingResItems ||
    isLoadingInvoices
  )
    return <LoadingPage />;

  if (isGuestsError || isResItemsError || isInvoicesError) {
    return <div>Error retrieving data.</div>;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full shrink-0 space-y-4 md:w-2/3"
      >
        <RadioGroup
          defaultValue="new"
          className="grid w-full grid-cols-2 gap-4"
        >
          <Label
            htmlFor="new"
            onFocus={() => {
              form.setValue("addToInvoice", false);
            }}
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
          >
            <RadioGroupItem value="new" id="new" className="sr-only" />
            <p className="text-xl">New Invoice</p>
          </Label>
          <Label
            htmlFor="add"
            onFocus={() => {
              form.setValue("addToInvoice", true);
            }}
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
          >
            <RadioGroupItem value="add" id="add" className="sr-only" />
            <p className="text-xl">Add to Invoice</p>
          </Label>
        </RadioGroup>

        {!addToInvoice && (
          <>
            <FormField
              control={form.control}
              name="returningGuest"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Return Guest</FormLabel>
                    <FormDescription>
                      Guest has stayed before and information is held in system.
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
            {returnGuest && (
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
            )}
          </>
        )}

        {addToInvoice && (
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
                                setRunInvoiceQuery(true);
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
        )}
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>First Name</FormLabel>
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
          name="surname"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Surname</FormLabel>
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Guest Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="resItemId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Options</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          name="checkIn"
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
          name="checkOut"
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

        <FormField
          control={form.control}
          name="subTotalUSD"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Sub-total USD</FormLabel>
                <FormControl>
                  <Input
                    placeholder={formatCurrency({ amount: 0 })}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <div className="flex gap-4">
          <Button type="submit">Submit</Button>
          <Button
            variant="destructive"
            type="reset"
            onClick={() => {
              form.reset();
              setSelectedGuest("");
              setRunGuestQuery(false);
            }}
          >
            Reset
          </Button>
        </div>
      </form>
    </Form>
  );
}
