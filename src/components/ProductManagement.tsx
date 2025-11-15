import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Package } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client"; // <-- IMPORTANT

const productSchema = z.object({
  name: z.string().min(2, "Product name is required").max(100),
  description: z.string().max(500).optional(),
  category: z.string().min(2, "Category is required").max(50),
  unit: z.string().min(1, "Unit is required").max(20),
  origin: z.string().min(2, "Origin is required").max(100),
  certification: z.string().min(2, "Certification is required").max(100),
});

interface ProductManagementProps {
  userId: string;
}

const ProductManagement = ({ userId }: ProductManagementProps) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [userId]);

  // --------------------------
  // ✔ Supabase Fetch Products
  // --------------------------
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("created_by", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProducts(data || []);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      console.error("Error fetching products:", error);
      toast.error(`Failed to load products: ${message}`);
      setProducts([]);
    }
  };

  // --------------------------
  // ✔ Supabase Insert Product
  // --------------------------
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      unit: formData.get("unit") as string,
      origin: formData.get("origin") as string,
      certification: formData.get("certification") as string,
      created_by: userId,
    };

    try {
      productSchema.parse(data);
      setLoading(true);

      const { error } = await supabase.from("products").insert(data);
      if (error) throw error;

      toast.success("Product added successfully");
      setShowForm(false);
      e.currentTarget.reset();
      fetchProducts();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to add product");
      }
    } finally {
      setLoading(false);
    }
  };

  // --------------------------
  // ✔ UI Below (unchanged)
  // --------------------------
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={3} />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" name="unit" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="origin">Origin</Label>
                <Input id="origin" name="origin" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certification">Certification</Label>
                <Input id="certification" name="certification" required />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Product"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{product.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs"><span className="font-medium">Category:</span> {product.category}</p>
                  <p className="text-xs"><span className="font-medium">Origin:</span> {product.origin}</p>
                  <p className="text-xs"><span className="font-medium">Certification:</span> {product.certification}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {products.length === 0 && !showForm && (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No products yet</p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Product
          </Button>
        </Card>
      )}
    </div>
  );
};

export default ProductManagement;
