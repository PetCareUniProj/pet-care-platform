import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CustomersPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Customers</h1>
        <p className="text-muted-foreground text-sm">CRM insights will plug in once a dedicated service ships.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>Requires new backend endpoints for customer metadata and segmentation.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Track Keycloak identities, subscription status, and LTV from this workspace. For now keep managing users directly in Keycloak.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
