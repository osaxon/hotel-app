import CurrentGuestsCard from "@/components/CurrentGuestsCard";
import AdminLayout from "@/components/LayoutAdmin";
import { Overview } from "@/components/Overview";
import { RecentSales } from "@/components/RecentSales";
import UpcomingReservationsCard from "@/components/UpcomingReservationsCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { env } from "@/env.mjs";
import { generateSSGHelper } from "@/server/helpers/ssgHelper";
import { api } from "@/utils/api";
import clerkClient from "@clerk/clerk-sdk-node";
import { buildClerkProps, getAuth } from "@clerk/nextjs/server";
import { BedDouble, Beer, Calculator, Receipt, Users } from "lucide-react";
import { type GetServerSideProps } from "next";
import Link from "next/link";

const menuItems = [
  {
    label: "Bar",
    href: "/pos",
    desc: "Create orders for the bar & kitchen.",
    icon: Beer,
  },
  {
    label: "Inventory",
    href: "/items",
    desc: "View item stock levels. Manage items for sale.",
    icon: Calculator,
  },
  {
    label: "Rooms & Bookings",
    href: "/reservations",
    desc: "View & create reservations for guests. Manage reservation types. Manage rooms.",
    icon: BedDouble,
  },
  {
    label: "Invoices",
    href: "/invoices",
    desc: "View invoices for guests and accounts.",
    icon: Receipt,
  },
  {
    label: "Accounts",
    href: "/accounts",
    desc: "Create & manage accounts for guests and staff.",
    icon: Users,
  },
];

export default function DashboardPage() {
  const {
    data: rooms,
    isLoading: isLoadingRooms,
    isError: isRoomsError,
  } = api.rooms.getAll.useQuery();

  if (isRoomsError) return <>Theres been an error</>;

  return (
    <>
      <AdminLayout>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          </div>
          <Tabs defaultValue={"menu"} className="space-y-4">
            <TabsList>
              <TabsTrigger value="menu">Menu</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            </TabsList>

            {/* Overview tab */}
            <TabsContent value="dashboard" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <CurrentGuestsCard />
                <UpcomingReservationsCard />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-full lg:col-span-4">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Reservations by Month</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <Overview />
                  </CardContent>
                </Card>
                <Card className="col-span-full lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Bar Orders</CardTitle>
                    <CardDescription>Last 24 hours.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentSales />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="menu" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                {menuItems &&
                  menuItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <Card className="h-full">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            {item.label}
                            {<item.icon />}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p>{item.desc}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { userId } = getAuth(ctx.req);
  const ssg = generateSSGHelper(userId ?? "");

  // Get list of admin members
  const members = await clerkClient.organizations.getOrganizationMembershipList(
    {
      organizationId: env.CLERK_ADMIN_ORG,
    }
  );

  const filteredMembers = members.map((mem) => {
    return {
      id: mem.publicUserData?.userId,
      name: mem.publicUserData?.firstName,
    };
  });

  const isAdmin = filteredMembers.some((member) => member.id === userId);

  if (!isAdmin) {
    return {
      redirect: {
        destination: "/", // Redirect to a non-admin page
        permanent: false,
      },
    };
  }

  await ssg.rooms.getAll.prefetch();

  return {
    props: {
      // Your admin data here
      ...buildClerkProps(ctx.req),
      trpcState: ssg.dehydrate(),
    },
  };
};
