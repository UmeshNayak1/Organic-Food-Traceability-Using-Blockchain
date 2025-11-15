import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, ArrowRight, Calendar, Package } from "lucide-react";
import { z } from "zod";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

const exitSchema = z.object({
  entry_product_id: z.string().min(1, "Please select an entry product"),
  quantity: z.number().positive("Quantity must be positive"),
  assigned_to: z.string().optional(),
  notes: z.string().max(500).optional(),
});

interface ExitProductsProps {
  userId: string;
}

const ExitProducts = ({ userId }: ExitProductsProps) => {
  const [exits, setExits] = useState<any[]>([]);
  const [entryProducts, setEntryProducts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      /** 1️⃣ Load exit_products */
      const { data: exitData, error: exitErr } = await supabase
        .from("exit_products")
        .select("id, user_id, entry_product_id, assigned_to, quantity, notes, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (exitErr) throw exitErr;

      /** 2️⃣ Load entry_products */
      const { data: entryData, error: entryErr } = await supabase
        .from("entry_products")
        .select("id, batch_number, product_id")
        .eq("user_id", userId);

      if (entryErr) throw entryErr;

      /** 3️⃣ Load all products */
      const { data: productData, error: productErr } = await supabase
        .from("products")
        .select("id, name");

      if (productErr) throw productErr;

      /** 4️⃣ Load all profiles */
      const { data: userData, error: userErr } = await supabase
        .from("profiles")
        .select("id, full_name");

      if (userErr) throw userErr;

      /** 5️⃣ Build lookup maps */
      const entryMap = new Map(entryData?.map((e) => [e.id, e]));
      const productMap = new Map(productData?.map((p) => [p.id, p]));
      const userMap = new Map(userData?.map((u) => [u.id, u]));

      /** 6️⃣ Merge everything into exit rows */
      const mergedExits = (exitData || []).map((exit) => {
        const entry = entryMap.get(exit.entry_product_id);
        const product = entry ? productMap.get(entry.product_id) : null;
        const assignedUser = exit.assigned_to ? userMap.get(exit.assigned_to) : null;

        return {
          ...exit,
          entry: entry || null,
          product: product || null,
          assigned_to_user: assignedUser || null,
        };
      });

      setExits(mergedExits);
      setEntryProducts(entryData || []);
      setProducts(productData || []);
      setUsers(userData || []);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load data");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const payload = {
      entry_product_id: selectedEntry,
      quantity: Number(formData.get("quantity")),
      assigned_to: selectedUser || null,
      notes: (formData.get("notes") as string) || "",
    };

    try {
      exitSchema.parse(payload);
      setLoading(true);

      const { error } = await supabase.from("exit_products").insert({
        ...payload,
        user_id: userId,
      });

      if (error) throw error;

      toast.success("Exit product added successfully");
      setShowForm(false);
      setSelectedEntry("");
      setSelectedUser("");
      e.currentTarget.reset();
      fetchData();
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      } else {
        toast.error("Failed to add exit product");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Exit Products</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Exit
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Entry Product *</Label>
                <Select value={selectedEntry} onValueChange={setSelectedEntry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entry product" />
                  </SelectTrigger>
                  <SelectContent>
                    {entryProducts.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {products.find((p) => p.id === e.product_id)?.name} — Batch: {e.batch_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input name="quantity" type="number" step="0.01" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Transferred To</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea name="notes" placeholder="Additional notes..." rows={3} />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Exit"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Exit List */}
      <div className="space-y-4">
        {exits.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No exit products yet</p>
          </Card>
        ) : (
          exits.map((exit) => (
            <Card key={exit.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="w-5 h-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {exit.product?.name ?? "Unknown Product"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Batch: {exit.entry?.batch_number}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-medium">Qty: {exit.quantity}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t">
                    {exit.assigned_to_user?.full_name && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Transferred To</p>
                        <p className="text-sm font-medium">{exit.assigned_to_user.full_name}</p>
                      </div>
                    )}

                    {exit.created_at && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Date</p>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(exit.created_at), "MMM dd, yyyy")}
                        </div>
                      </div>
                    )}
                  </div>

                  {exit.notes && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Notes</p>
                      <p className="text-sm">{exit.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ExitProducts;
