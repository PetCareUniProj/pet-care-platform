import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PriceBooksPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Catalog · Price books</h1>
        <p className="text-muted-foreground text-sm">Coming soon: advanced pricing presets for promos.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Roadmap</CardTitle>
          <CardDescription>Needs backend support for tiered pricing before UI can ship.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-4 text-sm text-muted-foreground">
            <li>Expose price-book entity via Catalog service.</li>
            <li>Secure endpoints with `Admin` policy.</li>
            <li>Integrate UI forms for tier creation.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
