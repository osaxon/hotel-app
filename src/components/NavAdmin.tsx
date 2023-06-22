/* eslint-disable @next/next/no-html-link-for-pages */
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { UserNav } from "./UserNav";

type MenuItem = {
  title: string;
  href?: string;
  description: string;
};

type MenuItemsWithChildren = MenuItem & { children?: MenuItem[] };

const menuItems: MenuItemsWithChildren[] = [
  {
    title: "Home",
    href: "/dashboard",
    description: "Main admin dashboard",
  },
  {
    title: "Bar & Kitchen",
    description: "View and create orders for the bar & kitchen.",
    children: [
      {
        title: "Bar Orders",
        href: "/orders",
        description: "View & create orders for the bar.",
      },
      {
        title: "Items & Stock",
        href: "/items",
        description: "View & manage inventory.",
      },
    ],
  },
  {
    title: "Hotel",
    description: "View and manage reservations and guests.",
    children: [
      {
        title: "Bookings",
        href: "/bookings",
        description: "Upcoming & active reservations.",
      },
      {
        title: "Rooms",
        href: "/room",
        description: "View and manage room information.",
      },
    ],
  },
];

const mobileMenu: MenuItem[] = [
  {
    title: "Home",
    href: "/dashboard",
    description: "Main admin dashboard",
  },
  {
    title: "Bar & Kitchen",
    href: "/orders",
    description: "View and create orders for the bar.",
  },
];

export function NavAdmin({}: React.HTMLAttributes<HTMLElement>) {
  const router = useRouter();
  const route = router.route;
  return (
    <NavigationMenu className="flex justify-between border px-4">
      {/* LARGE VIEWPORTS ONLY */}
      <NavigationMenuList className="flex gap-2">
        {menuItems &&
          menuItems.map((item) => {
            return (
              <NavigationMenuItem key={item.title}>
                {item.href && (
                  <NavigationMenuItem>
                    <Link href={item.href} legacyBehavior passHref>
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                      >
                        {item.title}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                )}
                {item.children && (
                  <>
                    <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                    <NavigationMenuContent className="p-4">
                      <ul className="gap-3 p-4 md:w-[400px] lg:w-[500px]">
                        {item.children.map((childItem) => (
                          <ListItem
                            key={childItem.title}
                            title={childItem.title}
                            href={childItem.href}
                          >
                            {childItem.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                )}
              </NavigationMenuItem>
            );
          })}
      </NavigationMenuList>

      <UserNav />
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
