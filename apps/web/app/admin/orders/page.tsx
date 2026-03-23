import { OrderControlClient } from "@/components/admin/order-control-client";
import { requireAdminPageRole } from "@/lib/admin/page-auth";

export default async function AdminOrdersPage() {
  await requireAdminPageRole("/admin/orders");
  return <OrderControlClient />;
}
