import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const brands = [
  { id: 1, name: "PetPrime", items: 64 },
  { id: 2, name: "Furever", items: 18 },
  { id: 3, name: "CalmPaws", items: 11 }
];

export default function CatalogBrandsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Catalog · Brands</h1>
        <p className="text-muted-foreground text-sm">Create or rename brands via `/api/brand` (admin role required).</p>
      </div>
      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Brands</CardTitle>
            <CardDescription>Keep brand taxonomy tidy for marketing and filtering.</CardDescription>
          </div>
          <Button>Create brand</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>#{brand.id}</TableCell>
                  <TableCell>{brand.name}</TableCell>
                  <TableCell className="text-right">{brand.items}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      Rename
                    </Button>
                    <Button variant="ghost" size="sm">
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
