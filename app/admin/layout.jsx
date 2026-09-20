import { getSession } from "@/lib/auth";
import AdminSidebar from "@/components/admin/Sidebar";
import { AdminPathProvider } from "@/components/admin/AdminPathContext";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDataProvider from "@/components/admin/AdminDataProvider";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return <AdminLogin />;
  }

  const adminPath = process.env.ADMIN_PATH || "admin";
  const kitchenPath = process.env.KITCHEN_PATH || "kitchen";

  return (
    <AdminPathProvider value={{ adminPath, kitchenPath }}>
      <AdminDataProvider>
        <div className="min-h-screen bg-cream flex flex-col md:flex-row overflow-x-[clip]">
          <AdminSidebar adminPath={adminPath} kitchenPath={kitchenPath} />
          <main className="flex-1 min-w-0 px-4 md:px-8 pt-5 md:pt-8 pb-24 md:pb-8">
            <AdminShell />
          </main>
        </div>
      </AdminDataProvider>
    </AdminPathProvider>
  );
}
