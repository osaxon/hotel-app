/* eslint-disable @next/next/no-html-link-for-pages */
import Link from "next/link";
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
    href: "/orders",
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
    href: "/bookings",
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

export function NavAdmin({}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav className="flex justify-between border px-8 py-4">
      <ul className="flex gap-2">
        {menuItems &&
          menuItems.map((item) => {
            return (
              <li key={item.title}>
                {item.href && (
                  <Link key={item.title} href={item.href} className="font-bold">
                    {item.title}
                  </Link>
                )}
              </li>
            );
          })}
      </ul>

      <UserNav />
    </nav>
  );
}
