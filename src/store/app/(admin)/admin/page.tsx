export default function AdminOverviewPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold leading-tight">Welcome to the admin dashboard</h1>
        <p className="text-muted-foreground text-sm">
          This simple landing page is a placeholder while we design richer dashboards. Use the navigation to access
          catalog tools, orders, customers, and settings.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6 text-sm leading-relaxed text-muted-foreground">
        <p>
          Need ideas? Start by reviewing the orders queue or managing catalog items.
          As data integrations mature we can reintroduce charts, KPIs, and alerts here.
        </p>
      </div>
    </div>
  );
}
