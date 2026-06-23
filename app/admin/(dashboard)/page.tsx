import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getAdminPallets } from "@/lib/data/pallets-source";
import { getAdminOrders } from "@/lib/data/orders-source";
import { getCategories } from "@/lib/data/categories-source";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [pallets, orders, categories] = await Promise.all([
    getAdminPallets(),
    getAdminOrders(),
    getCategories(),
  ]);
  return <AdminDashboard pallets={pallets} orders={orders} categories={categories} />;
}
