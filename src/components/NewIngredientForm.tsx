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
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import LoadingSpinner from "./loading";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

const FormSchema = z.object({
  name: z.string(),
  itemId: z.string(),
  quantity: z
    .union([z.string().nullable(), z.number().min(0.005).nullable()])
    .refine((value) => value !== null && !isNaN(parseFloat(value as string)), {
      message: "Must be a valid number.",
      path: ["quantity"],
    })
    .transform((value) => parseFloat(value as string)),
  quantityUnit: z.string(),
});

export default function NewIngredientForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const {
    data: items,
    isLoading: isLoadingItems,
    isError: isItemsError,
  } = api.pos.getItems.useQuery();

  const selectedItem = form.watch("itemId");

  const {
    data: itemData,
    isLoading: isLoadingItemData,
    status: itemDataStatus,
    fetchStatus,
  } = api.pos.getItemById.useQuery(
    { id: selectedItem },
    {
      enabled: selectedItem !== null && selectedItem !== undefined,
      onSuccess: (data) =>
        form.setValue("quantityUnit", data?.quantityUnit ?? ""),
    }
  );

  const { mutate: addIngredient } = api.pos.addIngredient.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Ingredient created",
        description: `${data.name as string} created.`,
      });
    },
    onError: (data) => {
      toast({
        title: "Error",
        variant: "destructive",
        description: `${data.shape?.message as string}`,
      });
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    addIngredient(data);
    // toast({
    //   title: "The data:",
    //   description: (
    //     <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
    //       <code className="text-white">{JSON.stringify(data, null, 2)}</code>
    //     </pre>
    //   ),
    // });
  }

  if (isLoadingItems)
    return (
      <div className="flex h-96 w-full items-center justify-center md:w-2/3">
        <LoadingSpinner size={64} />
      </div>
    );

  if (isItemsError) {
    return <div>Error retrieving data.</div>;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-6 md:w-2/3"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ingredient Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
              <FormDescription>
                This is how the item will appear on the POS item selection menu.
                It does not appear on the Invoice
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="itemId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Item</FormLabel>
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
                        ? items.find((item) => item.id === field.value)?.name
                        : "Select Item"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search item..." />
                    <CommandEmpty>No guest found.</CommandEmpty>
                    <CommandGroup className="max-h-56 overflow-y-scroll">
                      {items
                        .filter(
                          (item) =>
                            item.ingredients.length < 1 &&
                            item.category !== "FOOD" &&
                            item.category !== "TICKETS" &&
                            item.category !== "SERVICES"
                        )
                        .map((item) => {
                          return (
                            <CommandItem
                              value={item.id}
                              key={item.id}
                              onSelect={(value) => {
                                form.setValue("itemId", value);
                              }}
                            >
                              {item.name}
                            </CommandItem>
                          );
                        })}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                The Item the Ingredient uses. Orders for mixed drinks will
                update the stock levels of this Item.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Measurement</FormLabel>
                <FormControl>
                  <Input className="w-[200px]" {...field} />
                </FormControl>
                <FormDescription>
                  How much of the item is used relative to the unit size.
                  Spirits are tracked by the bottle so a single measure is 0.05
                  a bottle.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="quantityUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <FormControl>
                  <Input className="w-[200px]" disabled={true} {...field} />
                </FormControl>
                <FormDescription>
                  {fetchStatus === "fetching" &&
                  itemDataStatus !== "success" ? (
                    <LoadingSpinner size={16} />
                  ) : null}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
