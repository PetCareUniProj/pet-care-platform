import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const categories = [
  { id: 1, name: "Food", items: 94 },
  { id: 2, name: "Accessories", items: 51 },
  { id: 3, name: "Furniture", items: 17 }
];

export default function CatalogCategoriesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Catalog · Categories</h1>
        <p className="text-muted-foreground text-sm">Categories power storefront filters and merchandising.</p>
      </div>
      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Backed by `/api/category` endpoints.</CardDescription>
          </div>
          <Button>Create category</Button>
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
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>#{category.id}</TableCell>
                  <TableCell>{category.name}</TableCell>
                  <TableCell className="text-right">{category.items}</TableCell>
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
