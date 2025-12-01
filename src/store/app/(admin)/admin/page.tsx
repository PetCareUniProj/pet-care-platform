import { ArrowUpRight, PackageOpen, ShoppingBag, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

const metrics = [
  {
    label: "Orders today",
    value: "128",
    delta: "+14% vs yesterday",
    icon: ShoppingBag,
    tone: "text-emerald-500"
  },
  {
    label: "Revenue",
    value: "$18.4k",
    delta: "+8% vs target",
    icon: ArrowUpRight,
    tone: "text-primary"
  },
  {
    label: "Low-stock SKUs",
    value: "23",
    delta: "6 awaiting restock",
    icon: PackageOpen,
    tone: "text-amber-500"
  },
  {
    label: "New customers",
    value: "42",
    delta: "this week",
    icon: Users,
    tone: "text-sky-500"
  }
];

const queue = [
  { order: "#48214", customer: "R. Ross", status: "Awaiting validation", eta: "4m" },
  { order: "#48213", customer: "K. Torres", status: "Paid", eta: "9m" },
  { order: "#48210", customer: "C. Diaz", status: "Awaiting stock", eta: "20m" },
  { order: "#48198", customer: "J. Wu", status: "Ready to ship", eta: "32m" }
];

const restock = [
  { sku: "DOG-PRM-16", name: "Premium Dog Food", stock: 12, threshold: 25 },
  { sku: "CAT-BWL-04", name: "Stoneware Cat Bowl", stock: 6, threshold: 15 },
  { sku: "DOG-LSH-09", name: "Reflective Leash", stock: 3, threshold: 20 }
];

export default function AdminOverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold leading-tight">Operations dashboard</h1>
        <p className="text-muted-foreground text-sm">Monitor orders, catalog health, and key admin tasks in one place.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader>
              <CardDescription>{metric.label}</CardDescription>
              <CardTitle className="text-3xl font-bold">{metric.value}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground flex items-center gap-2">
              <metric.icon className={`${metric.tone} size-4`} />
              <span>{metric.delta}</span>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Fulfillment queue</CardTitle>
                <CardDescription>Events that need admin attention right now.</CardDescription>
              </div>
              <Badge variant="secondary">Admin action</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">SLA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queue.map((item) => (
                  <TableRow key={item.order}>
                    <TableCell>{item.order}</TableCell>
                    <TableCell>{item.customer}</TableCell>
                    <TableCell>
                      <Badge variant={item.status.includes("Awaiting") ? "destructive" : "secondary"}>{item.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{item.eta}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Restock alerts</CardTitle>
            <CardDescription>Synced with Catalog thresholds.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {restock.map((alert) => (
              <div key={alert.sku} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{alert.name}</p>
                  <p className="text-muted-foreground text-xs">SKU {alert.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{alert.stock}</p>
                  <p className="text-muted-foreground text-xs">threshold {alert.threshold}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
