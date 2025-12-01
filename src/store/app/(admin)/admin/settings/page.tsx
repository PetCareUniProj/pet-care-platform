import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const settings = [
  { title: "Keycloak realm", detail: "pet-care-platform", status: "Connected" },
  { title: "Catalog API", detail: "https://catalog.local", status: "Healthy" },
  { title: "Ordering API", detail: "https://ordering.local", status: "Healthy" }
];

export default function AdminSettingsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Admin settings</h1>
        <p className="text-muted-foreground text-sm">Configure service URLs, API keys, and role mappings.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Service connections</CardTitle>
          <CardDescription>Backed by environment variables (`Identity__Url`, `Identity__Realm`, etc.).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.map((setting) => (
            <div key={setting.title} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">{setting.title}</p>
                <p className="text-muted-foreground text-xs">{setting.detail}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{setting.status}</Badge>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
