import InfoBanner from "@/components/InfoBanner";
import AdminLayout from "@/components/LayoutAdmin";
import NewIngredientForm from "@/components/NewIngredientForm";
import NewItemForm from "@/components/NewItemForm";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Beer, ChefHat } from "lucide-react";
import type { NextPage } from "next";
import { useState } from "react";

type ItemTypes = "INGREDIENT" | "ITEM";

const NewItemPage: NextPage = () => {
  const [itemType, setItemType] = useState<ItemTypes>("ITEM");
  return (
    <AdminLayout>
      <section className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Add Item</h2>
        </div>
        {itemType === "ITEM" ? (
          <InfoBanner
            text={
              "Use this form to create a new Item in the database. Mixed Items are created by adding Ingredients to the Item."
            }
          />
        ) : (
          <InfoBanner
            text={
              "An Ingredient is a measurement of an Item e.g. 'House Gin - Single Measure' is an Ingredient which uses House Gin as the Item. A mixed Item can then be created using the Ingredients which ensures stock levels update according to how much is used in the Item."
            }
          />
        )}

        <RadioGroup
          defaultValue="item"
          className="grid w-full grid-cols-2 gap-4 md:w-2/3"
        >
          <Label
            htmlFor="item"
            onFocus={() => setItemType("ITEM")}
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
          >
            <RadioGroupItem value="item" id="item" className="sr-only" />
            <Beer />
            <p>Item</p>
          </Label>
          <Label
            htmlFor="ingredient"
            onFocus={() => setItemType("INGREDIENT")}
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
          >
            <RadioGroupItem
              value="ingredient"
              id="ingredient"
              className="sr-only"
            />
            <ChefHat />
            Ingredient
          </Label>
        </RadioGroup>
        <section>
          {itemType === "ITEM" ? <NewItemForm /> : <NewIngredientForm />}
        </section>
      </section>
    </AdminLayout>
  );
};

export default NewItemPage;
