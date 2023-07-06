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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { convertToNormalCase } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ItemCategory, Prisma } from "@prisma/client";
import { AlertTriangle, Pencil } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Checkbox } from "./ui/checkbox";
import { Toggle } from "./ui/toggle";

type ItemIngredient = {
  id: string;
  name: string;
  quantity: number;
  quantityUnit: string;
};

const FormSchema = z.object({
  name: z.string(),
  active: z.boolean(),
  stockManaged: z.boolean(),
  displayOnPOS: z.boolean(),
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
      message: "Price must be a valid number",
      path: ["happyHourPriceUSD"],
    })
    .transform((value) => parseFloat(value))
    .optional(),
  staffPriceUSD: z
    .string()
    .refine((value) => !isNaN(parseFloat(value)), {
      message: "Price must be a valid number",
      path: ["staffPriceUSD"],
    })
    .transform((value) => parseFloat(value))
    .optional(),
  category: z.nativeEnum(ItemCategory),
});

export default function ItemForm({
  item,
}: {
  item: Prisma.ItemGetPayload<{
    include: { ingredients: { include: { ingredient: true } } };
  }>;
}) {
  const [disabled, setDisabled] = useState<boolean>(true);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: item.name,
      priceUSD: Number(item.priceUSD),
      happyHourPriceUSD: Number(item.happyHourPriceUSD),
      staffPriceUSD: Number(item.staffPriceUSD),
      category: item.category,
      active: item.active,
      stockManaged: item.stockManaged,
      displayOnPOS: item.displayOnPOS,
    },
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Name</FormLabel>
              <FormControl>
                <Input disabled={disabled} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-4 md:flex-row">
          <FormField
            control={form.control}
            name="priceUSD"
            render={({ field }) => (
              <FormItem className="md:w-1/3">
                <FormLabel>Price USD</FormLabel>
                <FormControl>
                  <Input disabled={disabled} type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="happyHourPriceUSD"
            render={({ field }) => (
              <FormItem className="md:w-1/3">
                <FormLabel>Happy Hour Price USD</FormLabel>
                <FormControl>
                  <Input disabled={disabled} type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="staffPriceUSD"
            render={({ field }) => (
              <FormItem className="md:w-1/3">
                <FormLabel>Staff Price Price USD</FormLabel>
                <FormControl>
                  <Input disabled={disabled} type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem className="w-1/3">
              <FormLabel>Category</FormLabel>
              <Select
                disabled={disabled}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
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
        <div>
          <div>
            <h3 className="my-4 text-lg font-bold">Item Options</h3>
          </div>
          <div className="rounded-md border">
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      disabled={true}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      If an item is no longer required you can deactivate below.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stockManaged"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      disabled={disabled || item.ingredients.length > 0}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Track Inventory</FormLabel>
                    <FormDescription>
                      Controls whether an items stock levels are tracked.{" "}
                      {item.ingredients.length > 0 && (
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          Disabled for mixed items.
                        </span>
                      )}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="displayOnPOS"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                  <FormControl>
                    <Checkbox
                      disabled={disabled}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Display on POS</FormLabel>
                    <FormDescription>
                      Controls whether an item can be purchased at the bar.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        {item.ingredients.length > 0 && (
          <div>
            <h3 className="my-4 text-lg font-bold">Ingredients</h3>
            <div className="flex flex-col gap-4">
              {item.ingredients.map((item) => (
                <div className="flex flex-col rounded border p-4" key={item.id}>
                  <p>{item.name}</p>
                  <p>
                    {item.quantity?.toString()} {item.quantityUnit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

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
