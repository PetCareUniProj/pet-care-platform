import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrderById } from "@/lib/api/ordering";
import { OrdersFolderList } from "@/app/(admin)/admin/orders/orders-folders";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface OrderDetailsPageProps {
  params: { orderId: string };
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const aParams = await params; 
  const orderId = Number(aParams.orderId);
  if (!Number.isFinite(orderId) || orderId <= 0) {
    notFound();
  }

  try {
    const order = await getOrderById(orderId);
    if (!order) {
      notFound();
    }

    return (
      <div className="space-y-4">
        <header className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Order #{order.id}</h1>
            <p className="text-muted-foreground text-sm">Inspect the complete payload returned by `/api/orders/{"{"}id{"}"}`.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin/orders">Back to order management</Link>
          </Button>
        </header>
        <Card>
          <CardHeader>
            <CardTitle>Order overview</CardTitle>
            <CardDescription>Ship if the order is paid or follow links to related user records.</CardDescription>
          </CardHeader>
          <CardContent>
            <OrdersFolderList orders={[order]} currentPath={`/admin/orders/order/${order.id}`} showUserLinks />
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
