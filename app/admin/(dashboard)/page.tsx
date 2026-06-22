import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getAdminPallets } from "@/lib/data/pallets-source";
import { getAdminOrders } from "@/lib/data/orders-source";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [pallets, orders] = await Promise.all([getAdminPallets(), getAdminOrders()]);
  return <AdminDashboard pallets={pallets} orders={orders} />;
}
