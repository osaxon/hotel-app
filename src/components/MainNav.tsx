import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/router";

const routes = [
  {
    label: "Overview",
    href: "/dashboard",
  },
  {
    label: "Rooms",
    href: "/room",
  },
  {
    label: "Bookings",
    href: "/bookings",
  },
  {
    label: "Bar & Kitchen",
    href: "/orders",
  },
  {
    label: "Items & Stock",
    href: "/items",
  },
];

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const router = useRouter();
  const route = router.route;
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {routes.map(({ label, href }, i) => (
        <Link
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            route === href ? "text-primary" : "text-muted-foreground"
          )}
          key={i}
          href={href}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
