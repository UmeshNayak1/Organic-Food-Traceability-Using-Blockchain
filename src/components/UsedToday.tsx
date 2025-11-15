import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, ShoppingCart } from "lucide-react";
import { getDBAdapter } from "@/lib/db-adapter";

interface UsedTodayProps {
  userId: string;
}

const UsedToday = ({ userId }: UsedTodayProps) => {
  const [usedItems, setUsedItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    entry_product_id: "",
    quantity: "",
    notes: "",
  });

  const db = getDBAdapter();

  useEffect(() => {
    fetchData();
    fetchProducts();
  }, [userId]);

  const fetchData = async () => {
    try {
      const data = await db.fetchUsedToday(userId);
      setUsedItems(data ?? []);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load data");
    }
  };

  const fetchProducts = async () => {
    try {
      const list = await db.fetchEntryProducts(userId);
      setProducts(list ?? []);
    } catch (err) {
      console.error("Fetch products error:", err);
      toast.error("Failed to load products");
    }
  };

  const handleSubmit = async () => {
    if (!form.entry_product_id) return toast.error("Select a product");
    if (!form.quantity) return toast.error("Enter quantity");

    try {
      await db.createUsedToday({
        user_id: userId,
        entry_product_id: form.entry_product_id,
        quantity: Number(form.quantity),
        notes: form.notes || null,
      });

      toast.success("Added!");
      setShowForm(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Error adding usage");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Used Today</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Usage
        </Button>
      </div>

      {showForm && (
        <Card className="p-4 space-y-4">
          <Select
            onValueChange={(v) => setForm({ ...form, entry_product_id: v })}
          >
            <SelectTrigger>Select product</SelectTrigger>
            <SelectContent>
              {products.length > 0 ? (
                products.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.product_name ?? p.products?.name ?? "Unknown"}
                  </SelectItem>
                ))
              ) : (
                <div className="px-2 py-2 text-muted-foreground">
                  No products found
                </div>
              )}
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Quantity"
            value={form.quantity}
            onChange={(e) =>
              setForm({ ...form, quantity: e.target.value })
            }
          />

          <Input
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) =>
              setForm({ ...form, notes: e.target.value })
            }
          />

          <Button className="w-full" onClick={handleSubmit}>
            Submit
          </Button>
        </Card>
      )}

      {usedItems.length === 0 && (
        <Card className="p-6 text-center">
          <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">No items used today</p>
        </Card>
      )}

      {usedItems.map((item) => (
        <Card key={item.id} className="p-4 flex items-center gap-3">
          <ShoppingCart className="w-5 h-5 text-primary" />
          <div className="font-medium">
            {item.product_name ?? item.products?.name ?? "Unnamed item"}
          </div>
          <span className="text-muted-foreground ml-auto">
            Qty: {item.quantity}
          </span>
        </Card>
      ))}
    </div>
  );
};

export default UsedToday;
