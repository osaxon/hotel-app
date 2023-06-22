import AdminLayout from "@/components/LayoutAdmin";
import { type NextPage } from "next";

const GuestReservationPage: NextPage<{ email: string }> = ({ email }) => {
  return (
    <AdminLayout>
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Your Stay {email}
          </h2>
        </div>
      </main>
    </AdminLayout>
  );
};

export default GuestReservationPage;
