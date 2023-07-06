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
    title: "Three Little Birds",
    href: "/dashboard",
    description: "Main admin dashboard",
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
                  <Link
                    key={item.title}
                    href={item.href}
                    className="text-xl font-bold"
                  >
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
