import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const steps = [
  { step: "Payment check", waits: 6, avg: "03:11" },
  { step: "Stock reservation", waits: 12, avg: "06:42" },
  { step: "Label creation", waits: 4, avg: "02:01" }
];

export default function FulfillmentQueuePage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Fulfillment queue</h1>
        <p className="text-muted-foreground text-sm">Understand where orders are blocked before they can be shipped.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Workflow pressure</CardTitle>
          <CardDescription>Hook this widget to Ordering integration events to monitor SLA health.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Step</TableHead>
                <TableHead>Orders waiting</TableHead>
                <TableHead>Avg. time in step</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {steps.map((step) => (
                <TableRow key={step.step}>
                  <TableCell>{step.step}</TableCell>
                  <TableCell>{step.waits}</TableCell>
                  <TableCell>{step.avg}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
