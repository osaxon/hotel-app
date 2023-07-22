import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { GuestType, Prisma } from "@prisma/client";
import { countries } from "countries-list";
import { Check, ChevronsUpDown, Pencil } from "lucide-react";
import { useEffect, useState } from "react";

import { cn, convertToNormalCase } from "@/lib/utils";
import { api } from "@/utils/api";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { Toggle } from "./ui/toggle";

type GuestAddress = {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

const FormSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  surname: z.string(),
  email: z.string().email(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }),
  type: z.nativeEnum(GuestType),
  availableCredits: z
    .union([z.string().nullable(), z.number().nullable()])
    .refine((value) => value !== null && !isNaN(parseFloat(value as string)), {
      message: "Total must be a valid number.",
      path: ["subTotalUSD"],
    })
    .transform((value) => parseFloat(value as string)),
});

export default function GuestAccountForm({
  guest,
}: {
  guest: Prisma.GuestGetPayload<{
    include: {
      invoices: {
        include: {
          orders: { include: { items: { include: { item: true } } } };
          reservations: { include: { reservationItem: true; room: true } };
        };
      };
    };
  }>;
}) {
  const address: GuestAddress | null = (guest?.address as GuestAddress) || null;
  const [disabled, setDisabled] = useState<boolean>(true);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),

    defaultValues: {
      id: guest.id,
      firstName: guest.firstName,
      surname: guest.surname,
      email: guest.email,
      address: address || undefined,
      type: guest.type,
    },
  });

  const { mutate: updateGuest } = api.guests.update.useMutation({
    onSuccess: (data) => {
      toast({
        description: "Account updated",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: error.message,
      });
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    updateGuest(data);
    toast({
      title: "The data:",
      description: (
        <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  useEffect(() => {
    if (guest.availableCredits !== null) {
      form.setValue("availableCredits", Number(guest.availableCredits));
    }
  }, [form, guest]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <div className="flex justify-end ">
          <Toggle aria-label="Toggle edit">
            <Pencil
              className="h-8 w-8"
              onClick={() => setDisabled(!disabled)}
            />
          </Toggle>
        </div>
        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID</FormLabel>
              <FormControl>
                <Input disabled={true} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input disabled={disabled} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="surname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Surname</FormLabel>
              <FormControl>
                <Input disabled={disabled} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input disabled={disabled} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel>Guest Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the Guest Type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(GuestType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
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
            name="availableCredits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Available Credits</FormLabel>
                <FormControl>
                  <Input disabled={disabled} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="space-y-2">
          <p className="font-semibold">Address</p>
          <FormField
            control={form.control}
            name="address.street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address.city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address.state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State / County</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address.postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal code</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {countries && (
            <FormField
              control={form.control}
              name="address.country"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Country</FormLabel>
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
                          {convertToNormalCase(field.value ?? "Select country")}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search country..." />
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup className="max-h-48 overflow-y-scroll">
                          {Object.entries(countries).map(([code, country]) => (
                            <CommandItem
                              value={country.name}
                              key={country.name}
                              onSelect={(value) => {
                                form.setValue("address.country", value);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  country.name === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {convertToNormalCase(country.name)}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </section>

        <div className="flex gap-4">
          <Button disabled={disabled} type="submit">
            Save
          </Button>
          <Button disabled={disabled} variant="destructive" type="submit">
            Deactivate
          </Button>
        </div>
      </form>
    </Form>
  );
}
