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
import { convertToNormalCase } from "@/lib/utils";
import { useSelectedItemStore } from "@/store/selectedItemStore";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { ItemCategory } from "@prisma/client";
import { useForm } from "react-hook-form";
import * as z from "zod";
import IngredientsGrid from "./IngredientsGrid";
import { LoadingPage } from "./loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";

type ItemIngredient = {
  id: string;
  name: string;
  quantity: number;
  quantityUnit: string;
};

const FormSchema = z.object({
  name: z.string(),
  descForInvoice: z.string(),
  mixedItem: z.boolean().default(false),
  priceUSD: z
    .string()
    .refine((value) => !isNaN(parseFloat(value)), {
      message: "Price must be a valid number",
      path: ["priceUSD"],
    })
    .transform((value) => parseFloat(value)),
  happyHourPriceUSD: z
    .string()
    .refine((value) => !isNaN(parseFloat(value)), {
      message: "Happy hour price must be a valid number",
      path: ["happyHourPriceUSD"],
    })
    .transform((value) => parseFloat(value))
    .optional(),
  staffPriceUSD: z
    .string()
    .refine((value) => !isNaN(parseFloat(value)), {
      message: "Staff price must be a valid number",
      path: ["staffPriceUSD"],
    })
    .transform((value) => parseFloat(value))
    .optional(),
  category: z.nativeEnum(ItemCategory),
});

export default function NewItemForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const displayGrid = form.watch("mixedItem");

  const selectedIngredients = useSelectedItemStore(
    (state) => state.ingredients
  );

  const { mutate: addItem, status } = api.pos.addItem.useMutation({
    onSuccess: () => form.reset(),
    onError: (error) =>
      toast({
        title: "The error:",
        description: (
          <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
            <code className="text-white">{JSON.stringify(error, null, 2)}</code>
          </pre>
        ),
      }),
  });

  const {
    data: itemIngredients,
    isLoading: isLoadingIngredients,
    isError: isIngredientsError,
  } = api.pos.getIngredients.useQuery();

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const ingredients = selectedIngredients.map(
      ({ id, name, quantity, quantityUnit }) => ({
        id: id || "",
        name: name || "", // Provide a default value when `name` is null
        quantity: Number(quantity),
        quantityUnit: quantityUnit || "", // Provide a default value when `quantityUnit` is null
      })
    );

    const parsedData = {
      ...data,
      priceUSD: Number(data.priceUSD),
      happyHourPriceUSD: Number(data.happyHourPriceUSD),
      ingredients,
    };

    addItem(parsedData);

    toast({
      title: "The data:",
      description: (
        <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
          <code className="text-white">
            {JSON.stringify(parsedData, null, 2)}
          </code>
        </pre>
      ),
    });
  }

  if (status === "loading") return <LoadingPage />;

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
              <FormLabel>Item Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
              <FormDescription>
                This is how the item will appear on the POS item selection menu.
              </FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="descForInvoice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invoice label</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
              <FormDescription>
                This is how the item will appear on on the invoice.
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem className="w-1/3">
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(ItemCategory).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {convertToNormalCase(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-4 md:flex-row">
          <FormField
            control={form.control}
            name="priceUSD"
            render={({ field }) => (
              <FormItem className="w-1/3">
                <FormLabel>Price USD</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="happyHourPriceUSD"
            render={({ field }) => (
              <FormItem className="w-1/3">
                <FormLabel>Happy Hour Price USD</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="staffPriceUSD"
            render={({ field }) => (
              <FormItem className="w-1/3">
                <FormLabel>Staff Price USD</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="mixedItem"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Mixed Item</FormLabel>
                <FormDescription>
                  Enable to create an item that uses 1 or more ingredients.
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

        {displayGrid && itemIngredients && (
          <>
            <IngredientsGrid itemIngredients={itemIngredients} />
          </>
        )}

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
